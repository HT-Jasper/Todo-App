import React, { useState, useRef } from 'react';

export default function TodoForm({ onAddTodo }) {
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const inputRef = useRef(null);

  const handleAddTodo = () => {
    const title = workingTodoTitle.trim();
    if (!title) return;
    onAddTodo(title);
    setWorkingTodoTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo();
    }
  };

  return (
    <form>
      <label htmlFor="todoTitle">Todo</label>
      <input
        ref={inputRef}
        id="todoTitle"
        name="todoTitle"
        type="text"
        placeholder="Todo text"
        required
        value={workingTodoTitle}
        onChange={(e) => setWorkingTodoTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleAddTodo}
        disabled={!workingTodoTitle.trim()}
      >
        Add Todo
      </button>
    </form>
  );
}
