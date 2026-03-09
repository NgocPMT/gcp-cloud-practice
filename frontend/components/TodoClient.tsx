"use client";

import { useState, useEffect } from "react";
import { encore } from "@/lib/encore";
import { Trash2 } from "lucide-react";

interface Todo {
  id: string;
  name: string;
  isDone: boolean;
  createdAt: string;
}

export default function TodoClient() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await encore.todo.getAll();
      setTodos(response.items);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await encore.todo.create({ name: newItem });
      setTodos([...todos, response.item]);
      setNewItem("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      const todo = todos.find((t) => t.id === todoId);
      if (!todo) return;

      // Call update API (you may need to add this to your backend)
      const response = await encore.todo.update(todoId, {
        body: { isDone: !todo.isDone },
      });

      setTodos(todos.map((t) => (t.id === todoId ? response.item : t)));
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await encore.todo.destroy(todoId);
      setTodos(todos.filter((t) => t.id !== todoId));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded transition-colors"
        >
          Add Item
        </button>
      </form>

      <div className="bg-white border border-gray-300 rounded shadow-sm">
        {todos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No todos yet</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span
                  className={`flex-1 ${
                    todo.isDone ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {todo.name}
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  aria-label="Delete todo"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
