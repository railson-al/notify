// lib/hooks/usePushNotifications.ts
'use client';

import { useEffect, useState } from 'react';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar: converter base64 para Uint8Array (necessário para VAPID)
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  // Inicializar Service Worker e verificar suporte
  const initializePushNotifications = async () => {
    try {
      setIsLoading(true);

      // Verificar suporte
      const hasSupport =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(hasSupport);

      if (!hasSupport) {
        setError('Push Notifications não são suportadas neste navegador');
        return;
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      // Verificar se já existe uma inscrição
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);

      setError(null);
    } catch (err) {
      console.error('Erro ao inicializar push notifications:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar permissão e inscrever no push
  const subscribeToPush = async () => {
    try {
      setIsLoading(true);

      // Solicitar permissão ao usuário
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setError('Permissão negada pelo usuário');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Criar inscrição
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      setSubscription(newSubscription);

      // Enviar inscrição para o servidor
      await saveSubscription(newSubscription);

      setError(null);
    } catch (err) {
      console.error('Erro ao se inscrever em push notifications:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Desinscrever de notificações
  const unsubscribeFromPush = async () => {
    try {
      setIsLoading(true);

      if (!subscription) {
        return;
      }

      // Remover inscrição do browser
      const unsubscribed = await subscription.unsubscribe();

      if (unsubscribed) {
        setSubscription(null);
        // Notificar servidor para remover inscrição
        await removeSubscription(subscription);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao desinscrever de push notifications:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar inscrição no servidor
  const saveSubscription = async (sub: PushSubscription) => {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: sub.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar inscrição no servidor');
    }

    return response.json();
  };

  // Remover inscrição do servidor
  const removeSubscription = async (sub: PushSubscription) => {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: sub.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao remover inscrição do servidor');
    }

    return response.json();
  };

  // Efeito: inicializar ao montar componente
  useEffect(() => {
    initializePushNotifications();
  }, []);

  return {
    isSupported,
    subscription,
    isLoading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribed: subscription !== null,
  };
}
