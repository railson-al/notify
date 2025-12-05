// components/PushNotificationManager.tsx
'use client';

import { usePushNotifications } from '@/lib/hooks/usePushNotification';
import { useState } from 'react';

export function PushNotificationManager() {
  const {
    isSupported,
    subscription,
    isLoading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribed,
  } = usePushNotifications();

  const [testTitle, setTestTitle] = useState('Teste de Notificação');
  const [testBody, setTestBody] = useState('Esta é uma notificação de teste');
  const [sendingTest, setSendingTest] = useState(false);

  const handleSendTest = async () => {
    if (!subscription) {
      alert('Você não está inscrito em notificações');
      return;
    }

    try {
      setSendingTest(true);

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          notification: {
            title: testTitle,
            body: testBody,
            tag: 'test-notification',
            data: {
              url: '/',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar notificação de teste');
      }

      alert('Notificação de teste enviada!');
    } catch (err) {
      console.error('Erro ao enviar notificação de teste:', err);
      alert('Erro ao enviar notificação de teste');
    } finally {
      setSendingTest(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">
          ⚠️ Push Notifications não são suportadas neste navegador
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold mb-4">📬 Gerenciar Notificações</h2>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 rounded text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {!isSubscribed ? (
            <button
              onClick={subscribeToPush}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Processando...' : '✓ Ativar Notificações'}
            </button>
          ) : (
            <>
              <div className="p-3 bg-green-100 border border-green-400 rounded text-green-800">
                ✓ Você está recebendo notificações
              </div>

              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título da Notificação
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {sendingTest ? 'Enviando...' : '📤 Enviar Notificação de Teste'}
                </button>
              </div>

              <button
                onClick={unsubscribeFromPush}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Processando...' : '✗ Desativar Notificações'}
              </button>
            </>
          )}
        </div>
      </div>

      {isSubscribed && subscription && (
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-semibold">
            📊 Detalhes da Inscrição
          </summary>
          <pre className="mt-2 p-2 bg-white border rounded overflow-auto text-xs">
            {JSON.stringify(subscription.toJSON(), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
