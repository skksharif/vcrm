const ROLES = Object.freeze({
  CEO: 'CEO',
  HR: 'HR',
  GM: 'General Manager',
  TEAM_LEAD: 'Team Lead',
  TL_1: 'TL-1',
  TL_2: 'TL-2',
  EMPLOYEE: 'Employee',
  SMM: 'Social Media Manager'
});

const CLIENT_PRIORITY = Object.freeze({
  BASIC: 'Basic',
  ADVANCE: 'Advance',
  PREMIUM: 'Premium'
});

const TASK_TYPES = Object.freeze({
  POSTER: 'poster',
  REEL: 'reel'
});

const INITIAL_TASK_STAGE = 'Not Started Yet';

const POSTER_STAGES = [
  INITIAL_TASK_STAGE,
  'Content Writing',
  'Content Client Approval',
  'Designing',
  'Design Client Approval',
  'Ready to Post',
  'Posted'
];

const REEL_STAGES = [
  INITIAL_TASK_STAGE,
  'Content Writing',
  'Content Client Approval',
  'Shooting',
  'Editing',
  'Editing Client Approval',
  'Ready to Post',
  'Posted'
];

module.exports = {
  ROLES,
  CLIENT_PRIORITY,
  TASK_TYPES,
  POSTER_STAGES,
  REEL_STAGES,
  INITIAL_TASK_STAGE
};
