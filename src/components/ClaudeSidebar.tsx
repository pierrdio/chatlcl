"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import {
  MessageSquare,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  unreadCount: number;
}

interface ClaudeSidebarProps {
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ClaudeSidebar({
  chatHistory,
  currentChatId,
  onSelectChat,
  onDeleteChat,
}: ClaudeSidebarProps) {
  const { user, logout } = useAuth();

  // Mock data for starred and recent items to match the image
  const starredItems = chatHistory.filter(
    (_, index) => index < 2,
  );

  const recentItems = chatHistory;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Сегодня";
    if (days === 1) return "Вчера";
    if (days < 7) return `${days}д`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <Sidebar className="w-64 border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-medium text-sidebar-foreground">
            Чат
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Rooms section */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                  <MessageSquare className="h-3 w-3" />
                  Комнаты
                </div>
              </div>
              <div className="space-y-1">
                {chatHistory.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-sidebar-foreground/50">
                    Пока нет комнат
                  </p>
                ) : (
                  chatHistory.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-md truncate flex items-center gap-2 ${
                        currentChatId === item.id
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : item.unreadCount > 0
                          ? "text-sidebar-foreground font-medium hover:bg-sidebar-accent"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                      }`}
                      onClick={() => onSelectChat(item.id)}
                    >
                      <span className="flex-1 truncate">
                        {item.title}
                      </span>
                      {item.unreadCount > 0 && (
                        <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                          {item.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full hover:bg-sidebar-accent rounded-md p-2 transition-colors">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.username || "Пользователь"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/70 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>{user?.username}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}