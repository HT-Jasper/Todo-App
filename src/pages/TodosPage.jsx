import { useEffect, useReducer } from 'react';
import { useSearchParams } from 'react-router';
import TodoForm from '../features/Todos/TodoForm.jsx';
import TodoList from '../features/Todos/TodoList/TodoList.jsx';
import SortBy from '../shared/SortBy.jsx';
import StatusFilter from '../shared/StatusFilter.jsx';
import FilterInput from '../shared/FilterInput.jsx';
import useDebounce from '../utils/useDebounce.js';
import { prepareSearchTerm } from '../utils/todoValidation.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  initialTodoState,
  todoReducer,
  TODO_ACTIONS,
} from '../reducers/todoReducer.js';

function getTodoId(todo) {
  return todo.id ?? todo._id;
}

function normalizeCompletion(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return Boolean(value);
}

function normalizeTodo(todo) {
  const id = getTodoId(todo);

  return {
    ...todo,
    id,
    title: todo.title ?? '',
    isCompleted: normalizeCompletion(todo.isCompleted ?? todo.completed ?? false),
  };
}

function normalizeTodos(todos) {
  return todos.map(normalizeTodo).filter((todo) => todo.id !== undefined && todo.id !== null);
}

function getTodoTimestamp(todo) {
  return new Date(todo.createdAt || todo.creationDate || todo.updatedAt || 0).getTime();
}

function sortTodos(todos, sortBy, sortDirection) {
  const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

  return [...todos].sort((firstTodo, secondTodo) => {
    if (sortBy === 'title') {
      return (
        String(firstTodo.title).localeCompare(String(secondTodo.title), undefined, {
          sensitivity: 'base',
        }) * directionMultiplier
      );
    }

    const firstTimestamp = getTodoTimestamp(firstTodo);
    const secondTimestamp = getTodoTimestamp(secondTodo);

    if (firstTimestamp === secondTimestamp) {
      return String(getTodoId(firstTodo)).localeCompare(String(getTodoId(secondTodo))) * directionMultiplier;
    }

    return (firstTimestamp - secondTimestamp) * directionMultiplier;
  });
}

function mergeTodo(originalTodo, returnedTodo, overrides = {}) {
  return normalizeTodo({
    ...originalTodo,
    ...returnedTodo,
    ...overrides,
  });
}

const TODO_OVERRIDES_STORAGE_KEY = 'todoLocalOverrides';

