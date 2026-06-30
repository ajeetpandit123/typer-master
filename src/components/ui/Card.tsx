import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'stat';
  titleText?: string; // Rename to avoid conflict with HTML title attribute
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  titleText,
  trend,
  trendDirection = 'neutral',
  children,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'raised':
        return 'bg-[var(--color-surface-raised)] border border-[var(--color-border)]';
      case 'stat':
      case 'default':
      default:
        return 'bg-[var(--color-surface)] border border-[var(--color-border)]';
    }
  };

  const trendColor = 
    trendDirection === 'up' 
      ? 'text-[var(--color-success)]' 
      : trendDirection === 'down' 
        ? 'text-[var(--color-error)]' 
        : 'text-[var(--color-text-muted)]';

  return (
    <div
      className={`rounded-[var(--radius-lg)] p-5 transition-all duration-200 ${getVariantClasses()} ${className}`}
      {...props}
    >
      {variant === 'stat' ? (
        <div className="flex flex-col justify-between h-full space-y-2">
          {titleText && (
            <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.06em] font-medium">
              {titleText}
            </span>
          )}
          <div className="text-[28px] font-medium text-[var(--color-text-primary)] leading-tight">
            {children}
          </div>
          {trend && (
            <span className={`text-[11px] font-medium ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
      ) : (
        <>
          {titleText && (
            <h3 className="text-[15px] font-medium text-[var(--color-text-primary)] mb-4">
              {titleText}
            </h3>
          )}
          {children}
        </>
      )}
    </div>
  );
};
