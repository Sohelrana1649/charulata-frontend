import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export type UserRole = 'customer' | 'admin' | 'staff' | 'super_admin';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
    email?: string;
    name?: string;
    role?: UserRole;
    [key: string]: any;
  };
}

/**
 * Higher-order middleware to enforce Role-Based Access Control (RBAC).
 * 
 * @param allowedRoles Array of roles allowed to access the route
 * @param options.verifyWithDb Set to true for destructive actions (DELETE, refund, role changes)
 *                             to re-fetch the user from the database and prevent token tampering.
 * 
 * Usage:
 * ```ts
 * router.delete('/products/:id', authenticate, checkRole(['super_admin'], { verifyWithDb: true }), deleteProduct);
 * router.get('/orders', authenticate, checkRole(['admin', 'super_admin']), getOrders);
 * ```
 */
export const checkRole = (
  allowedRoles: UserRole[],
  options: { verifyWithDb?: boolean } = {}
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Authentication required to access this resource.',
        });
      }

      let currentRole: UserRole = user.role;

      // For sensitive / destructive actions, re-verify role directly from MongoDB
      if (options.verifyWithDb) {
        const userId = user.id || user._id;
        if (userId && mongoose.connection.readyState === 1) {
          const User = mongoose.model('User');
          const freshUser = await User.findById(userId).select('role isActive isBlocked').lean() as any;

          if (!freshUser) {
            return res.status(401).json({
              success: false,
              message: 'Unauthorized: User account not found.',
            });
          }

          if (freshUser.isBlocked) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: Your account has been suspended.',
            });
          }

          currentRole = freshUser.role as UserRole;
          // Update req.user with fresh role
          if (req.user) {
            req.user.role = currentRole;
          }
        }
      }

      // Check if current role is authorized
      if (!allowedRoles.includes(currentRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access denied. Required role: [${allowedRoles.join(', ')}], Current role: '${currentRole}'.`,
        });
      }

      return next();
    } catch (error: any) {
      console.error('[RBAC checkRole error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error during authorization check.',
      });
    }
  };
};

/**
 * Convenient pre-configured middleware shortcuts
 */
export const requireSuperAdmin = checkRole(['super_admin'], { verifyWithDb: true });
export const requireAdmin = checkRole(['admin', 'super_admin']);
export const requireStaff = checkRole(['staff', 'admin', 'super_admin']);
