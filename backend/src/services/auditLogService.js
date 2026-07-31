const db = require('../models');

exports.logAction = async ({ actorUserId, actorRole, action, entityType, entityId, description, reason }) => {
  return db.AuditLog.create({
    ActorUserId: actorUserId,
    ActorRole: actorRole,
    Action: action,
    EntityType: entityType,
    EntityId: entityId,
    Description: description,
    Reason: reason || null,
    CreatedAt: new Date()
  });
};
