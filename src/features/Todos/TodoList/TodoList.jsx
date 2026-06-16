import { useMemo } from 'react';
import TodoListItem from './TodoListItem.jsx';

export default function TodoList({
  todoList,
  dataVersion,
  onCompleteTodo,
  onDeleteTodo,
  onUpdateTodo,
  statusFilter = 'active',
}) {
  const filteredTodoList = useMemo(() => {
    let filteredTodos;

    switch (statusFilter) {
      case 'completed':
        filteredTodos = todoList.filter((todo) => todo.isCompleted);
        break;
      case 'active':
        filteredTodos = todoList.filter((todo) => !todo.isCompleted);
        break;
      case 'all':
      default:
        filteredTodos = todoList;
        break;
    }

    return {
      version: dataVersion,
      todos: filteredTodos,
    };
  }, [todoList, dataVersion, statusFilter]);

  const getEmptyMessage = () => {
    switch (statusFilter) {
      case 'completed':
        return 'No completed todos yet. Complete some tasks to see them here.';
      case 'active':
        return 'No active todos. Add a todo above to get started.';
      case 'all':
      default:
        return 'Add todo above to get started.';
    }
  };

  return filteredTodoList.todos.length === 0 ? (
    <div className="empty-state" role="status">
      <p>{getEmptyMessage()}</p>
    </div>
  ) : (
    <ul className="todo-list">
      {filteredTodoList.todos.map((todo) => (
        <TodoListItem
          key={todo.id ?? todo._id}
          todo={todo}
          onCompleteTodo={onCompleteTodo}
          onDeleteTodo={onDeleteTodo}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
    </ul>
  );
}
