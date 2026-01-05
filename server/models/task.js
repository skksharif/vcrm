const mongoose = require('mongoose');
const {
  TASK_TYPES,
  POSTER_STAGES,
  REEL_STAGES,
  INITIAL_TASK_STAGE
} = require('./constants');

/* ================== HELPERS ================== */
const getStagesByType = (type) =>
  type === TASK_TYPES.POSTER ? POSTER_STAGES : REEL_STAGES;

/* ================== STAGE HISTORY SCHEMA ================== */
const StageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  assignedBy: {
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  assignedTo: {
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  status: {
    type: String,
    enum: ['pending-acceptance', 'accepted', 'in-progress', 'submitted', 'approved', 'rejected', 'completed'],
    default: 'pending-acceptance'
  },
  remarks: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/* ================== AUDIT LOG SCHEMA ================== */
const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // CREATE, UPDATE_STAGE, REJECT, APPROVE, ASSIGN, SUBMIT, POST
  by: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    role: String
  },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

/* ================== TASK SCHEMA ================== */
const TaskSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    title: { type: String, required: true },
    description: { type: String, default: '' },

    type: {
      type: String,
      enum: Object.values(TASK_TYPES),
      required: true
    },

    scheduledDate: {
      type: Date,
      required: true,
      index: true
    },

    currentStage: {
      type: String,
      required: true,
      default: INITIAL_TASK_STAGE
    },

    // Latest stage assignment details
    currentAssignment: {
      assignedBy: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
      },
      assignedTo: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
      },
      acceptanceStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'accepted'
      }
    },

    // Stage progression
    stageHistory: [StageHistorySchema],
    auditLogs: [AuditLogSchema],

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    // Completion tracking
    completedAt: { type: Date, default: null },
    postedAt: { type: Date, default: null },
    posterLink: { type: String, default: '' },
    postedBy: {
      id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    postDetails: {
      platform: { type: String, default: '' },
      link: { type: String, default: '' },
      remarks: { type: String, default: '' }
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.stage = ret.currentStage;
        return ret;
      }
    }
  }
);

/* ================== METHODS ================== */

/**
 * Initialize task when created
 */
TaskSchema.methods.initializeTask = function (createdBy) {
  this.currentStage = INITIAL_TASK_STAGE;
  this.stageHistory.push({
    stage: INITIAL_TASK_STAGE,
    remarks: 'Task created'
  });
  this.auditLogs.push({
    action: 'TASK_CREATED',
    by: {
      id: createdBy.id,
      name: createdBy.name,
      role: createdBy.role
    }
  });
  return this;
};

/**
 * Update stage and assign to user
 * Called by Team Lead to progress the task
 */
TaskSchema.methods.updateStageAndAssign = function (newStage, assignedBy, assignedTo = null, remarks = '') {
  const stages = getStagesByType(this.type);

  if (!stages.includes(newStage)) {
    throw new Error(`Invalid stage "${newStage}" for task type "${this.type}"`);
  }

  // Check if moving forward (not backward)
  const currentIndex = stages.indexOf(this.currentStage);
  const newIndex = stages.indexOf(newStage);

  // Allow staying on the same stage to add remarks; block only true backwards moves
  if (newIndex < currentIndex && this.currentStage !== INITIAL_TASK_STAGE) {
    throw new Error('Cannot move backward in stages');
  }

  // Check if client approval stage (shouldn't have assignment)
  const isClientApprovalStage = newStage.toLowerCase().includes('client approval');

  if (isClientApprovalStage && assignedTo) {
    throw new Error('Client approval stages should not have assignments');
  }

  this.currentStage = newStage;

  const entry = {
    stage: newStage,
    status: 'accepted',
    remarks,
    changedAt: new Date()
  };

  if (!isClientApprovalStage) {
    entry.assignedBy = {
      id: assignedBy.id,
      name: assignedBy.name
    };
    entry.assignedTo = assignedTo ? {
      id: assignedTo.id,
      name: assignedTo.name
    } : null;
  }

  this.stageHistory.push(entry);
  this.currentAssignment = {
    assignedBy: !isClientApprovalStage ? { id: assignedBy.id, name: assignedBy.name } : null,
    assignedTo: !isClientApprovalStage && assignedTo ? { id: assignedTo.id, name: assignedTo.name } : null,
    acceptanceStatus: 'accepted'
  };

  this.auditLogs.push({
    action: 'STAGE_UPDATED',
    by: {
      id: assignedBy.id,
      name: assignedBy.name,
      role: assignedBy.role
    },
    details: `Stage changed to ${newStage}${assignedTo ? ` and assigned to ${assignedTo.name}` : ''}`
  });

  return this;
};

/**
 * Employee accepts task assignment
 */
TaskSchema.methods.acceptAssignment = function (userId, userName) {
  if (!this.currentAssignment.assignedTo) {
    throw new Error('No pending assignment to accept');
  }

  if (!this.currentAssignment.assignedTo.id.equals(userId)) {
    throw new Error('You are not assigned to this task');
  }

  if (this.currentAssignment.acceptanceStatus !== 'pending') {
    throw new Error('Assignment already processed');
  }

  this.currentAssignment.acceptanceStatus = 'accepted';

  // Update latest stage history entry
  if (this.stageHistory.length > 0) {
    this.stageHistory[this.stageHistory.length - 1].status = 'accepted';
    this.stageHistory[this.stageHistory.length - 1].updatedAt = new Date();
  }

  this.auditLogs.push({
    action: 'ASSIGNMENT_ACCEPTED',
    by: {
      id: userId,
      name: userName
    }
  });

  return this;
};

