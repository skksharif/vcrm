export const ROLES = Object.freeze({
  CEO: 'CEO',
  HR: 'HR',
  GM: 'General Manager',
  TEAM_LEAD: 'Team Lead',
  TL_1: 'TL-1',
  TL_2: 'TL-2',
  EMPLOYEE: 'Employee',
  SMM: 'Social Media Manager'
});

export const CLIENT_PRIORITY = Object.freeze({
  BASIC: 'Basic',
  ADVANCE: 'Advance',
  PREMIUM: 'Premium'
});

export const TASK_TYPES = Object.freeze({
  POSTER: 'poster',
  REEL: 'reel'
});

export const INITIAL_TASK_STAGE = 'Not Started Yet';

export const POSTER_STAGES = [
  INITIAL_TASK_STAGE,
  'Content Writing',
  'Content Client Approval',
  'Designing',
  'Design Client Approval',
  'Ready to Post',
  'Posted'
];

export const REEL_STAGES = [
  INITIAL_TASK_STAGE,
  'Content Writing',
  'Content Client Approval',
  'Shooting',
  'Editing',
  'Editing Client Approval',
  'Ready to Post',
  'Posted'
];
