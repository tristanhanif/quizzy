'use client';

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'bordered';
}

export default function Card({ className = '', variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white shadow-sm',
    hover: 'bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer',
    bordered: 'bg-white border border-gray-200',
  };

  return (
    <div className={`rounded-2xl p-6 ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
