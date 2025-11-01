"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import {
  Search,
  Code,
  PenTool,
  Target,
  GraduationCap,
  Grid3X3,
  Send,
  Sparkles,
} from "lucide-react";

interface ClaudeWelcomeProps {
  onSendMessage: (message: string) => void;
}

export function ClaudeWelcome({
  onSendMessage,
}: ClaudeWelcomeProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const actionButtons = [
    {
      icon: Code,
      label: "Код",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      icon: PenTool,
      label: "Написать",
      color:
        "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      icon: Target,
      label: "Стратегия",
      color:
        "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      icon: GraduationCap,
      label: "Обучение",
      color:
        "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      icon: Grid3X3,
      label: "Из приложений",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-3xl mx-auto w-full">
        {/* Welcome message */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-2xl text-foreground">
              Добро пожаловать в чат!
            </h1>
          </div>
          <p className="text-muted-foreground">
            Выберите комнату на боковой панели
          </p>
        </div>

        {/* Input area */}
      </div>
    </div>
  );
}