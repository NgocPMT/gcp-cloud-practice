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
            if (err instanceof Error) {
                log.error(
                    'Something went wrong when getting items from the database',
                    { error: err.stack },
                );
                throw APIError.internal(
                    'Something went wrong when getting items, please try again later.',
                );
            }
        }
    },
    create: async (input: CreateInput) => {
        try {
            return await TodoRepository.createItem(input);
        } catch (err) {
            if (err instanceof Error) {
                log.error(
                    'Something went wrong when inserting new to-do item to the database',
                    { error: err.stack },
                );
                throw APIError.internal(
                    'Something went wrong when creating item, please try again later.',
                );
            }
        }
    },
    update: async (id: string, input: UpdateInput) => {
        try {
            return await TodoRepository.updateItem(id, input);
        } catch (err) {
            if (err instanceof Error) {
                log.error(
                    'Something went wrong when updating to-do item from database',
                    { error: err.stack },
                );
                throw APIError.internal(
                    'Something went wrong when updating item, please try again later.',
                );
            }
        }
    },
    delete: async (id: string) => {
        try {
            return await TodoRepository.deleteItem(id);
        } catch (err) {
            if (err instanceof Error) {
                log.error(
                    'Something went wrong when deleting to-do item from database',
                    { error: err.stack },
                );
                throw APIError.internal(
                    'Something went wrong when deleting item, please try again later.',
                );
            }
        }
    },
};

export default TodoService;
