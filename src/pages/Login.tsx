import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAppStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 회원가입 시도 (이미 가입되어 있으면 실패해도 OK)
      try {
        await fetch('http://localhost:30001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@gmail.com',
            password: '1234',
            name: '테스트',
          }),
        });
      } catch {
        // 회원가입 실패해도 계속 진행 (이미 가입된 경우)
      }

      // 2. 로그인
      const loginResponse = await fetch('http://localhost:30001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@gmail.com',
          password: '1234',
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('로그인에 실패했습니다.');
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.data?.access_token || loginData.data?.refresh_token

      if (!accessToken) {
        throw new Error('토큰을 받지 못했습니다.');
      }

      // 토큰 저장
      setAuth(accessToken);

      // 온보딩 페이지로 이동
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout className="bg-white">
      <div className="flex flex-col h-screen">
        {/* Logo & Title */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
            <span className="text-4xl font-bold text-white">日</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">일타쿠</h1>
          <p className="text-gray-500 text-center">
            오타쿠를 위한<br />일본어 학습 앱
          </p>
        </div>

        {/* Login Button */}
        <div className="px-6 pb-12 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 text-base font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {/* Google Logo SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Login
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            로그인 시 서비스 이용약관에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
