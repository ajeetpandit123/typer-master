import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendDirection = 'neutral',
  className = '',
}) => {
  return (
    <Card
      variant="stat"
      titleText={label}
      trend={trend}
      trendDirection={trendDirection}
      className={className}
    >
      {value}
    </Card>
  );
};
