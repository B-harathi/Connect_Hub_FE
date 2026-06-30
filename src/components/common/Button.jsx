import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './Loading';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white border border-transparent focus:ring-purple-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600',
    outline: 'bg-transparent hover:bg-purple-50 text-purple-600 border border-purple-600 focus:ring-purple-500 dark:hover:bg-purple-900/20 dark:text-purple-400 dark:border-purple-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent focus:ring-gray-500 dark:hover:bg-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border border-transparent focus:ring-yellow-500',
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleClick = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} color="white" />;
    }
    
    if (icon) {
      return React.cloneElement(icon, {
        className: `${iconSizeClasses[size]} ${iconPosition === 'right' ? 'ml-2' : 'mr-2'}`
      });
    }
    
    return null;
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </motion.button>
  );
};

// Specific button variants as separate components
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;

// Icon button component
export const IconButton = ({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const iconSizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  return (
    <Button
      variant={variant}
      className={`${iconSizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

// Button group component
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none'
          } ${!isFirst ? '-ml-px' : ''}`,
        });
      })}
    </div>
  );
};

// Floating action button
export const FloatingActionButton = ({
  children,
  className = '',
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        ${sizeClasses[size]}
        bg-purple-600 hover:bg-purple-700 
        text-white rounded-full shadow-lg 
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;