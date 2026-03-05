import { api } from 'encore.dev/api';
import TodoService from './todo.service';

interface Todo {
    id: string;
    name: string;
    isDone: boolean;
    createdAt: Date;
}

interface ListResponse {
    items: Todo[];
}

interface ItemResponse {
    item: Todo;
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
    async (): Promise<ListResponse> => {
        const items = await TodoService.getAll();
        return { items: items ?? [] }; // Wrap array in the named interface
    },
);

interface CreateRequest {
    name: string;
}

export const create = api(
    { method: 'POST', path: '/items', expose: true },
    async (req: CreateRequest): Promise<ItemResponse> => {
        const item = await TodoService.create(req);
        return { item };
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
    }): Promise<ItemResponse> => {
        const item = await TodoService.update(id, body);
        return { item };
    },
);

export const destroy = api(
    { method: 'DELETE', path: '/items/:id', expose: true },
    async ({ id }: { id: string }): Promise<ItemResponse> => {
        const item = await TodoService.delete(id);
        return { item };
    },
);
