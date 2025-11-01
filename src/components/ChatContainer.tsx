"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "./AuthContext";

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: Date;
  attachments?: MessageAttachment[];
  status?: MessageStatus;
  readBy?: string[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  participants?: string[];
}

interface ChatContainerProps {
  currentChat: Chat | null;
  onUpdateChat: (chat: Chat) => void;
}

function calculateMessageStatus(message: Message, currentUserId: string, totalParticipants: number = 3): MessageStatus {
  if (message.userId === currentUserId) {
    const readByCount = message.readBy?.length || 0;
    
    if (readByCount === 0) {
      return 'sent';
    }
    
    return readByCount > 0 ? 'read' : 'sent';
  }
  
  if (message.readBy?.includes(currentUserId)) {
    return 'read';
  }
  
  return message.status || 'sent';
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return 'Сегодня';
  } else if (isSameDay(date, yesterday)) {
    return 'Вчера';
  } else {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    if (date.getFullYear() !== today.getFullYear()) {
      return `${day} ${month} ${date.getFullYear()}`;
    }
    
    return `${day} ${month}`;
  }
}

function groupMessagesByDate(messages: Message[]): Array<{ date: Date; messages: Message[] }> {
  const groups: Array<{ date: Date; messages: Message[] }> = [];
  
  messages.forEach(message => {
    const messageDate = new Date(message.timestamp);
    messageDate.setHours(0, 0, 0, 0);
    
    const existingGroup = groups.find(group => isSameDay(group.date, messageDate));
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        messages: [message]
      });
    }
  });
  
  return groups;
}

export function ChatContainer({ currentChat, onUpdateChat }: ChatContainerProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages.length]);

  const handleSendMessage = async (messageText: string, attachments?: MessageAttachment[]) => {
    if (!currentChat || !user) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId: currentChat.id,
          text: messageText,
        }),
      });

      if (response.ok) {
        // The parent component will reload chats
        onUpdateChat(currentChat);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  if (!currentChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="max-w-md">
          <h2 className="text-xl mb-4 text-foreground">Добро пожаловать</h2>
          <p className="text-muted-foreground mb-6">
            Выберите комнату в боковой панели, чтобы начать общение.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(currentChat.messages);

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 bg-background">
        <div className="max-w-3xl mx-auto bg-background min-h-full pb-4">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date.getTime()}>
              <div className="flex items-center justify-center my-4 px-4">
                <div className="flex-1 h-px bg-border"></div>
                <div className="px-4 py-1 text-xs text-muted-foreground bg-background">
                  {formatDateLabel(group.date)}
                </div>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              
              {group.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  username={message.username}
                  isCurrentUser={message.userId === user?.id}
                  timestamp={message.timestamp}
                  attachments={message.attachments}
                  status={user ? calculateMessageStatus(message, user.id) : message.status}
                />
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 p-6 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={false} />
        </div>
      </div>
    </div>
  );
}
