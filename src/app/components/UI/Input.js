export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  autoCalc = false,
  step,
  min,
  max,
  ...props
}) {
  const inputClasses = [
    'form-input',
    autoCalc ? 'auto-calc' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: '#ff6b6b' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        step={step}
        min={min}
        max={max}
        {...props}
      />
    </div>
  );
}