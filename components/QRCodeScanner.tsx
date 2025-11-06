import React, { useRef, useEffect, useCallback } from 'react';
import { XIcon } from './icons';

// Since jsQR is loaded from a script tag in index.html, we declare it to TypeScript.
declare const jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;


interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            onScan(code.data);
            return; // Stop scanning once a code is found
          }
        } catch (error) {
          console.error("jsQR error:", error);
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
          await videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
        onClose();
      }
    };
    
    startScan();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tick, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover -z-10" playsInline />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-[60vw] h-[60vw] max-w-[300px] max-h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]" />
        <p className="absolute bottom-20 text-white text-lg text-center px-4">Aponte a câmera para o QR Code</p>
      </div>

      <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-3 rounded-full">
        <XIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default QRCodeScanner;
