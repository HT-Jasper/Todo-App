import { useEffect, useReducer } from 'react';
import { useSearchParams } from 'react-router';
import TodoForm from '../features/Todos/TodoForm.jsx';
import TodoList from '../features/Todos/TodoList/TodoList.jsx';
import SortBy from '../shared/SortBy.jsx';
import StatusFilter from '../shared/StatusFilter.jsx';
import FilterInput from '../shared/FilterInput.jsx';
import useDebounce from '../utils/useDebounce.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  initialTodoState,
  todoReducer,
  TODO_ACTIONS,
} from '../reducers/todoReducer.js';

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
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const tasks = Array.isArray(data) ? data : data.tasks || [];

        dispatch({
          type: TODO_ACTIONS.FETCH_SUCCESS,
          payload: { todos: tasks },
        });
      } catch (error) {
        dispatch({
          type: TODO_ACTIONS.FETCH_ERROR,
          payload: {
            message: `Error fetching todos: ${error.message}`,
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
      payload: { filterTerm: newTerm },
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo. Status: ${response.status}`);
      }

      const data = await response.json();
      const savedTodo = data.task || data;

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
          message: error.message,
        },
      });
    }
  };

  const completeTodo = async (id) => {
    const originalTodo = todoList.find((todo) => todo.id === id);

    if (!originalTodo) return;

    dispatch({
      type: TODO_ACTIONS.COMPLETE_TODO_START,
      payload: { id },
    });

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

      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS,
        payload: {
          id,
          todo: updatedTodo,
        },
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
        payload: {
          todo: originalTodo,
          message: error.message,
        },
      });
    }
  };

  const updateTodo = async (editedTodo) => {
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);

    if (!originalTodo) return;

    dispatch({
      type: TODO_ACTIONS.UPDATE_TODO_START,
      payload: { todo: editedTodo },
    });

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

      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_SUCCESS,
        payload: {
          id: editedTodo.id,
          todo: updatedTodo,
        },
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: {
          todo: originalTodo,
          message: error.message,
        },
      });
    }
  };

  return (
    <>
      {error && (
        <div>
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
        <div>
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

      {isTodoListLoading && <p>Loading todos...</p>}

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

      <TodoForm onAddTodo={addTodo} />

      <TodoList
        todoList={todoList}
        dataVersion={dataVersion}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        statusFilter={statusFilter}
      />
    </>
  );
}