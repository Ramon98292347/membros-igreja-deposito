import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const ResponsiveContainer = ({ 
  children, 
  className, 
  size = 'md',
  padding = 'md',
  ...props
}: ResponsiveContainerProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-2xl';
      case 'md': return 'max-w-4xl';
      case 'lg': return 'max-w-6xl';
      case 'xl': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-6xl';
    }
  };
  
  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'px-2 sm:px-4 lg:px-6';
      case 'md': return 'px-4 sm:px-6 lg:px-8';
      case 'lg': return 'px-6 sm:px-8 lg:px-12';
      default: return 'px-4 sm:px-6 lg:px-8';
    }
  };
  
  return (
    <div 
      className={cn(
        'mx-auto w-full',
        getSizeClass(),
        getPaddingClass(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { ResponsiveContainer };