'use client';

// This page is disabled. Agents functionality has been moved to /dashboard

export default function AgentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Disabled
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page is currently disabled. Please use <a href="/dashboard" className="text-blue-600 hover:underline">/dashboard</a> instead.
        </p>
      </div>
    </div>
  );
}
