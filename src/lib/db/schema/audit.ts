import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  previousValues: jsonb('previous_values'),
  newValues: jsonb('new_values'),
  performedBy: uuid('performed_by').notNull().references(() => users.id),
  performedAt: timestamp('performed_at', { withTimezone: true }).defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
}, (table) => {
  return {
    entityIdx: index('audit_log_entity_idx').on(table.entityType, table.entityId),
    performedByIdx: index('audit_log_performed_by_idx').on(table.performedBy),
  };
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  performedByUser: one(users, {
    fields: [auditLog.performedBy],
    references: [users.id],
  }),
}));
