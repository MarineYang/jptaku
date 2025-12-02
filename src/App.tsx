import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import Feedback from './pages/Feedback';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import SentenceDetail from './pages/SentenceDetail';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// 로그인 필요 라우트
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 온보딩 필요 라우트 (로그인 + 온보딩 완료 필요)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const isOnboarded = useAppStore((state) => state.isOnboarded);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HashRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            <AuthRoute>
              <Onboarding />
            </AuthRoute>
          } />
          
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
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;