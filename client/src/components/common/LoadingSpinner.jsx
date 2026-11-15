import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-[var(--blue-100)] border-t-[var(--blue-500)]',
          sizeClasses[size] || sizeClasses.md
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