/**
 * Employee rejects task assignment
 */
TaskSchema.methods.rejectAssignment = function (userId, userName, reason = '') {
  if (!this.currentAssignment.assignedTo) {
    throw new Error('No pending assignment to reject');
  }

  if (!this.currentAssignment.assignedTo.id.equals(userId)) {
    throw new Error('You are not assigned to this task');
  }

  this.currentAssignment.acceptanceStatus = 'rejected';

  // Update latest stage history entry
  if (this.stageHistory.length > 0) {
    const lastEntry = this.stageHistory[this.stageHistory.length - 1];
    lastEntry.status = 'rejected';
    lastEntry.rejectionReason = reason;
    lastEntry.updatedAt = new Date();
  }

  // Reset assignment
  this.currentAssignment.assignedTo = null;

  this.auditLogs.push({
    action: 'ASSIGNMENT_REJECTED',
    by: {
      id: userId,
      name: userName
    },
    details: reason
  });

  return this;
};

/**
 * Employee submits work for approval
 */
TaskSchema.methods.submitWork = function (userId, userName, workDetails = '') {
  if (!this.currentAssignment.assignedTo) {
    throw new Error('Task not assigned');
  }

  if (!this.currentAssignment.assignedTo.id.equals(userId)) {
    throw new Error('You are not assigned to this task');
  }

  // Update latest stage history entry
  if (this.stageHistory.length > 0) {
    this.stageHistory[this.stageHistory.length - 1].status = 'submitted';
    this.stageHistory[this.stageHistory.length - 1].updatedAt = new Date();
  }

  this.auditLogs.push({
    action: 'WORK_SUBMITTED',
    by: {
      id: userId,
      name: userName
    },
    details: workDetails
  });

  return this;
};

/**
 * Team Lead approves work and moves to next stage
 */
TaskSchema.methods.approveAndMove = function (userId, userName, userRole, nextStage, remarks = '') {
  const stages = getStagesByType(this.type);

  if (!stages.includes(nextStage)) {
    throw new Error(`Invalid stage "${nextStage}"`);
  }

  const currentIndex = stages.indexOf(this.currentStage);
  const nextIndex = stages.indexOf(nextStage);

  if (nextIndex !== currentIndex + 1) {
    throw new Error('Can only move to next stage');
  }

  this.currentStage = nextStage;

  const entry = {
    stage: nextStage,
    status: 'approved',
    remarks,
    changedAt: new Date()
  };

  this.stageHistory.push(entry);
  this.currentAssignment.acceptanceStatus = 'accepted';

  this.auditLogs.push({
    action: 'WORK_APPROVED',
    by: {
      id: userId,
      name: userName,
      role: userRole
    },
    details: `Approved and moved to ${nextStage}`
  });

  return this;
};

/**
 * Team Lead rejects work and sends back to previous stage
 */
TaskSchema.methods.rejectWork = function (userId, userName, userRole, reason = '') {
  if (this.stageHistory.length < 2) {
    throw new Error('Cannot reject from initial stage');
  }

  const previousEntry = this.stageHistory[this.stageHistory.length - 2];
  this.currentStage = previousEntry.stage;

  // Update latest entry
  const lastEntry = this.stageHistory[this.stageHistory.length - 1];
  lastEntry.status = 'rejected';
  lastEntry.rejectionReason = reason;
  lastEntry.updatedAt = new Date();

  this.auditLogs.push({
    action: 'WORK_REJECTED',
    by: {
      id: userId,
      name: userName,
      role: userRole
    },
    details: reason
  });

  return this;
};

/**
 * Mark task as posted (SMM action)
 */
TaskSchema.methods.markAsPosted = function (userId, userName, postInfo = {}) {
  const { platform = '', link = '', remarks = '' } = postInfo || {};

  if (this.currentStage !== 'Ready to Post') {
    throw new Error('Only tasks in "Ready to Post" stage can be marked as posted');
  }

  this.currentStage = 'Posted';
  this.postedAt = new Date();
  this.completedAt = new Date();

  // Persist post metadata for UI and reporting
  this.posterLink = link || this.posterLink;
  this.postDetails = { platform, link, remarks };
  this.postedBy = { id: userId, name: userName };

  this.stageHistory.push({
    stage: 'Posted',
    status: 'completed',
    remarks: remarks || 'Marked as posted by SMM',
    changedAt: new Date(),
    assignedBy: {
      id: userId,
      name: userName
    }
  });

  this.auditLogs.push({
    action: 'TASK_POSTED',
    by: {
      id: userId,
      name: userName
    },
    details: [platform, link].filter(Boolean).join(' | ') || remarks
  });

  return this;
};

/**
 * Soft delete task
 */
TaskSchema.methods.softDelete = function (userId, userName, reason = '') {
  this.isDeleted = true;
  this.deletedAt = new Date();

  this.auditLogs.push({
    action: 'TASK_DELETED',
    by: {
      id: userId,
      name: userName
    },
    details: reason
  });

  return this;
};

/**
 * Get current stage entry
 */
TaskSchema.methods.getCurrentStageEntry = function () {
  if (!this.stageHistory || this.stageHistory.length === 0) return null;
  return this.stageHistory[this.stageHistory.length - 1];
};

/**
 * Get stage completion percentage
 */
TaskSchema.methods.getCompletionPercentage = function () {
  const stages = getStagesByType(this.type);
  const currentIndex = stages.indexOf(this.currentStage);
  return Math.round(((currentIndex + 1) / stages.length) * 100);
};

module.exports = mongoose.model('Task', TaskSchema);
