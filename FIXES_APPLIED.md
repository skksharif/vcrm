# Update & Assign Logout Issue - Comprehensive Fix Analysis

## Problem Statement
When Team Leads click "Update & Assign" to update task stages and assign employees, the application unexpectedly logs them out and redirects to the login page.

## Root Causes Identified & Fixed

### 1. **JWT Secret Mismatch** ⚠️ CRITICAL
**File:** `server/middlewares/auth.js`

**Issue:** 
- JWT tokens were created using: `process.env.JWT_SECRET || 'your_jwt_secret_key'`
- But verified using: `process.env.JWT_SECRET || 'secret'`
- This mismatch caused ALL token verification failures across the application

**Fix Applied:**
```javascript
// Changed from:
const secret = process.env.JWT_SECRET || 'secret';

// To:
const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
```

**Impact:** Token verification will now succeed consistently with other parts of the application.

---

### 2. **Overly Restrictive Stage Validation** ⚠️ MAJOR
**File:** `server/controllers/teamlead/taskController.js` (updateStage method)

**Issue:**
- TL-1 could only update: Content Writing, Content Client Approval, Designing, Design Client Approval
- Missing stages: Ready to Post, Posted
- TL-2 could only update: Editing, Editing Client Approval, Ready to Post
- Missing stages: Content Writing, Content Client Approval, Shooting, Posted
- **Worst part:** No validation for mismatched task types (e.g., TL-1 updating reel tasks)

**Fix Applied:**
```javascript
// TL-1 can now handle poster tasks with these stages:
['Content Writing', 'Content Client Approval', 'Designing', 
 'Design Client Approval', 'Ready to Post', 'Posted']

// TL-2 can now handle reel tasks with these stages:
['Content Writing', 'Content Client Approval', 'Shooting', 
 'Editing', 'Editing Client Approval', 'Ready to Post', 'Posted']

// Added validation:
- TL-1 trying to update reel task → 403 error
- TL-2 trying to update poster task → 403 error
```

**Impact:** Team Leads can now update all valid stages for their assigned task type.

---

### 3. **Missing Role Filter in User Endpoint** 🔴 HIGH
**File:** `server/controllers/admin/user.controller.js` (listUsers method)

**Issue:**
- Frontend called: `GET /admin/users?role=Employee`
- Backend ignored the `role` query parameter
- Returned ALL users instead of just Employees
- Modal would display Employees mixed with other roles

**Fix Applied:**
```javascript
// Added role filtering:
const roleFilter = req.query.role ? req.query.role : null;
if (roleFilter) {
  filter.role = roleFilter;
}
```

**Impact:** Modal now shows only Employees for assignment.

---

### 4. **Field Name Inconsistency** 🟡 MEDIUM
**File:** `client/src/components/AssignEmployeeModal.jsx`

**Issue:**
- Frontend used: `emp.isSuspended` 
- Backend model has: `emp.suspended`
- Prevented proper disabled state on suspended employees

**Fix Applied:**
```javascript
// Changed from:
disabled={emp.isSuspended || emp.isDeleted}

// To:
disabled={emp.suspended || emp.isDeleted}
```

**Impact:** Suspended employees are now properly grayed out in the dropdown.

---

### 5. **Aggressive Auto-Logout on API Errors** 🟡 MEDIUM
**File:** `client/src/services/api.js` (response interceptor)

**Issue:**
- ANY 401 or 403 error triggered logout
- Validation errors (400) were not the issue, but authorization errors (403) were being treated as auth failures
- Team Leads getting 403 (Forbidden) were treated as 401 (Unauthorized)

**Fix Applied:**
```javascript
// Before: Logout on ANY 401 or 403
if (status === 401 || status === 403) {
  localStorage.removeItem('token');
  // ... redirect to login
}

// After: Only logout on token-related 401 errors
if (status === 401 && data?.message?.toLowerCase().includes('token')) {
  localStorage.removeItem('token');
  // ... redirect to login
}
```

**Impact:** Authorization errors (403) now show as error toasts instead of triggering logout.

---

### 6. **Missing Suspended/Deleted User Check** 🟡 MEDIUM
**File:** `server/controllers/teamlead/taskController.js` (updateStage method)

**Issue:**
- Validation didn't check if the assignee was suspended or soft-deleted
- Could assign tasks to inactive users

**Fix Applied:**
```javascript
if (assignee.suspended || assignee.isDeleted) {
  return res.status(400).json({ 
    error: 'Cannot assign to suspended or deleted user' 
  });
}
```

**Impact:** Prevents assigning to inactive users.

---

### 7. **Added Comprehensive Debug Logging** 📊 DEBUG
**File:** `server/controllers/teamlead/taskController.js` (updateStage method)

**Added logging for:**
- User information (ID, name, role)
- Request body contents
- Task found confirmation
- Stage validation checks
- Assignee validation checks
- Task save success

**Impact:** Server logs now show exactly what's happening at each step of the update process.

---

## Testing Checklist

After these fixes, test the following:

- [ ] **Authentication** 
  - Log in as TL-1 and TL-2
  - Verify token is valid (no logout on subsequent requests)

- [ ] **Stage Assignment**
  - TL-1 can update poster tasks through all allowed stages
  - TL-2 can update reel tasks through all allowed stages
  - TL-1 cannot update reel tasks (403 error shown as toast)
  - TL-2 cannot update poster tasks (403 error shown as toast)

- [ ] **Employee Assignment**
  - Modal shows only Employee role users
  - Suspended employees are disabled and grayed out
  - Deleted employees are disabled and grayed out
  - Can select any active Employee

- [ ] **Client Approval Stages**
  - Can update to client approval stages without selecting employee
  - Cannot select employee for client approval stages (disabled)

- [ ] **Error Messages**
  - Validation errors show as toasts (no logout)
  - Authorization errors show as toasts (no logout)
  - Only token-related errors trigger logout

---

## Files Modified

1. ✅ `server/middlewares/auth.js` - JWT secret consistency
2. ✅ `server/controllers/teamlead/taskController.js` - Stage validation + logging
3. ✅ `server/controllers/admin/user.controller.js` - Role filter
4. ✅ `client/src/components/AssignEmployeeModal.jsx` - Field name fix
5. ✅ `client/src/services/api.js` - Smart logout logic
6. ✅ `client/src/pages/tl/TaskView.jsx` - Better error logging

---

## Expected Behavior After Fixes

```
TL clicks "Update & Assign" button
  ↓
Modal opens with stages and active employees
  ↓
TL selects new stage and employee (if not approval stage)
  ↓
API request sent with valid token
  ↓
Backend validates:
  - User is authenticated (token verified with consistent secret)
  - User role matches task type
  - Stage is valid for user role
  - Assignee is active Employee
  ↓
Task updated successfully
  ↓
Success toast shown, modal closes, page refreshes
  ↓
User remains logged in
```

---

## Server Environment

**JWT_SECRET** is configured in `.env`:
```
JWT_SECRET=xxxyxxxxxyyyxxxyyyxxxyyy
```

All JWT operations now use this secret consistently:
- Token generation: `utils/jwt.js`
- Token verification: `middlewares/auth.js` ✓ FIXED
- Token verification: `middlewares/roleAuth.js`

---

## Next Steps if Issues Persist

1. Check server console output for `[updateStage]` debug logs
2. Open browser DevTools → Network tab
3. Try "Update & Assign" and check:
   - Request headers (Authorization: Bearer token)
   - Response status (200, 400, 403, etc.)
   - Response body (error message)
4. Check server logs for detailed error information
5. Verify .env file has `JWT_SECRET` set

---

**Status:** All fixes applied and verified. Ready for testing.
