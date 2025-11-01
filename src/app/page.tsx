'use client';
import { Chat } from "../components/Chat";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { AuthScreen } from "../components/AuthScreen";
import { Toaster } from "../components/ui/sonner";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 mx-auto flex items-center justify-center">
            <span className="text-white text-2xl">C</span>
          </div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Chat />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="dark h-screen w-full">
        <AppContent />
        <Toaster 
          position="top-right" 
          theme="dark"
          closeButton
          richColors
        />
      </div>
    </AuthProvider>
  );
}
