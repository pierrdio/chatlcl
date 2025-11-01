"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface ConferenceRoomProps {
  onClose: () => void;
}

export function ConferenceRoom({ onClose }: ConferenceRoomProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h2 className="text-lg">Видеоконференция</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Conference iframe */}
        <div className="flex-1 relative bg-black">
          <iframe
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            src="https://10.1.100.126/UpsetVersionsDressUnfortunately"
            className="absolute inset-0 w-full h-full border-0"
            title="Видеоконференция"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h2 className="text-lg text-[rgb(255,255,255)]">Видеоконференция</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-[rgb(255,255,255)]"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-[rgb(255,255,255)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Conference iframe */}
      <div className="flex-1 relative bg-black">
        <iframe
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          src="https://10.1.100.126/UpsetVersionsDressUnfortunately"
          className="absolute inset-0 w-full h-full border-0"
          title="Видеоконференция"
        />
      </div>
    </div>
  );
}
