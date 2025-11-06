'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Target,
  Users,
  MessageSquare,
  BarChart,
  Settings,
  Menu,
  X,
  Sparkles,
  UsersRound,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: Array<'admin' | 'manager' | 'rep'>;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'rep'],
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Target,
    roles: ['admin', 'manager'], // Only admin and manager
  },
  {
    name: 'Prospects',
    href: '/prospects',
    icon: Users,
    roles: ['admin', 'manager', 'rep'], // All roles
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    roles: ['admin', 'manager', 'rep'], // All roles
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    roles: ['admin', 'manager'], // Only admin and manager
  },
  {
    name: 'Team',
    href: '/settings/team',
    icon: UsersRound,
    roles: ['admin'], // Only admin can manage team
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'manager', 'rep'], // All roles
  },
];

export default function Sidebar() {
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'rep' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createBrowserClient();

  useEffect(() => {
    const loadUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await (supabase
          .from('user_profiles') as any)
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role as 'admin' | 'manager' | 'rep');
          console.log('👤 User role loaded:', profile.role);
        }
      }
    };

    loadUserRole();
  }, [supabase]);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  console.log('📋 Filtered nav items for', userRole, ':', filteredNavItems.map(i => i.name));

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md bg-white p-2 text-gray-600 shadow-lg hover:bg-gray-50"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar for desktop and mobile drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Sales AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Role Badge */}
          {userRole && (
            <div className="border-t p-4">
              <div className="rounded-lg bg-gray-100 px-3 py-2 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Your Role
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}