// app/layout.tsx
import { PushNotificationManager } from '@/components/PushNotificationManager';

export const metadata = {
  title: 'Push Notifications App',
  description: 'App com push notifications em Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-white">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">🚀 Push Notifications</h1>
          </header>

          <main className="container mx-auto max-w-2xl py-8 px-4">
            <PushNotificationManager />

            <div className="mt-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
