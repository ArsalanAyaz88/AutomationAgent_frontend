'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is disabled. All functionality has been moved to /dashboard
// Automatically redirects to /dashboard

export default function ChannelAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
