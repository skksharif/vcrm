const { TASK_TYPES } = require('../../models/constants');

const STAGE_RULES = {
  'TL-1': {
    [TASK_TYPES.POSTER]: [
      'Content Writing',
      'Content Client Approval',
      'Designing'
    ],
    [TASK_TYPES.REEL]: [
      'Content Writing',
      'Content Client Approval',
      'Shooting',
      'Editing',
    ]
  },
  'TL-2': {
    [TASK_TYPES.POSTER]: [
      'Design Client Approval',
      'Ready to Post'
    ],
    [TASK_TYPES.REEL]: [
      'Editing Client Approval',
      'Ready to Post'
    ]
  }
};

exports.canHandleStage = (role, taskType, stage) =>
  STAGE_RULES?.[role]?.[taskType]?.includes(stage);
