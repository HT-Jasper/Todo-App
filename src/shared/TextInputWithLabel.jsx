import { forwardRef } from 'react';

const TextInputWithLabel = forwardRef(function TextInputWithLabel(
  {
    autoComplete,
    elementId,
    helpText,
    inputClassName = '',
    labelText,
    maxLength,
    onChange,
    placeholder,
    required = false,
    type = 'text',
    value,
  },
  ref
) {
  const helpId = helpText ? `${elementId}-help` : undefined;

  return (
    <div className="field">
      {labelText && <label htmlFor={elementId}>{labelText}</label>}
      <input
        aria-describedby={helpId}
        autoComplete={autoComplete}
        className={inputClassName}
        id={elementId}
        maxLength={maxLength}
        onChange={onChange}
        placeholder={placeholder}
        ref={ref}
        required={required}
        type={type}
        value={value}
      />
      {helpText && (
        <small className="field-help" id={helpId}>
          {helpText}
        </small>
      )}
    </div>
  );
});

export default TextInputWithLabel;

