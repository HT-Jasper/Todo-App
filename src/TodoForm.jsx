import { useRef } from 'react';

export default function TodoForm({ onAddTodo }) {
  const inputRef = useRef();

  const handleAddTodo = (event) => {
    event.preventDefault();

    console.log('Event object:', event);
    console.log('Event target:', event.target);
    console.log('Input value:', event.target.value);

    // .trim prevents whitespace only todos
    const todoTitle = event.currentTarget.form.todoTitle.value.trim();
    if (todoTitle && todoTitle !== "") {
      onAddTodo(todoTitle);
      event.currentTarget.form.reset();
      inputRef.current.focus();
    }
  };

  return (
  <form>
    <label htmlFor="todoTitle">Todo</label>
    <input
      ref={inputRef}
      type="text"
      id="todoTitle"
      name="todoTitle"
      placeholder={'Todo text'}
      required
    />
    <button type="submit" onClick={handleAddTodo}>
      Add Todo
    </button>
  </form>
);
}
