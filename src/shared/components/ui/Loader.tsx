import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Spinner } from './Spinner';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Spinner size={size} />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
    </div>
  );
}
