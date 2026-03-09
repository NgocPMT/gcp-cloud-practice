import TodoClient from "@/components/TodoClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <h1 className="text-center text-3xl font-bold mb-8 text-gray-800">
        Todo app
      </h1>
      <div className="flex justify-center">
        <TodoClient />
      </div>
    </div>
  );
}
