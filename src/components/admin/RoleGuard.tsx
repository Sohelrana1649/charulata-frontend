'use client';

import React from 'react';
import { useRole, type AppRole } from '@/hooks/useRole';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  /** Roles allowed to see the children */
  allowedRoles: AppRole[];
  /** Content to render when the user has the required role */
  children: React.ReactNode;
  /** 
   * Optional fallback to show when denied.
   * - If `null` or omitted, nothing is rendered (element is hidden).
   * - If a ReactNode, that node is rendered instead.
   * - If `"message"`, a styled permission denied message is shown.
   */
  fallback?: React.ReactNode | 'message' | null;
}

/**
 * Conditionally renders children based on the current user's role.
 * 
 * Usage:
 * ```tsx
 * <RoleGuard allowedRoles={['super_admin']}>
 *   <DeleteButton />
 * </RoleGuard>
 * ```
 */
export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useRole();

  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }

  if (fallback === 'message') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-semibold">
        <ShieldAlert size={14} />
        <span>আপনার এই অ্যাকশনের অনুমতি নেই</span>
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
}
