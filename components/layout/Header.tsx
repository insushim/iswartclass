'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  Music,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  } | null;
  credits?: number;
  onMenuClick?: () => void;
}

export function Header({ user, credits = 30, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [notifications] = useState([
    { id: 1, title: '새로운 도안이 생성되었습니다', time: '5분 전', read: false },
    { id: 2, title: '학생이 과제를 제출했습니다', time: '30분 전', read: false },
    { id: 3, title: '새로운 성취 배지를 획득했습니다!', time: '1시간 전', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('로그아웃에 실패했습니다');
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="도안, 기법, 테마 검색..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Credits */}
        <Link href="/settings/subscription">
          <Badge variant="outline" className="hidden sm:flex gap-1.5 py-1.5 px-3">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="font-semibold">{credits}</span>
            <span className="text-muted-foreground">크레딧</span>
          </Badge>
        </Link>

        {/* BGM Toggle */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Music className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-4">
              <h4 className="font-semibold">알림</h4>
              <Button variant="ghost" size="sm" className="text-xs">
                모두 읽음
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 border-b p-4 hover:bg-muted/50 cursor-pointer ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${
                      notification.read ? 'bg-transparent' : 'bg-primary'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" className="w-full text-sm" asChild>
                <Link href="/notifications">모든 알림 보기</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.avatarUrl || undefined}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || '사용자'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <User className="mr-2 h-4 w-4" />
                프로필
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/subscription">
                <CreditCard className="mr-2 h-4 w-4" />
                구독 관리
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                설정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                도움말
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
