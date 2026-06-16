import DOMPurify from 'dompurify';

export const TODO_TITLE_MAX_LENGTH = 120;
export const SEARCH_TERM_MAX_LENGTH = 80;

export function sanitizePlainText(value) {
  return DOMPurify.sanitize(String(value).trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function getTodoTitleError(title) {
  const trimmedTitle = String(title).trim();

  if (!trimmedTitle) {
    return 'Enter a todo before adding it.';
  }

  if (trimmedTitle.length > TODO_TITLE_MAX_LENGTH) {
    return `Keep todos under ${TODO_TITLE_MAX_LENGTH} characters.`;
  }

  return '';
}

export function isValidTodoTitle(title) {
  return getTodoTitleError(title) === '';
}

export function prepareTodoTitle(title) {
  const validationError = getTodoTitleError(title);

  if (validationError) {
    return { title: '', error: validationError };
  }

  const sanitizedTitle = sanitizePlainText(title);
  const sanitizedError = getTodoTitleError(sanitizedTitle);

  return {
    title: sanitizedTitle,
    error: sanitizedError,
  };
}

export function prepareSearchTerm(term) {
  return sanitizePlainText(term).slice(0, SEARCH_TERM_MAX_LENGTH);
}
