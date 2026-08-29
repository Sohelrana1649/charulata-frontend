/**
 * Full RBAC Route Integration Reference for Express.js (Charulata Backend)
 * 
 * Copy and apply this middleware configuration to your Express routers.
 */

import { Router } from 'express';
import { checkRole, requireSuperAdmin, requireAdmin, requireStaff } from './checkRole';
import { auditLog } from './auditLogger';
import { validateMaxDiscount } from './couponValidator';

// Assuming you have an authentication middleware that extracts JWT and sets `req.user`
// import { authenticate } from '../middlewares/auth';

const router = Router();
declare const authenticate: any; // Placeholder for your auth middleware
declare const controllers: any; // Placeholder for your controller methods

/* ==========================================================================
   1. PRODUCTS ROUTES
   - Staff, Admin & SuperAdmin: View, Create, Update
   - SuperAdmin only: Delete, Bulk Delete (with Audit Log & DB verification)
   ========================================================================== */
router.get('/products', authenticate, requireStaff, controllers.getProducts);
router.post('/products', authenticate, requireStaff, controllers.createProduct);
router.put('/products/:id', authenticate, requireStaff, controllers.updateProduct);
router.patch('/products/:id', authenticate, requireStaff, controllers.patchProduct);

router.delete(
  '/products/:id',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'DELETE', resource: 'PRODUCT', getTargetId: (req) => req.params.id }),
  controllers.deleteProduct
);

router.post(
  '/products/bulk-delete',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'BULK_DELETE', resource: 'PRODUCT' }),
  controllers.bulkDeleteProducts
);


/* ==========================================================================
   2. CATEGORIES & ATTRIBUTES ROUTES
   - Staff, Admin & SuperAdmin: View, Create, Update
   - SuperAdmin only: Delete
   ========================================================================== */
router.get('/categories', authenticate, requireStaff, controllers.getCategories);
router.post('/categories', authenticate, requireStaff, controllers.createCategory);
router.put('/categories/:id', authenticate, requireStaff, controllers.updateCategory);
router.patch('/categories/:id', authenticate, requireStaff, controllers.patchCategory);

router.delete(
  '/categories/:id',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'DELETE', resource: 'CATEGORY', getTargetId: (req) => req.params.id }),
  controllers.deleteCategory
);

router.get('/attributes', authenticate, requireStaff, controllers.getAttributes);
router.post('/attributes', authenticate, requireStaff, controllers.createAttribute);
router.put('/attributes/:id', authenticate, requireStaff, controllers.updateAttribute);
router.delete('/attributes/:id', authenticate, requireSuperAdmin, controllers.deleteAttribute);


/* ==========================================================================
   3. ORDERS & REFUNDS
   - Staff, Admin & SuperAdmin: View orders, Update status, Bulk status update
   - SuperAdmin only: Refund orders
   ========================================================================== */
router.get('/orders', authenticate, requireStaff, controllers.getOrders);
router.get('/orders/:id', authenticate, requireStaff, controllers.getOrderById);
router.patch('/orders/:id/status', authenticate, requireStaff, controllers.updateOrderStatus);
router.patch('/orders/bulk-status', authenticate, requireStaff, controllers.bulkUpdateOrderStatus);

router.post(
  '/orders/:id/refund',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'REFUND', resource: 'ORDER', getTargetId: (req) => req.params.id }),
  controllers.refundOrder
);


/* ==========================================================================
   4. CUSTOMERS & USERS / ROLES
   - Admin & SuperAdmin: View customers, View contact queries, Mark read
   - SuperAdmin only: Manage admin roles, Delete queries, Export customer list
   - Staff: NO ACCESS
   ========================================================================== */
router.get('/customers', authenticate, requireAdmin, controllers.getCustomers);
router.get(
  '/customers/export',
  authenticate,
  requireSuperAdmin,
  controllers.exportCustomers
);

router.get('/contacts', authenticate, requireAdmin, controllers.getContactMessages);
router.patch('/contacts/:id/read', authenticate, requireAdmin, controllers.markContactRead);
router.delete(
  '/contacts/:id',
  authenticate,
  requireSuperAdmin,
  auditLog({ action: 'DELETE', resource: 'CUSTOMER', getTargetId: (req) => req.params.id }),
  controllers.deleteContact
);

