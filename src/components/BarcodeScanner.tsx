"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scannedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, _err, controls) => {
        if (!controlsRef.current) controlsRef.current = controls;
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          controls.stop();
          onScan(result.getText());
        }
      })
      .catch((err) => {
        // Ignore AbortError from video play interruption
        if (err?.name !== "AbortError") {
          setError("Camera access denied or not available.");
        }
      });

    return () => {
      scannedRef.current = true;
      controlsRef.current?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Scan Barcode</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <video ref={videoRef} className="w-full rounded" />
        )}
        <p className="text-xs text-gray-400 mt-2 text-center">Point camera at barcode</p>
      </div>
    </div>
  );
}
