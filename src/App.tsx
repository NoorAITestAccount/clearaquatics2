import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/Dashboard';
import { AquariumManagement } from './components/AquariumManagement';

import { ParameterHistory } from './components/ParameterHistory';
import { Navigation } from './components/Navigation';
import { SignIn } from './components/SignIn';
import { AuthContext, useAuthProvider } from './hooks/useAuth';

type Frame = 'dashboard' | 'aquariums' | 'history';

export default function App() {
  const [currentFrame, setCurrentFrame] = useState<Frame>('dashboard');
  const auth = useAuthProvider();

  const renderFrame = () => {
    switch (currentFrame) {
      case 'dashboard':
        return <Dashboard />;
      case 'aquariums':
        return <AquariumManagement />;
      case 'history':
        return <ParameterHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-background">
        {auth.loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !auth.user ? (
          <SignIn />
        ) : (
          <>
            <Navigation 
              currentFrame={currentFrame} 
              onFrameChange={setCurrentFrame}
            />
            
            <main className="transition-all duration-300 ease-in-out">
              <div className="container mx-auto px-4 py-6">
                {renderFrame()}
              </div>
            </main>
          </>
        )}

        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}