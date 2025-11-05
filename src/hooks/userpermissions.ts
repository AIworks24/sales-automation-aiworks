'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { permissions, UserRole } from '@/lib/utils/permissions';

export function usePermissions() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setRole(profile.role as UserRole);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [supabase]);

  return {
    role,
    loading,
    can: (permission: keyof typeof permissions) => {
      if (!role) return false;
      return permissions[permission](role);
    },
  };
}