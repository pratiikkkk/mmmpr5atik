// server/longPollingManager.js
const clients = new Map();

function subscribe(req, res) {
  const clientId = Math.random().toString(36).substring(2);
  clients.set(clientId, res);
  req.on('close', () => {
    clients.delete(clientId);
  });
}

function publish(message) {
  for (const [clientId, res] of clients.entries()) {
    res.json(message);
    clients.delete(clientId);
  }
}

module.exports = {
  subscribe,
  publish,
};
