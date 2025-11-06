import ChannelAnalytics from '@/components/ChannelAnalytics';

export const metadata = {
  title: 'Channel Analytics & Video Ideas | YouTube Agent',
  description: 'Track your YouTube channel analytics and get AI-powered video ideas',
};

export default function ChannelAnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <ChannelAnalytics />
    </main>
  );
}
