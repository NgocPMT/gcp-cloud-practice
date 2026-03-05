import { db } from '../db/database';
import { InferSelectModel } from './../../node_modules/drizzle-orm/table.d';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';

type TodoItem = InferSelectModel<typeof todos>;
type CreateItemInput = Omit<
    InferSelectModel<typeof todos>,
    'createdAt' | 'id' | 'isDone'
>;
type UpdateItemInput = Partial<
    Omit<InferSelectModel<typeof todos>, 'createdAt' | 'id'>
>;

const TodoRepository = {
    getItems: async (): Promise<TodoItem[]> => {
        const items = await db.select().from(todos);
        return items;
    },
    createItem: async (input: CreateItemInput): Promise<TodoItem> => {
        const [createdItem] = await db.insert(todos).values(input).returning();
        return createdItem;
    },
    updateItem: async (
        id: string,
        input: UpdateItemInput,
    ): Promise<TodoItem> => {
        const [updatedItem] = await db
            .update(todos)
            .set(input)
            .where(eq(todos.id, id))
            .returning();
        return updatedItem;
    },
    deleteItem: async (id: string) => {
        const [deletedItem] = await db
            .delete(todos)
            .where(eq(todos.id, id))
            .returning();
        return deletedItem;
    },
};

export default TodoRepository;
