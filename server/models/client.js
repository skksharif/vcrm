const mongoose = require('mongoose');
const { CLIENT_PRIORITY } = require('./constants');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    companyName: {
      type: String,
      trim: true,
      default: ''
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },

    phone: {
      type: String,
      default: ''
    },

    website: {
      type: String,
      default: ''
    },

    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipCode: { type: String, default: '' }
    },

    priority: {
      type: String,
      enum: Object.values(CLIENT_PRIORITY),
      default: CLIENT_PRIORITY.BASIC
    },

    contactPerson: {
      type: String,
      default: ''
    },

    contactEmail: {
      type: String,
      lowercase: true,
      default: ''
    },

    contactPhone: {
      type: String,
      default: ''
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  }
);

/* ================ VIRTUAL METHODS ================ */

/**
 * Get client stats (called separately with populated counts)
 */
clientSchema.virtual('stats').get(function () {
  return {
    totalTasks: this.totalTasks || 0,
    completedTasks: this.completedTasks || 0,
    pendingTasks: this.pendingTasks || 0,
    inProgressTasks: this.inProgressTasks || 0
  };
});

module.exports = mongoose.model('Client', clientSchema);
