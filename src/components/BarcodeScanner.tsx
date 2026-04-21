"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");

        video.onloadedmetadata = () => {
          const startScan = () => {
            const scan = () => {
              if (stopped) return;
              try {
                const result = reader.decodeFromVideoElement(video);
                if (result && !stopped) {
                  stopped = true;
                  onScan(result.getText());
                }
              } catch (e) {
                if (!(e instanceof NotFoundException)) {
                  // ignore not-found
                }
              }
              animRef.current = requestAnimationFrame(scan);
            };
            animRef.current = requestAnimationFrame(scan);
          };

          if (video.paused) {
            video.play().then(startScan).catch(startScan);
          } else {
            startScan();
          }
        };
      })
      .catch(() => setError("Camera access denied or not available."));

    return () => {
      stopped = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
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
          <video ref={videoRef} className="w-full rounded" muted playsInline />
        )}
        <p className="text-xs text-gray-400 mt-2 text-center">Point camera at barcode</p>
      </div>
    </div>
  );
}
