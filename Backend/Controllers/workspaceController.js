const Workspace = require('../Models/workspaceModel');
const User = require('../Models/userModel');

// ─── Create Workspace ──────────────────────────────────────────────────────
const createWorkspace = async (req, res) => {
  try {
    const { name, description, avatar , isPersonal } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = new Workspace({
      name:        name.trim(),
      description: description?.trim() || '',
      avatar:      avatar || '🏢',
      owner:       req.user.id,
      members: [
        {
          userId:   req.user.id,
          role:     'owner',
          joinedAt: Date.now(),
        },
      ],
      isPersonal : isPersonal,
    });

    await workspace.save();

    return res.status(201).json({
      message:   'Workspace created successfully',
      workspace,
    });
  } catch (error) {
    console.error('createWorkspace error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get My Workspaces ─────────────────────────────────────────────────────
const getMyWorkspaces = async (req, res) => {
  try {
    // Find all workspaces where user is a member
    const workspaces = await Workspace.find({
      'members.userId': req.user.id,
    })
      .populate('owner', 'name email')
      .populate('members.userId', 'name email');

    return res.status(200).json({ workspaces });
  } catch (error) {
    console.error('getMyWorkspaces error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get Workspace By ID ───────────────────────────────────────────────────
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.userId', 'name email')
      .populate('meetings');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if current user is a member
    const isMember = workspace.members.some(
      (m) => m.userId._id.toString() === req.user.id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    return res.status(200).json({ workspace });
  } catch (error) {
    console.error('getWorkspaceById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Update Workspace ──────────────────────────────────────────────────────
const updateWorkspace = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin can update
    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user.id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'Only owner or admin can update this workspace' });
    }

    if (name)        workspace.name        = name.trim();
    if (description !== undefined) workspace.description = description.trim();
    if (avatar)      workspace.avatar      = avatar;

    await workspace.save();

    return res.status(200).json({
      message:   'Workspace updated successfully',
      workspace,
    });
  } catch (error) {
    console.error('updateWorkspace error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Delete Workspace ──────────────────────────────────────────────────────
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this workspace' });
    }

    await workspace.deleteOne();

    return res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('deleteWorkspace error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Invite Member ─────────────────────────────────────────────────────────
const inviteMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin can invite
    const inviter = workspace.members.find(
      (m) => m.userId.toString() === req.user.id.toString()
    );

    if (!inviter || !['owner', 'admin'].includes(inviter.role)) {
      return res.status(403).json({ message: 'Only owner or admin can invite members' });
    }

    // Check user exists
    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check user is a connection of the current user
    const currentUser = await User.findById(req.user.id);
    const isConnection = currentUser.connections.includes(userId);
    if (!isConnection) {
      return res.status(400).json({ message: 'You can only invite your connections' });
    }

    // Check already a member
    const alreadyMember = workspace.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // Add to members
    workspace.members.push({
      userId,
      role:     'member',
      joinedAt: Date.now(),
    });

    await workspace.save();

    return res.status(200).json({ message: 'Member invited successfully', workspace });
  } catch (error) {
    console.error('inviteMember error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Remove Member ─────────────────────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin can remove
    const remover = workspace.members.find(
      (m) => m.userId.toString() === req.user.id.toString()
    );

    if (!remover || !['owner', 'admin'].includes(remover.role)) {
      return res.status(403).json({ message: 'Only owner or admin can remove members' });
    }

    // Cannot remove the owner
    if (workspace.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }

    // Check member exists
    const memberExists = workspace.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found in this workspace' });
    }

    // Remove member
    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== userId.toString()
    );

    await workspace.save();

    return res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('removeMember error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Leave Workspace ───────────────────────────────────────────────────────
const leaveWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Owner cannot leave — must delete or transfer ownership
    if (workspace.owner.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: 'Owner cannot leave the workspace. Delete it or transfer ownership first.',
      });
    }

    // Check user is a member
    const isMember = workspace.members.some(
      (m) => m.userId.toString() === req.user.id.toString()
    );
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this workspace' });
    }

    // Remove from members
    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== req.user.id.toString()
    );

    await workspace.save();

    return res.status(200).json({ message: 'You have left the workspace' });
  } catch (error) {
    console.error('leaveWorkspace error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get Workspace Members ─────────────────────────────────────────────────
const getWorkspaceMembers = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.userId', 'name email bio');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check current user is a member
    const isMember = workspace.members.some(
      (m) => m.userId._id.toString() === req.user.id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    return res.status(200).json({ members: workspace.members });
  } catch (error) {
    console.error('getWorkspaceMembers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  leaveWorkspace,
  getWorkspaceMembers,
};