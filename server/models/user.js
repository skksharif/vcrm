const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('./constants');

/* ============== ASSIGNMENT HISTORY SUB SCHEMA ============== */
const AssignmentHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  taskTitle: { type: String, required: true },
  taskType: { type: String, required: true },
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
    enum: ['assigned', 'accepted', 'rejected', 'submitted', 'approved', 'in-progress', 'completed'],
    default: 'assigned'
  },
  remarks: { type: String, default: '' },
  assignedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/* ============== USER SCHEMA ============== */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    suspended: { type: Boolean, default: false },
    suspendedAt: { type: Date, default: null },
    
    // Soft delete fields
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    
    // Work tracking
    assignmentHistory: [AssignmentHistorySchema],
    
    // Profile info
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    profileImage: { type: String, default: null },
  },
  { timestamps: true }
);

/* ============== PASSWORD HASHING MIDDLEWARE ============== */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ============== PASSWORD COMPARISON METHOD ============== */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ============== TOJSON TRANSFORM (Hide sensitive data) ============== */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
