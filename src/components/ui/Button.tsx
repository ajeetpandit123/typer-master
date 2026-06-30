import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  children,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]';
      case 'ghost':
        return 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]';
      case 'outline':
        return 'bg-transparent text-[var(--color-brand)] border border-[var(--color-brand)] hover:bg-[var(--color-brand-light)]';
      case 'danger':
        return 'bg-[rgba(225,112,85,0.12)] text-[var(--color-error)] border border-transparent hover:bg-[rgba(225,112,85,0.2)]';
      case 'primary':
      default:
        return 'bg-[var(--color-brand)] text-white font-medium hover:opacity-90';
    }
  };

  const getSizeClasses = () => {
    if (size === 'sm') {
      return 'h-[32px] px-3 text-[12px]';
    }
    return 'h-[44px] md:h-[36px] px-4 text-[14px]';
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] cursor-pointer select-none transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {leftIcon && <span className="inline-flex items-center shrink-0">{leftIcon}</span>}
      <span>{children}</span>
    </button>
  );
};
