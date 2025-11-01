"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  File
} from "lucide-react";
import { sanitizeText } from "../lib/utils/security";

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: MessageAttachment[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newAttachments: MessageAttachment[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    
    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    // Need either message or attachments
    if ((trimmedMessage || attachments.length > 0) && !disabled) {
      // Sanitize message text
      const sanitizedMessage = trimmedMessage ? sanitizeText(trimmedMessage) : "";
      
      onSendMessage(sanitizedMessage, attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  };

  const isImage = (type: string) => type.startsWith("image/");
  const isVideo = (type: string) => type.startsWith("video/");
  const isAudio = (type: string) => type.startsWith("audio/");
  
  const getFileIcon = (type: string, name: string) => {
    if (isImage(type)) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (isVideo(type)) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (isAudio(type)) return <FileAudio className="h-5 w-5 text-green-500" />;
    
    // Check by extension
    const ext = name.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'php'].includes(ext || '')) {
      return <FileCode className="h-5 w-5 text-orange-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <FileArchive className="h-5 w-5 text-yellow-500" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    }
    
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group bg-muted rounded-lg border border-border p-2 flex items-center gap-2 max-w-[200px]"
            >
              {isImage(attachment.type) ? (
                <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 bg-background rounded flex items-center justify-center flex-shrink-0">
                  {getFileIcon(attachment.type, attachment.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="space-y-1">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            className="min-h-[60px] pr-24 bg-input border-border resize-none text-base text-accent-50 text-[rgb(255,255,255)]"
            disabled={disabled}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0 text-[rgb(255,255,255)]"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={(!message.trim() && attachments.length === 0) || disabled}
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}