function readTodoOverrides() {
  try {
    return JSON.parse(window.localStorage.getItem(TODO_OVERRIDES_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeTodoOverride(id, todo) {
  try {
    const overrides = readTodoOverrides();

    overrides[id] = {
      title: todo.title,
      isCompleted: todo.isCompleted,
      completed: todo.isCompleted,
    };

    window.localStorage.setItem(TODO_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    return;
  }
}

function removeTodoOverride(id) {
  try {
    const overrides = readTodoOverrides();
    delete overrides[id];
    window.localStorage.setItem(TODO_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    return;
  }
}

function applyLocalOverrides(todos) {
  const overrides = readTodoOverrides();

  return todos.map((todo) => {
    const todoOverride = overrides[getTodoId(todo)];
    return todoOverride ? normalizeTodo({ ...todo, ...todoOverride }) : todo;
  });
}

async function readJsonResponse(response) {
  if (response.status === 204) {
    return {};
  }

  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function sendTodoUpdate(id, payload, token) {
  const requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': token,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  };

  const patchResponse = await fetch(`/api/tasks/${id}`, {
    ...requestOptions,
    method: 'PATCH',
  });

  if (patchResponse.ok) {
    return readJsonResponse(patchResponse);
  }

  const putResponse = await fetch(`/api/tasks/${id}`, {
    ...requestOptions,
    method: 'PUT',
  });

  if (putResponse.ok) {
    return readJsonResponse(putResponse);
  }

  throw new Error('Unable to update todo.');
}

export default function TodosPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const {
    todoList,
    error,
    filterError,
    isTodoListLoading,
    sortBy,
    sortDirection,
    filterTerm,
    dataVersion,
  } = state;

  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    if (!token) return;

    async function fetchTodos() {
      dispatch({ type: TODO_ACTIONS.FETCH_START });

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
          throw new Error('Unable to load todos.');
        }

        const data = await response.json();
        const tasks = applyLocalOverrides(
          normalizeTodos(Array.isArray(data) ? data : data.tasks || [])
        );
        const sortedTasks = sortTodos(tasks, sortBy, sortDirection);

        dispatch({
          type: TODO_ACTIONS.FETCH_SUCCESS,
          payload: { todos: sortedTasks },
        });
      } catch (error) {
        dispatch({
          type: TODO_ACTIONS.FETCH_ERROR,
          payload: {
            message: 'We could not load todos. Please try again.',
            isFilterError:
              !!debouncedFilterTerm ||
              sortBy !== 'creationDate' ||
              sortDirection !== 'desc',
          },
        });
      }
    }

    fetchTodos();
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  const handleFilterChange = (newTerm) => {
    dispatch({
      type: TODO_ACTIONS.SET_FILTER,
      payload: { filterTerm: prepareSearchTerm(newTerm) },
    });
  };

  const handleResetFilters = () => {
    dispatch({ type: TODO_ACTIONS.RESET_FILTERS });
  };

  const addTodo = async (title) => {
    const temporaryTodo = {
      id: `temp-${Date.now()}`,
      title,
      isCompleted: false,
    };

    dispatch({
      type: TODO_ACTIONS.ADD_TODO_START,
      payload: { todo: temporaryTodo },
    });

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
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to add todo.');
      }

      const data = await response.json();
      const savedTodo = normalizeTodo(data.task || data);

      dispatch({
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: {
          temporaryId: temporaryTodo.id,
          todo: savedTodo,
        },
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_ERROR,
        payload: {
          temporaryId: temporaryTodo.id,
          message: 'We could not add that todo. Please try again.',
        },
      });
    }
  };

  const completeTodo = async (id) => {
    const originalTodo = todoList.find((todo) => getTodoId(todo) === id);

    if (!originalTodo) return;

    const nextIsCompleted = !originalTodo.isCompleted;

    dispatch({
      type: TODO_ACTIONS.COMPLETE_TODO_START,
      payload: { id, isCompleted: nextIsCompleted },
    });

    const optimisticTodo = mergeTodo(originalTodo, {}, {
      isCompleted: nextIsCompleted,
      completed: nextIsCompleted,
    });

    writeTodoOverride(id, optimisticTodo);

    try {
      const updatePayload = {
        isCompleted: nextIsCompleted,
        createdAt: originalTodo.createdAt,
      };

      const data = await sendTodoUpdate(id, updatePayload, token);
      const updatedTodo = mergeTodo(originalTodo, data.task || data, {
        isCompleted: nextIsCompleted,
        completed: nextIsCompleted,
      });

      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS,
        payload: {
          id,
          todo: updatedTodo,
        },
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS,
        payload: {
          id,
          todo: optimisticTodo,
        },
      });
    }
  };

  const updateTodo = async (editedTodo) => {
    const editedTodoId = getTodoId(editedTodo);
    const originalTodo = todoList.find((todo) => getTodoId(todo) === editedTodoId);

    if (!originalTodo) return;

    dispatch({
      type: TODO_ACTIONS.UPDATE_TODO_START,
      payload: { todo: editedTodo },
    });

    try {
      const nextIsCompleted = Boolean(editedTodo.isCompleted ?? editedTodo.completed);
      const updatePayload = {
        title: editedTodo.title,
        isCompleted: nextIsCompleted,
        completed: nextIsCompleted,
        createdAt: originalTodo.createdAt,
      };

      const data = await sendTodoUpdate(editedTodoId, updatePayload, token);
      const updatedTodo = mergeTodo(originalTodo, data.task || data, {
        title: editedTodo.title,
        isCompleted: nextIsCompleted,
        completed: nextIsCompleted,
      });

      writeTodoOverride(editedTodoId, updatedTodo);

      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_SUCCESS,
        payload: {
          id: editedTodoId,
          todo: updatedTodo,
        },
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: {
          todo: originalTodo,
          message: 'We could not save that todo. Please try again.',
        },
      });
    }
  };

  const deleteTodo = async (id) => {
    const originalTodo = todoList.find((todo) => getTodoId(todo) === id);

    if (!originalTodo) return;

    dispatch({
      type: TODO_ACTIONS.DELETE_TODO_START,
      payload: { id },
    });

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Unable to delete todo.');
      }

      dispatch({ type: TODO_ACTIONS.DELETE_TODO_SUCCESS });
      removeTodoOverride(id);
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.DELETE_TODO_ERROR,
        payload: {
          todo: originalTodo,
          message: 'We could not delete that todo. Please try again.',
        },
      });
    }
  };

  return (
    <main className="page-shell todos-page">
      <section className="page-heading">
        <p className="eyebrow">Task dashboard</p>
        <h2>Todos</h2>
        <p>
          Capture what matters, keep priorities visible, and move completed
          work out of the way.
        </p>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_ERROR })}
          >
            Clear Error
          </button>
        </div>
      )}

      {filterError && (
        <div className="alert alert-warning" role="alert">
          <p>{filterError}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_FILTER_ERROR })}
          >
            Clear Filter Error
          </button>
          <button type="button" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      <section className="todo-toolbar" aria-label="Todo controls">
        <SortBy
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={(newSortBy) =>
            dispatch({
              type: TODO_ACTIONS.SET_SORT,
              payload: { sortBy: newSortBy, sortDirection },
            })
          }
          onSortDirectionChange={(newSortDirection) =>
            dispatch({
              type: TODO_ACTIONS.SET_SORT,
              payload: { sortBy, sortDirection: newSortDirection },
            })
          }
        />

        <StatusFilter />

        <FilterInput
          filterTerm={filterTerm}
          onFilterChange={handleFilterChange}
        />
      </section>

      <TodoForm onAddTodo={addTodo} />

      {isTodoListLoading && (
        <div className="loading-state" role="status">
          Loading todos...
        </div>
      )}

      <TodoList
        todoList={todoList}
        dataVersion={dataVersion}
        onCompleteTodo={completeTodo}
        onDeleteTodo={deleteTodo}
        onUpdateTodo={updateTodo}
        statusFilter={statusFilter}
      />
    </main>
  );
}
