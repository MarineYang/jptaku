import { MobileLayout } from '@/components/MobileLayout';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { userMock } from '@/mock/userMock';
import { Settings, Bell, Shield, HelpCircle, ChevronRight, LogOut, RefreshCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const navigate = useNavigate();
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);

  const handleResetOnboarding = () => {
    if (confirm('온보딩을 다시 진행하시겠습니까?')) {
      resetOnboarding();
      navigate('/onboarding');
    }
  };

  const menuItems = [
    { icon: Bell, label: "알림" },
    { icon: Shield, label: "개인정보 및 보안" },
    { icon: HelpCircle, label: "고객센터" },
  ];

  return (
    <MobileLayout className="pb-20 bg-gray-50">
      <Header 
        title="내 정보" 
        rightAction={
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Settings size={20} />
          </Button>
        }
        className="bg-transparent"
      />
      
      <div className="px-6 py-2 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <Avatar className="w-20 h-20 border-4 border-gray-50">
            <AvatarImage src={userMock.avatarUrl} />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">{userMock.name}</h2>
            <p className="text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full text-xs">
              {userMock.level}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-sm text-gray-400">총 포인트</p>
            <p className="text-2xl font-bold text-gray-900">{userMock.points.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-sm text-gray-400">연속 학습</p>
            <p className="text-2xl font-bold text-gray-900">{userMock.streak}일</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button 
              key={item.label}
              className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                  <item.icon size={20} />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          ))}
          
          {/* Onboarding Reset Button (Added for testing) */}
          <button 
            onClick={handleResetOnboarding}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <RefreshCcw size={20} />
              </div>
              <span className="font-medium text-gray-900">온보딩 다시하기</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>

        <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-14 rounded-2xl font-medium">
          <LogOut size={18} className="mr-2" />
          로그아웃
        </Button>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}