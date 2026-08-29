import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './checkRole';

/**
 * Middleware that validates coupon percentage discounts against the MAX_DISCOUNT env variable cap.
 * Defaults to 25% if MAX_DISCOUNT is not set.
 * 
 * Non-super_admin accounts (such as admin/staff) cannot create or update coupons exceeding MAX_DISCOUNT.
 */
export const validateMaxDiscount = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const maxDiscountCap = Number(process.env.MAX_DISCOUNT) || 25;
  const { discountType, discountValue } = req.body;
  const user = req.user;

  if (discountType === 'percentage' && discountValue !== undefined) {
    const value = Number(discountValue);

    // If user is not super_admin and tries to set discount > MAX_DISCOUNT
    if (user?.role !== 'super_admin' && value > maxDiscountCap) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed percentage discount for your role is ${maxDiscountCap}%. Got ${value}%.`,
        maxDiscount: maxDiscountCap,
      });
    }
  }

  return next();
};
