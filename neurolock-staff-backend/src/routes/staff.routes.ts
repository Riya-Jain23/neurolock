import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { StaffRepository } from '../repositories/staff.repository';

const router = Router();
const staffRepository = new StaffRepository();

// All routes require authentication
router.use(authenticate);

// Get all staff (admin only)
router.get('/', authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const staff = await staffRepository.getAllStaff();
    res.json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    console.error('Get all staff error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch staff members' },
    });
  }
});

// Get staff by ID (admin only)
router.get('/:id', authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const staff = await staffRepository.getStaffById(parseInt(req.params.id));
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: { message: 'Staff member not found' },
      });
    }
    res.json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch staff member' },
    });
  }
});

// Update staff (admin only)
router.put('/:id', authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    // Validate input
    if (!name && !email && !role && !status) {
      return res.status(400).json({
        success: false,
        error: { message: 'At least one field must be provided for update' },
      });
    }

    // Check if email is being changed and if it already exists
    if (email) {
      const existingStaff = await staffRepository.getStaffByEmail(email);
      if (existingStaff && existingStaff.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email already exists' },
        });
      }
    }

    // Validate role if provided
    const validRoles = ['admin', 'psychiatrist', 'psychologist', 'therapist', 'nurse'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid role' },
      });
    }

    // Validate status if provided
    const validStatuses = ['active', 'inactive'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status. Must be active or inactive' },
      });
    }

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updated = await staffRepository.updateStaff(parseInt(id), updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { message: 'Staff member not found' },
      });
    }

    // Fetch updated staff
    const updatedStaff = await staffRepository.getStaffById(parseInt(id));

    res.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully',
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update staff member' },
    });
  }
});

// Delete/deactivate staff (admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Instead of deleting, we'll deactivate the staff member
    const updated = await staffRepository.updateStaffStatus(parseInt(id), 'inactive');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { message: 'Staff member not found' },
      });
    }

    res.json({
      success: true,
      message: 'Staff member deactivated successfully',
    });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to deactivate staff member' },
    });
  }
});

export default router;
