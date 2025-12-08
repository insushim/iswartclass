'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Palette,
  LayoutDashboard,
  Wand2,
  Library,
  Heart,
  BookOpen,
  Users,
  GraduationCap,
  Image,
  PlayCircle,
  Store,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
}

const mainNavItems = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '도안 생성',
    href: '/generate',
    icon: Wand2,
    badge: 'AI',
  },
  {
    title: '내 라이브러리',
    href: '/library',
    icon: Library,
  },
  {
    title: '즐겨찾기',
    href: '/favorites',
    icon: Heart,
  },
];

const educationNavItems = [
  {
    title: '커리큘럼',
    href: '/curriculum',
    icon: BookOpen,
  },
  {
    title: '학급 관리',
    href: '/classroom',
    icon: Users,
  },
  {
    title: '학생 관리',
    href: '/classroom/students',
    icon: GraduationCap,
  },
  {
    title: '포트폴리오',
    href: '/portfolio',
    icon: Image,
  },
  {
    title: '튜토리얼',
    href: '/tutorials',
    icon: PlayCircle,
  },
];

const communityNavItems = [
  {
    title: '마켓플레이스',
    href: '/marketplace',
    icon: Store,
  },
  {
    title: '커뮤니티',
    href: '/community',
    icon: MessageSquare,
  },
];

const toolNavItems = [
  {
    title: '통계',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: '캘린더',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: '설정',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({
    item,
  }: {
    item: { title: string; href: string; icon: typeof LayoutDashboard; badge?: string };
  }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

    const content = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Palette className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold gradient-text">ArtSheet</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {/* Main */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                메인
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          <Separator />

          {/* Education */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                교육
              </p>
            )}
            {educationNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          <Separator />

          {/* Community */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                커뮤니티
              </p>
            )}
            {communityNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          <Separator />

          {/* Tools */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                도구
              </p>
            )}
            {toolNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Upgrade Banner */}
      {!collapsed && (
        <div className="p-4">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5" />
              <span className="font-semibold">프리미엄 업그레이드</span>
            </div>
            <p className="text-sm text-white/80 mb-3">
              무제한 도안 생성과 모든 기능을 이용해보세요
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-white text-purple-600 hover:bg-white/90"
              asChild
            >
              <Link href="/settings/subscription">업그레이드</Link>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
