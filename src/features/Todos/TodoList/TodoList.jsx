import { useMemo } from 'react';
import TodoListItem from './TodoListItem.jsx';

export default function TodoList({
  todoList,
  dataVersion,
  onCompleteTodo,
  onUpdateTodo,
}) {
  const filteredTodoList = useMemo(() => {
    return {
      version: dataVersion,
      todos: todoList.filter((todo) => !todo.isCompleted),
    };
  }, [todoList, dataVersion]);

  return filteredTodoList.todos.length === 0 ? (
    <p>Add todo above to get started</p>
  ) : (
    <ul>
      {filteredTodoList.todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          onCompleteTodo={onCompleteTodo}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
    </ul>
  );
}