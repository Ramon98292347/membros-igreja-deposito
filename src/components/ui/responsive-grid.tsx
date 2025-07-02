import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const ResponsiveGrid = ({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md'
}: ResponsiveGridProps) => {
  const getGridCols = () => {
    const classes = [];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return classes.join(' ');
  };
  
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2 sm:gap-3';
      case 'md': return 'gap-3 sm:gap-4 lg:gap-6';
      case 'lg': return 'gap-4 sm:gap-6 lg:gap-8';
      case 'xl': return 'gap-6 sm:gap-8 lg:gap-10';
      default: return 'gap-3 sm:gap-4 lg:gap-6';
    }
  };
  
  return (
    <div className={cn(
      'grid',
      getGridCols(),
      getGapClass(),
      className
    )}>
      {children}
    </div>
  );
};

export { ResponsiveGrid };