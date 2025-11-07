'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is disabled. Agents functionality has been moved to /dashboard
// Automatically redirects to /dashboard

export default function AgentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
