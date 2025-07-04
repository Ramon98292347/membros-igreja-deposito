import React from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  success?: boolean;
  children?: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  successText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading = false,
  error = null,
  success = false,
  children,
  loadingText = "Carregando...",
  errorText,
  successText = "Concluído!",
  className,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center space-x-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {loadingText}
        </span>
      </div>
    );

    if (variant === 'minimal') {
      return <div className={cn("flex justify-center", className)}>{loadingContent}</div>;
    }

    if (variant === 'card') {
      return (
        <div className={cn("flex items-center justify-center p-8 border rounded-lg bg-card", className)}>
          {loadingContent}
        </div>
      );
    }

    return (
      <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
        {loadingContent}
      </div>
    );
  }

  if (error) {
    const errorContent = (
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className={cn(sizeClasses[size])} />
        <span className={cn(textSizeClasses[size])}>
          {errorText || error}
        </span>
      </div>
    );

    if (variant === 'minimal') {
      return <div className={cn("flex justify-center", className)}>{errorContent}</div>;
    }

    if (variant === 'card') {
      return (
        <div className={cn("flex items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5", className)}>
          {errorContent}
        </div>
      );
    }

    return (
      <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
        {errorContent}
      </div>
    );
  }

  if (success && successText) {
    const successContent = (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle2 className={cn(sizeClasses[size])} />
        <span className={cn(textSizeClasses[size])}>
          {successText}
        </span>
      </div>
    );

    if (variant === 'minimal') {
      return <div className={cn("flex justify-center", className)}>{successContent}</div>;
    }

    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        {successContent}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;