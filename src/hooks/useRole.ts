'use client';

import { useAppSelector } from '@/store/hooks';

export type AppRole = 'customer' | 'admin' | 'staff' | 'super_admin';

/**
 * Custom hook exposing the current user's role and convenience helpers.
 * 
 * Role hierarchy: super_admin(4) > admin(3) > staff(2) > customer(1)
 */
export function useRole() {
  const user = useAppSelector((state) => state.auth.user);
  const role: AppRole = (user?.role as AppRole) || 'customer';

  return {
    /** Current role string */
    role,
    /** true if role === 'super_admin' */
    isSuperAdmin: role === 'super_admin',
    /** true if role is 'admin' or 'super_admin' */
    isAdmin: role === 'admin' || role === 'super_admin',
    /** true if role is 'staff' */
    isStaff: role === 'staff',
    /** true if role is 'staff', 'admin', or 'super_admin' */
    isStaffOrAbove: role === 'staff' || role === 'admin' || role === 'super_admin',
    /** Check if the current user has one of the allowed roles */
    hasRole: (allowedRoles: AppRole[]) => allowedRoles.includes(role),
  };
}
