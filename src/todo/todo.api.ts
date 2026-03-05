import { api } from 'encore.dev/api';
import TodoService from './todo.service';

interface Todo {
    id: string;
    name: string;
    isDone: boolean;
    createdAt: Date;
}

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
    async (): Promise<Todo[]> => {
        return await TodoService.getAll();
    },
);

interface CreateRequest {
    name: string;
}

export const create = api(
    { method: 'POST', path: '/items', expose: true },
    async (req: CreateRequest): Promise<Todo> => {
        return await TodoService.create(req);
    },
);

interface UpdateRequest {
    name?: string;
    isDone?: boolean;
}

export const update = api(
    { method: 'PUT', path: '/items/:id', expose: true },
    async ({
        id,
        body,
    }: {
        id: string;
        body: UpdateRequest;
    }): Promise<Todo> => {
        return await TodoService.update(id, body);
    },
);

export const destroy = api(
    { method: 'DELETE', path: '/items/:id', expose: true },
    async ({ id }: { id: string }): Promise<Todo> => {
        return await TodoService.delete(id);
    },
);
