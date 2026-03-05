import { db } from '../db/database';
import { InferSelectModel } from 'drizzle-orm';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';
import log from 'encore.dev/log';

type TodoItem = InferSelectModel<typeof todos>;
type CreateItemInput = Omit<TodoItem, 'createdAt' | 'id' | 'isDone'>;
type UpdateItemInput = Partial<Omit<TodoItem, 'createdAt' | 'id'>>;

const TodoRepository = {
    getItems: async (): Promise<TodoItem[]> => {
        log.info('Database: Fetching all items');
        try {
            const items = await db.select().from(todos);
            log.info(`Database: Successfully retrieved ${items.length} items`);
            return items;
        } catch (err) {
            log.error('Database Error: Failed to get items', {
                error: String(err),
            });
            throw err;
        }
    },

    createItem: async (input: CreateItemInput): Promise<TodoItem> => {
        log.info('Database: Creating new item', { name: input.name });
        try {
            const [createdItem] = await db
                .insert(todos)
                .values(input)
                .returning();
            log.info('Database: Item created', { id: createdItem.id });
            return createdItem;
        } catch (err) {
            log.error('Database Error: Failed to create item', {
                error: String(err),
            });
            throw err;
        }
    },

    updateItem: async (
        id: string,
        input: UpdateItemInput,
    ): Promise<TodoItem> => {
        log.info('Database: Updating item', { id, updates: input });
        try {
            const [updatedItem] = await db
                .update(todos)
                .set(input)
                .where(eq(todos.id, id))
                .returning();

            if (!updatedItem) {
                log.warn('Database: No item found to update', { id });
            }
            return updatedItem;
        } catch (err) {
            log.error('Database Error: Failed to update item', {
                id,
                error: String(err),
            });
            throw err;
        }
    },

    deleteItem: async (id: string) => {
        log.info('Database: Deleting item', { id });
        try {
            const [deletedItem] = await db
                .delete(todos)
                .where(eq(todos.id, id))
                .returning();

            if (!deletedItem) {
                log.warn('Database: No item found to delete', { id });
            }
            return deletedItem;
        } catch (err) {
            log.error('Database Error: Failed to delete item', {
                id,
                error: String(err),
            });
            throw err;
        }
    },
};

export default TodoRepository;
