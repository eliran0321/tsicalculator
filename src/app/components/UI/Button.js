export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'normal', 
  disabled = false, 
  loading = false, 
  className = '',
  style = {}
}) {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: '',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning'
  };
  
  const sizeClasses = {
    small: 'btn-small',
    normal: '',
    full: 'btn-full'
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      style={style}
    >
      {loading ? 'טוען...' : children}
    </button>
  );
}