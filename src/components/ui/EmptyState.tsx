import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/20 ${className}`}>
      {icon && (
        <div className="text-[var(--color-text-secondary)] mb-4 flex items-center justify-center shrink-0 w-10 h-10">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon as React.ReactElement<any>, { size: 40, className: 'w-10 h-10' })
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-[18px] font-medium text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
