import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from './checkRole';
import { recordAudit } from './auditLogger';

/**
 * Controller: Get All Users with Role Filtering & Pagination
 * Route: GET /api/v1/users/admin/all?role=staff,admin,super_admin&search=john&page=1&limit=10
 * Access: Super Admin only
 */
export const getAllUsersAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = mongoose.model('User');
    const { role, search, page = 1, limit = 50 } = req.query;

    const query: Record<string, any> = {};

    // 1. Role filter (supports comma-separated list e.g. "staff,admin,super_admin")
    if (role && typeof role === 'string') {
      const rolesList = role.split(',').map((r) => r.trim()).filter(Boolean);
      if (rolesList.length > 0) {
        query.role = { $in: rolesList };
      }
    }

    // 2. Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[getAllUsersAdmin Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users list.',
      error: error.message,
    });
  }
};

/**
 * Controller: Update User Role with Self-Change Prevention & Audit Logging
 * Route: PATCH /api/v1/users/admin/:userId/role
 * Access: Super Admin only
 */
export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = mongoose.model('User');
    const { userId } = req.params;
    const { role } = req.body;
    const currentAdmin = req.user;

    // Validate inputs
    const validRoles = ['customer', 'staff', 'admin', 'super_admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed roles: [${validRoles.join(', ')}]`,
      });
    }

    // Prevent Super Admin from changing their OWN role through this UI
    const currentAdminId = currentAdmin?.id || currentAdmin?._id;
    if (currentAdminId && currentAdminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role. Another super admin must modify your role.',
      });
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const previousRole = targetUser.role || 'customer';

    // Update role
    targetUser.role = role;
    await targetUser.save();

    // Record entry in AuditLog collection
    await recordAudit({
      req,
      action: 'ROLE_CHANGE',
      resource: 'USER',
      targetId: userId,
      targetDescription: `Changed role of user "${targetUser.name}" (${targetUser.email}) from "${previousRole}" to "${role}"`,
      changes: {
        targetUserId: userId,
        targetEmail: targetUser.email,
        oldRole: previousRole,
        newRole: role,
      },
    });

    return res.status(200).json({
      success: true,
      message: `User role successfully changed to "${role}".`,
      data: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error: any) {
    console.error('[updateUserRole Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: error.message,
    });
  }
};

/**
 * Controller: Create New Admin or Staff User Directly
 * Route: POST /api/v1/users/admin/create
 * Access: Super Admin only
 */
export const createAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = mongoose.model('User');
    const { name, email, phone, role = 'staff', password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const validRoles = ['staff', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed: [${validRoles.join(', ')}]`,
      });
    }

    // Check for existing user by email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email address already exists.',
      });
    }

    // Create user (Note: password hashing should be in schema pre-save or bcrypt.hash)
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      role: role,
      password: password, // Mongoose User model pre-save hook handles hashing
    });

    // Record entry in AuditLog
    await recordAudit({
      req,
      action: 'CREATE',
      resource: 'USER',
      targetId: newUser._id.toString(),
      targetDescription: `Super Admin created new ${role.toUpperCase()} account for "${name}" (${email})`,
      changes: {
        userId: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    return res.status(201).json({
      success: true,
      message: `New ${role.toUpperCase()} account successfully created!`,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[createAdminUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create team member.',
      error: error.message,
    });
  }
};

/**
 * Controller: Update Authenticated User Profile (With Avatar Support)
 * Route: PATCH /api/v1/users/profile
 * Access: Authenticated user
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = mongoose.model('User');
    const userId = req.user?.id || req.user?._id;
    const { name, phone, profileImage, avatar, avatarUrl, image, photo, gender, dateOfBirth } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const finalAvatar = profileImage || avatar || avatarUrl || image || photo;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    // Save avatar to whatever field exists in user schema
    if (finalAvatar) {
      if ('profileImage' in user) user.profileImage = finalAvatar;
      if ('avatar' in user) user.avatar = finalAvatar;
      if ('avatarUrl' in user) user.avatarUrl = finalAvatar;
      if ('image' in user) user.image = finalAvatar;
      if ('photo' in user) user.photo = finalAvatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: finalAvatar || user.profileImage || user.avatar || '',
          avatar: finalAvatar || user.avatar || user.profileImage || '',
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
        },
      },
    });
  } catch (error: any) {
    console.error('[updateUserProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};


