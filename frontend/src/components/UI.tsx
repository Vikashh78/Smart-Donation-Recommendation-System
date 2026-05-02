import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}: any) => {
  const variants: any = {
    primary: 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white hover:opacity-90 shadow-md shadow-indigo-100',
    secondary: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  const sizes: any = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  const MotionButton = motion.button as any;

  return (
    <MotionButton
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </MotionButton>
  );
};

export const Input = ({ label, error, className, id, icon: Icon, ...props }: any) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full px-4 py-3 bg-white/10 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all sm:text-sm',
            Icon && 'pl-11',
            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  );
};

export const Card = ({ children, className }: any) => (
  <div className={cn('bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);
