import log from 'encore.dev/log';
import TodoRepository from './todo.repo';
import { APIError } from 'encore.dev/api';

interface CreateInput {
    name: string;
}

interface UpdateInput {
    name?: string;
    isDone?: boolean;
}

const TodoService = {
    getAll: async () => {
        try {
            return await TodoRepository.getItems();
        } catch (err) {
            log.error('Operation failed', { error: String(err) });
            throw APIError.internal('Database operation failed');
        }
    },
    create: async (input: CreateInput) => {
        try {
            return await TodoRepository.createItem(input);
        } catch (err) {
            log.error('Operation failed', { error: String(err) });
            throw APIError.internal('Database operation failed');
        }
    },
    update: async (id: string, input: UpdateInput) => {
        try {
            return await TodoRepository.updateItem(id, input);
        } catch (err) {
            log.error('Operation failed', { error: String(err) });
            throw APIError.internal('Database operation failed');
        }
    },
    delete: async (id: string) => {
        try {
            return await TodoRepository.deleteItem(id);
        } catch (err) {
            log.error('Operation failed', { error: String(err) });
            throw APIError.internal('Database operation failed');
        }
    },
};

export default TodoService;
