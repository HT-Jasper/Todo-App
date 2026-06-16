import { useRef, useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel.jsx';
import {
  TODO_TITLE_MAX_LENGTH,
  isValidTodoTitle,
  prepareTodoTitle,
} from '../../utils/todoValidation.js';

export default function TodoForm({ onAddTodo }) {
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const inputRef = useRef(null);

  const handleAddTodo = (event) => {
    event.preventDefault();
    const result = prepareTodoTitle(workingTodoTitle);

    if (result.error) {
      setTitleError(result.error);
      return;
    }

    onAddTodo(result.title);
    setWorkingTodoTitle('');
    setTitleError('');
    inputRef.current?.focus();
  };

  return (
    <form className="todo-form" onSubmit={handleAddTodo}>
      <TextInputWithLabel
        elementId="todoTitle"
        helpText={`${workingTodoTitle.trim().length}/${TODO_TITLE_MAX_LENGTH} characters`}
        labelText="New todo"
        maxLength={TODO_TITLE_MAX_LENGTH}
        onChange={(event) => {
          setWorkingTodoTitle(event.target.value);
          setTitleError('');
        }}
        placeholder="Add a clear, actionable task"
        ref={inputRef}
        required
        value={workingTodoTitle}
      />
      {titleError && <p className="form-error">{titleError}</p>}

      <button disabled={!isValidTodoTitle(workingTodoTitle)} type="submit">
        Add Todo
      </button>
    </form>
  );
}
