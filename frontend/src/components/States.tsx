import React from 'react';
import { motion } from 'motion/react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl"
    >
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        <PackageOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8">{description}</p>
      {action}
    </motion.div>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

export const DashboardCardSkeleton = () => (
  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-24 w-full" />
  </div>
);
