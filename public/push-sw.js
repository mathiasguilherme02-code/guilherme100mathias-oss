/* Service Worker custom handler for Web Push Notifications (GM-Empréstimo) */

self.addEventListener('push', function (event) {
  let payload = {
    title: 'GM-Empréstimo',
    body: 'Você tem uma nova atualização no painel.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'gm-emprestimo-push',
    url: '/?view=admin',
    type: 'info',
    requireInteraction: true,
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        ...payload,
        ...parsed,
        data: {
          ...(parsed.data || {}),
          url: parsed.url || parsed.data?.url || '/?view=admin',
          type: parsed.type || parsed.data?.type || 'info',
          clientId: parsed.clientId || parsed.data?.clientId || '',
          tab: parsed.tab || parsed.data?.tab || '',
        },
      };
    } catch (err) {
      const rawText = event.data.text();
      if (rawText) {
        payload.body = rawText;
      }
    }
  }

  const actions = [];
  if (payload.type === 'new_client') {
    actions.push({ action: 'open_client', title: 'Ver Ficha' });
  } else if (payload.type === 'payment_reminder') {
    actions.push({ action: 'open_reminders', title: 'Ver Lembretes' });
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    tag: payload.tag || 'gm-emprestimo-push',
    renotify: true,
    requireInteraction: payload.requireInteraction !== false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: payload.data,
    actions: actions.length > 0 ? actions : undefined,
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title || 'GM-Empréstimo', options),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
        for (const client of clientsList) {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            payload,
          });
        }
      }),
    ]),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/?view=admin';

  if (event.action === 'open_reminders') {
    targetUrl = '/?view=admin&tab=lembretes';
  } else if (event.action === 'open_client' && notifData.clientId) {
    targetUrl = '/?view=admin&tab=clientes&clientId=' + encodeURIComponent(notifData.clientId);
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_CLICK',
            data: {
              ...notifData,
              action: event.action || '',
              url: targetUrl,
            },
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        client.postMessage({
          type: 'PUSH_SUBSCRIPTION_CHANGED',
        });
      }
    }),
  );
});
