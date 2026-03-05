import { api } from 'encore.dev/api';
import TodoService from './todo.service';

export const root = api(
    { method: 'GET', path: '/', expose: true },
    async (): Promise<{ message: string }> => {
        return {
            message:
                "Welcome to Nathan's Todo App, go to /items to view current to-do list",
        };
    },
);

export const getAll = api(
    { method: 'GET', path: '/items', expose: true },
    async () => {
        try {
            return await TodoService.getAll();
        } catch (err) {}
    },
);

interface CreateRequest {
    name: string;
}

export const create = api(
    { method: 'POST', path: '/items', expose: true },
    async (req: CreateRequest) => {
        return await TodoService.create(req);
    },
);

interface UpdateRequest {
    name?: string;
    isDone?: boolean;
}

export const update = api(
    { method: 'PUT', path: '/items/:id', expose: true },
    async ({ id, body }: { id: string; body: UpdateRequest }) => {
        return await TodoService.update(id, body);
    },
);

export const destroy = api(
    { method: 'DELETE', path: '/items/:id', expose: true },
    async ({ id }: { id: string }) => {
        return await TodoService.delete(id);
    },
);
