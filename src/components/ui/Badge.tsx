import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'brand' | 'muted';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  children,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-[rgba(0,184,148,0.12)] text-[var(--color-success)]';
      case 'warning':
        return 'bg-[rgba(253,203,110,0.12)] text-[var(--color-warning)]';
      case 'error':
        return 'bg-[rgba(225,112,85,0.12)] text-[var(--color-error)]';
      case 'info':
        return 'bg-[rgba(0,206,201,0.12)] text-[var(--color-accent)]';
      case 'muted':
        return 'bg-[rgba(136,136,136,0.12)] text-[var(--color-text-secondary)]';
      case 'brand':
      default:
        return 'bg-[var(--color-brand-light)] text-[var(--color-brand)]';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-full)] select-none ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
