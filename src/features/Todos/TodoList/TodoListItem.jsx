import { useState } from 'react';
import TextInputWithLabel from '../../../shared/TextInputWithLabel.jsx';
import {
  TODO_TITLE_MAX_LENGTH,
  isValidTodoTitle,
  prepareTodoTitle,
} from '../../../utils/todoValidation.js';

export default function TodoListItem({
  todo,
  onCompleteTodo,
  onDeleteTodo,
  onUpdateTodo,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);
  const [editError, setEditError] = useState('');

  const handleCancel = () => {
    setWorkingTitle(todo.title);
    setEditError('');
    setIsEditing(false);
  };

  const handleEdit = (event) => {
    setWorkingTitle(event.target.value);
    setEditError('');
  };

  const handleUpdate = (event) => {
    if (!isEditing) return;

    event.preventDefault();
    const result = prepareTodoTitle(workingTitle);

    if (result.error) {
      setEditError(result.error);
      return;
    }

    onUpdateTodo({
      ...todo,
      title: result.title,
    });

    setEditError('');
    setIsEditing(false);
  };

  return (
    <li className={todo.isCompleted ? 'todo-item is-complete' : 'todo-item'}>
      <form className="todo-item-form" onSubmit={handleUpdate}>
        {isEditing ? (
          <div className="todo-edit-row">
            <TextInputWithLabel
              elementId={`editTodo${todo.id}`}
              labelText="Edit todo"
              maxLength={TODO_TITLE_MAX_LENGTH}
              onChange={handleEdit}
              value={workingTitle}
            />

            {editError && <p className="form-error">{editError}</p>}

            <div className="todo-actions">
              <button type="button" className="button-secondary" onClick={handleCancel}>
              Cancel
              </button>

              <button type="submit" disabled={!isValidTodoTitle(workingTitle)}>
                Update
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="todo-checkbox">
              <input
                type="checkbox"
                id={`checkbox${todo.id}`}
                checked={todo.isCompleted}
                onChange={() => onCompleteTodo(todo.id)}
              />
              <span className="checkbox-control" aria-hidden="true" />
              <span className="sr-only">
                {todo.isCompleted ? 'Mark todo active' : 'Mark todo complete'}
              </span>
            </label>

            <button
              className="todo-title-button"
              type="button"
              onClick={() => setIsEditing(true)}
            >
              {todo.title}
            </button>

            <div className="todo-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="button-danger"
                type="button"
                onClick={() => onDeleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </form>
    </li>
  );
}
