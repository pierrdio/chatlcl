"use client";

import { useState, useEffect } from "react";
import { ClaudeSidebar, ChatHistory } from "./ClaudeSidebar";
import { ChatContainer, Chat as ChatType, Message } from "./ChatContainer";
import { ClaudeWelcome } from "./ClaudeWelcome";
import { ConferenceRoom } from "./ConferenceRoom";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Menu, Video } from "lucide-react";
import { useAuth } from "./AuthContext";

export function Chat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showConference, setShowConference] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load chats from API on mount
  useEffect(() => {
    if (user) {
      loadChats();
      
      // Poll for new messages every 2 seconds
      const interval = setInterval(loadChats, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })));
      }
    } catch (error) {
      console.error('Load chats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  const generateChatHistory = (): ChatHistory[] => {
    return chats.map(chat => {
      // Count unread messages (messages from other users that current user hasn't read)
      const unreadCount = chat.messages.filter(msg => 
        msg.userId !== user?.id && !(msg.readBy || []).includes(user?.id || '')
      ).length;
      
      return {
        id: chat.id,
        title: chat.title,
        lastMessage: chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1].text 
          : "Нет сообщений",
        timestamp: chat.updatedAt,
        messageCount: chat.messages.length,
        unreadCount: unreadCount,
      };
    });
  };

  const handleNewChat = async () => {
    const roomName = prompt("Введите название комнаты:");
    if (!roomName || !roomName.trim()) return;

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: `# ${roomName.trim()}` }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadChats();
        setCurrentChatId(data.chat.id);
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    
    // Auto-open conference when selecting conference room
    const selectedChat = chats.find(c => c.id === chatId);
    if (selectedChat?.title === '# Конференция') {
      setShowConference(true);
    } else {
      setShowConference(false);
    }
    
    // Mark messages as read
    if (user) {
      try {
        await fetch('/api/messages/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ chatId }),
        });
        
        // Reload to update read status
        setTimeout(loadChats, 500);
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
  };

  const handleUpdateChat = async (updatedChatOrUpdater: ChatType | ((prevChat: ChatType) => ChatType)) => {
    // This will trigger a reload from the API
    await loadChats();
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        if (currentChatId === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
        }
        await loadChats();
      }
    } catch (error) {
      console.error('Delete chat error:', error);
    }
  };

  const handleSendMessage = (messageText: string) => {
    if (!currentChat) {
      handleNewChat();
      return;
    }
  };

  const handleWelcomeMessage = async (messageText: string) => {
    if (!user) return;
    
    // If no chat selected, select the first available chat
    if (chats.length > 0) {
      const firstChat = chats[0];
      setCurrentChatId(firstChat.id);
      
      // Send the message
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId: firstChat.id,
            text: messageText,
          }),
        });

        if (response.ok) {
          await loadChats();
        }
      } catch (error) {
        console.error('Send message error:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 mx-auto flex items-center justify-center">
            <span className="text-white text-2xl">C</span>
          </div>
          <p className="text-muted-foreground">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ClaudeSidebar
          chatHistory={generateChatHistory()}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar toggle */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
            <SidebarTrigger className="h-8 w-8 p-0 hover:bg-accent text-[rgba(255,255,255,1)]">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            
            {currentChat && (
              <>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <h1 className="font-medium text-foreground truncate">{currentChat.title}</h1>
                  <span className="text-xs text-muted-foreground">
                    {currentChat.messages.length} {
                      currentChat.messages.length === 1 ? 'сообщение' : 
                      currentChat.messages.length < 5 ? 'сообщения' : 'сообщений'
                    }
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConference(!showConference)}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  {showConference ? 'Закрыть конференцию' : 'Видеозвонок'}
                </Button>
              </>
            )}
          </div>
          
          {showConference ? (
            <ConferenceRoom onClose={() => setShowConference(false)} />
          ) : currentChat ? (
            <ChatContainer
              currentChat={currentChat}
              onUpdateChat={handleUpdateChat}
            />
          ) : (
            <ClaudeWelcome onSendMessage={handleWelcomeMessage} />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
