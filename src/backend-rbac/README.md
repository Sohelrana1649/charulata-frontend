# Charulata RBAC Backend Modules

This folder contains the complete Role-Based Access Control (RBAC) implementation for your Express.js + MongoDB backend.

## Files Overview

1. **`checkRole.ts`**: Reusable middleware factory `checkRole(allowedRoles, options)`.
   - Checks role in JWT payload.
   - For sensitive/destructive routes (DELETE, refund, role changes), sets `options.verifyWithDb: true` to re-fetch the user from MongoDB and ensure role hasn't changed or been suspended.
   - Returns HTTP 403 with `{ success: false, message: 'Forbidden' }` if unauthorized.

2. **`AuditLog.model.ts`**: Mongoose model for `AuditLog` collection.
   - Records `adminId`, `adminEmail`, `adminRole`, `action`, `resource`, `targetId`, `changes`, `ipAddress`, and `userAgent`.

3. **`auditLogger.ts`**: Middleware `auditLog({ action, resource })` and helper `recordAudit(...)`.
   - Intercepts successful responses (2xx) and automatically writes audit trail logs.
   - Redacts sensitive keys (`password`, `token`, `secret`) from logged changes.

4. **`couponValidator.ts`**: Middleware `validateMaxDiscount`.
   - Capped at `process.env.MAX_DISCOUNT` (defaults to `25%`).
   - Prevents non-super_admin from creating or updating percentage coupons exceeding the cap.

5. **`routes.example.ts`**: Complete Express router reference showing how each endpoint in the permission matrix is secured.

---

## How to integrate with `charulata-database`

1. Copy `checkRole.ts`, `auditLogger.ts`, and `couponValidator.ts` to your backend's `middlewares/` directory.
2. Copy `AuditLog.model.ts` to your backend's `models/` directory.
3. In your `.env` file, add:
   ```env
   MAX_DISCOUNT=25
   ```
4. Attach `checkRole` and `auditLog` to your routes as shown in `routes.example.ts`.
