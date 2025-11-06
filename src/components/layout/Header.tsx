'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import UserMenu from './UserMenu';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    };

    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Page title will be added by individual pages */}
        <h1 className="text-xl font-semibold text-gray-900">
          {/* Dynamic title can be added here */}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Menu */}
        {user && profile && (
          <UserMenu
            user={user}
            profile={profile}
            onLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}