router.get('/users/admin/all', authenticate, requireSuperAdmin, controllers.getAdminUsers);
router.patch(
  '/users/admin/:userId/role',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'ROLE_CHANGE', resource: 'USER', getTargetId: (req) => req.params.userId }),
  controllers.updateUserRole
);


/* ==========================================================================
   5. DELIVERY ROUTES
   - Admin & SuperAdmin: View & Update delivery zones
   - SuperAdmin only: Delete delivery zones
   - Staff: NO ACCESS
   ========================================================================== */
router.get('/delivery/zones', authenticate, requireAdmin, controllers.getDeliveryZones);
router.post('/delivery/zones', authenticate, requireAdmin, controllers.createOrUpdateDeliveryZone);
router.delete('/delivery/zones/:id', authenticate, requireSuperAdmin, controllers.deleteDeliveryZone);


/* ==========================================================================
   6. COUPONS (With MAX_DISCOUNT Cap Check)
   - Admin & SuperAdmin: View, Create, Update
   - SuperAdmin only: Delete coupons, override MAX_DISCOUNT
   - Staff: NO ACCESS
   ========================================================================== */
router.get('/coupons', authenticate, requireAdmin, controllers.getCoupons);
router.post('/coupons', authenticate, requireAdmin, validateMaxDiscount, controllers.createCoupon);
router.patch('/coupons/:id', authenticate, requireAdmin, validateMaxDiscount, controllers.updateCoupon);
router.delete(
  '/coupons/:id',
  authenticate,
  requireSuperAdmin,
  auditLog({ action: 'DELETE', resource: 'COUPON', getTargetId: (req) => req.params.id }),
  controllers.deleteCoupon
);


/* ==========================================================================
   7. BANNERS, CAMPAIGNS & REVIEWS
   - Banners & Campaigns: Admin & SuperAdmin (Staff: NO ACCESS)
   - Reviews: Staff, Admin & SuperAdmin moderate (SuperAdmin only delete)
   ========================================================================== */
router.get('/banners', authenticate, requireAdmin, controllers.getBanners);
router.post('/banners', authenticate, requireAdmin, controllers.createBanner);
router.patch('/banners/:id', authenticate, requireAdmin, controllers.updateBanner);
router.delete('/banners/:id', authenticate, requireSuperAdmin, controllers.deleteBanner);

router.get('/campaigns', authenticate, requireAdmin, controllers.getCampaigns);
router.post('/campaigns', authenticate, requireAdmin, controllers.createCampaign);
router.patch('/campaigns/:id', authenticate, requireAdmin, controllers.updateCampaign);
router.delete('/campaigns/:id', authenticate, requireSuperAdmin, controllers.deleteCampaign);

router.get('/reviews', authenticate, requireStaff, controllers.getReviews);
router.patch('/reviews/:id/status', authenticate, requireStaff, controllers.moderateReview);
router.delete('/reviews/:id', authenticate, requireSuperAdmin, controllers.deleteReview);


/* ==========================================================================
   8. NOTIFICATIONS
   - Staff, Admin & SuperAdmin
   ========================================================================== */
router.get('/notifications', authenticate, requireStaff, controllers.getNotifications);
router.patch('/notifications/:id', authenticate, requireStaff, controllers.markNotificationRead);
router.delete('/notifications/:id', authenticate, requireSuperAdmin, controllers.deleteNotification);


/* ==========================================================================
   9. ANALYTICS & EXECUTIVE REPORTING
   - Admin: Overview / Order status analytics only
   - SuperAdmin only: Revenue numbers, sales charts, executive export
   - Staff: NO ACCESS
   ========================================================================== */
router.get('/analytics/overview', authenticate, requireAdmin, controllers.getOverviewStats);
router.get('/analytics/sales-chart', authenticate, requireSuperAdmin, controllers.getSalesChart);
router.get('/analytics/export', authenticate, requireSuperAdmin, controllers.exportAnalytics);


/* ==========================================================================
   10. SETTINGS & SYSTEM CONFIGURATION
   - SuperAdmin only: View & Edit Store / Payment Settings
   - Staff & Admin: NO ACCESS
   ========================================================================== */
router.get('/settings', authenticate, requireSuperAdmin, controllers.getSettings);
router.put(
  '/settings',
  authenticate,
  checkRole(['super_admin'], { verifyWithDb: true }),
  auditLog({ action: 'SETTINGS_UPDATE', resource: 'SETTINGS' }),
  controllers.updateSettings
);

export default router;
