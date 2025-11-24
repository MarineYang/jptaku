import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import Feedback from './pages/Feedback';
import MyPage from './pages/MyPage';
import Onboarding from './pages/Onboarding';
import SentenceDetail from './pages/SentenceDetail';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  // GitHub Pages 배포 시 basename 설정
  const basename = import.meta.env.BASE_URL;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter basename={basename}>
          <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/sentence/:id" element={
            <ProtectedRoute>
              <SentenceDetail />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Conversation />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          } />
          <Route path="/my" element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;