window.addEventListener("message", async (event) => {
  const clients = await self.clients.matchAll();
  clients.forEach(function (client) {
    client.postMessage(event.data);
  });
});

// 注意丢到nginx里面， file协议无法注册serviceworker
