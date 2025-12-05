// public/sw.js

// Listener para eventos de push do servidor
self.addEventListener('push', (event) => {
  // Se não houver dados, mostra mensagem padrão
  const payload = event.data?.json() ?? { 
    title: 'Notificação',
    body: 'Uma nova notificação foi recebida'
  };

  const options = {
    body: payload.body,
    icon: '/icon-192x192.png', // Ícone da notificação
    badge: '/badge-72x72.png', // Badge menor
    tag: payload.tag || 'default', // Agrupa notificações do mesmo tipo
    requireInteraction: false, // Não força o usuário a interagir
    data: payload.data || {}, // Dados customizados
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Listener para cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Define para onde ir quando clicar na notificação
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Procura por uma aba já aberta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver aba, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listener para ações customizadas (botões)
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event.notification.tag);
});
