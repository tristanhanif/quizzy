'use client';

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'bordered';
}

export default function Card({ className = '', variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200',
    hover: 'bg-white border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer',
    bordered: 'bg-white border border-slate-200',
  };

  return (
    <div className={`rounded-xl p-6 ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
