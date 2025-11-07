'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is disabled. RL System functionality has been moved to /dashboard
// Automatically redirects to /dashboard

export default function RLSystemPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
