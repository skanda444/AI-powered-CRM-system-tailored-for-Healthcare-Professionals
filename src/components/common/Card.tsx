import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={twMerge('bg-white rounded-lg shadow-card p-6', className)}>
      {children}
    </div>
  );
};

export default Card;

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={twMerge('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <h3 className={twMerge('text-lg font-semibold text-neutral-900', className)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className }) => {
  return (
    <p className={twMerge('text-sm text-neutral-500 mt-1', className)}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={twMerge('mt-4 pt-4 border-t border-neutral-200', className)}>
      {children}
    </div>
  );
};