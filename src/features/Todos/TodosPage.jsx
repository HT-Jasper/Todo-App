import { useEffect, useState } from 'react';
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';

export default function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchTodos() {
      setIsTodoListLoading(true);
      setError('');

      try {
        const response = await fetch('/api/tasks', {
          method: 'GET',
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        setTodoList(data.tasks);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsTodoListLoading(false);
      }
    }

    fetchTodos();
  }, [token]);

  const addTodo = async (title) => {
    const temporaryTodo = {
        id: `temp-${Date.now()}`,
        title,
        isCompleted: false,
    };

    setTodoList((prevTodoList) => [...prevTodoList, temporaryTodo]);
    setError('');

    try {
        const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
            title,
            isCompleted: false,
        }),
        });

        if (!response.ok) {
        throw new Error(`Failed to add todo. Status: ${response.status}`);
        }

        const data = await response.json();
        const savedTodo = data.task || data;

        setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
            todo.id === temporaryTodo.id ? savedTodo : todo
        )
        );
    } catch (error) {
        setTodoList((prevTodoList) =>
        prevTodoList.filter((todo) => todo.id !== temporaryTodo.id)
        );

        setError(error.message);
    }
    };
  
  const completeTodo = async (id) => {
    const originalTodo = todoList.find((todo) => todo.id === id);
    if (!originalTodo) return;
    setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: true } : todo
        )
    );
    setError('');
    try {
        const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
            isCompleted: true,
            createdAt: originalTodo.createdAt,
        }),
        });

        if (!response.ok) {
        throw new Error(`Failed to complete todo. Status: ${response.status}`);
        }

        const data = await response.json();
        const updatedTodo = data.task || data;

        setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
            todo.id === id ? updatedTodo : todo
        )
        );
    } catch (error) {
        setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
            todo.id === id ? originalTodo : todo
        )
        );
        setError(error.message);
    }
  };

  const updateTodo = async (editedTodo) => {
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);

    if (!originalTodo) return;
    setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
        todo.id === editedTodo.id ? editedTodo : todo
        )
    );
    setError('');

    try {
        const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
            title: editedTodo.title,
            isCompleted: editedTodo.isCompleted,
            createdAt: originalTodo.createdAt,
        }),
        });
        if (!response.ok) {
        throw new Error(`Failed to update todo. Status: ${response.status}`);
        }

        const data = await response.json();
        const updatedTodo = data.task || data;
        setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
            todo.id === editedTodo.id ? updatedTodo : todo
        )
        );
    } catch (error) {
        setTodoList((prevTodoList) =>
        prevTodoList.map((todo) =>
            todo.id === editedTodo.id ? originalTodo : todo
        )
        );
        setError(error.message);
    }
    };

  return (
    <>
        {error && (
        <div>
            <p>{error}</p>
            <button type="button" onClick={() => setError('')}>
            Clear Error
            </button>
        </div>
        )}

        {isTodoListLoading && <p>Loading todos...</p>}

        <TodoForm onAddTodo={addTodo} />

        <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        />
    </>
    );
}