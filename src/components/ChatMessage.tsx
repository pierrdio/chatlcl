"use client";

import { memo } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  User, 
  FileText, 
  Download, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileCode, 
  FileArchive,
  File,
  Check,
  CheckCheck
} from "lucide-react";
import { Button } from "./ui/button";

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

type MessageStatus = 'sent' | 'delivered' | 'read';

interface ChatMessageProps {
  message: string;
  username: string;
  isCurrentUser: boolean;
  timestamp: Date;
  attachments?: MessageAttachment[];
  status?: MessageStatus;
}

// Function to generate a consistent color based on username
function getUserColor(username: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

const ChatMessageComponent = ({ message, username, isCurrentUser, timestamp, attachments, status }: ChatMessageProps) => {
  const userColor = getUserColor(username);
  const initials = username.substring(0, 2).toUpperCase();
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  };

  const isImage = (type: string) => type.startsWith("image/");
  const isVideo = (type: string) => type.startsWith("video/");
  const isAudio = (type: string) => type.startsWith("audio/");
  
  const getFileIcon = (type: string, name: string) => {
    if (isImage(type)) return <FileImage className="h-5 w-5 text-blue-500" />;
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

  const handleDownload = (attachment: MessageAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };
  
  return (
    <div className={`px-6 py-4 hover:bg-muted/20 transition-colors ${isCurrentUser ? 'bg-muted/10' : ''}`}>
      <div className={`flex gap-3 max-w-none ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={`${userColor} text-white text-xs`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 min-w-0 max-w-2xl ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm font-medium text-foreground">
              {isCurrentUser ? `${username} (Вы)` : username}
            </span>
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {message && (
            <div className={`text-foreground whitespace-pre-wrap break-words leading-relaxed mb-2 ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-md' 
                : 'bg-muted px-4 py-2 rounded-2xl rounded-tl-md'
            }`}>
              <div className="flex items-end gap-2">
                <span className="flex-1">{message}</span>
                {isCurrentUser && status && (
                  <span className={`flex-shrink-0 ${status === 'read' ? 'text-blue-300' : 'text-primary-foreground/60'}`}>
                    {status === 'sent' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => (
                <div key={attachment.id}>
                  {isImage(attachment.type) ? (
                    <div className="relative group max-w-md">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="rounded-lg border border-border max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDownload(attachment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border max-w-md cursor-pointer hover:bg-muted/80 transition-colors">
                      <div className="h-10 w-10 bg-background rounded flex items-center justify-center flex-shrink-0">
                        {getFileIcon(attachment.type, attachment.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-[rgb(153,153,153)]">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(attachment)} className="text-[rgb(255,255,255)]"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {/* Show status after attachments if no message text */}
              {!message && isCurrentUser && status && (
                <div className={`flex justify-end mt-1 ${status === 'read' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {status === 'sent' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);