import {
    boolean,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    isDone: boolean().default(false).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});
