import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import * as Linking from 'expo-linking';
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

// 딥링크 리스너 컴포넌트
const DeepLinkHandler = () => {
  const navigate = useNavigate();
  const setAuth = useAppStore((state) => state.setAuth);

  useEffect(() => {
    // 딥링크 URL 처리 함수
    const handleDeepLink = (event: { url: string }) => {
      // jptaku://auth/callback?access_token=xxx&refresh_token=xxx
      const url = new URL(event.url);

      if (url.pathname === '/auth/callback' || url.host === 'auth') {
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken) {
          // 토큰 저장
          setAuth(accessToken);

          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          // 온보딩 페이지로 이동
          navigate('/onboarding', { replace: true });
        }
      }
    };

    // Expo 딥링크 리스너 등록
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 앱이 딥링크로 열렸을 때 초기 URL 확인
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigate, setAuth]);

  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HashRouter>
          <DeepLinkHandler />
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