import { useCallback, useEffect, useState } from 'react';
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';
import useDebounce from '../../utils/useDebounce.js';

export default function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [sortBy, setSortBy] = useState('creationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterError, setFilterError] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  const invalidateCache = useCallback(() => {
    setDataVersion((prevDataVersion) => prevDataVersion + 1);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchTodos() {
      setIsTodoListLoading(true);
      setError('');

      const paramsObject = {
        sortBy,
        sortDirection,
      };

      if (debouncedFilterTerm) {
        paramsObject.find = debouncedFilterTerm;
      }

      const params = new URLSearchParams(paramsObject);

      try {
        const response = await fetch(`/api/tasks?${params}`, {
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
        const tasks = Array.isArray(data) ? data : data.tasks || [];

        setTodoList(tasks);
        setFilterError('');
      } catch (error) {
        if (
          debouncedFilterTerm ||
          sortBy !== 'creationDate' ||
          sortDirection !== 'desc'
        ) {
          setFilterError(`Error filtering/sorting todos: ${error.message}`);
        } else {
          setError(`Error fetching todos: ${error.message}`);
        }
      } finally {
        setIsTodoListLoading(false);
      }
    }

    fetchTodos();
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  const handleFilterChange = (newTerm) => {
    setFilterTerm(newTerm);
  };

  const handleResetFilters = () => {
    setFilterTerm('');
    setSortBy('creationDate');
    setSortDirection('desc');
    setFilterError('');
  };

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
      invalidateCache();
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
        prevTodoList.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      invalidateCache();
    } catch (error) {
      setTodoList((prevTodoList) =>
        prevTodoList.map((todo) => (todo.id === id ? originalTodo : todo))
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
      invalidateCache();
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

      {filterError && (
        <div>
          <p>{filterError}</p>
          <button type="button" onClick={() => setFilterError('')}>
            Clear Filter Error
          </button>
          <button type="button" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {isTodoListLoading && <p>Loading todos...</p>}

      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />

      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />

      <TodoForm onAddTodo={addTodo} />

      <TodoList
        todoList={todoList}
        dataVersion={dataVersion}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </>
  );
}