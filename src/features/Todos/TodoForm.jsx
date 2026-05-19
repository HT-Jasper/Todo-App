import React, { useState, useRef } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel.jsx';
import { isValidTodoTitle } from '../../utils/todoValidation.js';

export default function TodoForm({ onAddTodo }) {
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const inputRef = useRef(null);

  const handleAddTodo = (event) => {
    event.preventDefault();
    const title = workingTodoTitle.trim();

    if (!isValidTodoTitle(title)) return;
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
    <form onSubmit={handleAddTodo}>
      <TextInputWithLabel 
      elementID='todoTitle'
      labelText='ToDo'
      onChange={(e) => setWorkingTodoTitle(e.target.value)}
      ref={inputRef}
      value={workingTodoTitle}
      />
  
      <button disabled={!isValidTodoTitle(workingTodoTitle)}>Add Todo</button>
    </form>
  );
}
