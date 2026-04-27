// CLEAN STABLE VERSION

const STORAGE_KEYS = {
  SERVERS: 'servers',
  SELECTED_SERVER_ID: 'selectedServerId',
  CONNECTED: 'connected',
  STATUS: 'status',
  CONNECTED_AT: 'connectedAt',
  LAST_ERROR: 'lastError',
  PUBLIC_IP: 'publicIp'
};

const STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected'
};

const DEFAULT_SERVERS = {
  londonA: {
    id: 'londonA',
    name: 'London A',
    host: 'PASTE_VPS_IP_HERE',
    port: 39667,
    username: 'USERNAME',
    password: 'PASSWORD'
  },
  londonB: {
    id: 'londonB',
    name: 'London B',
    host: 'PASTE_VPS_IP_HERE',
    port: 39667,
    username: 'USERNAME',
    password: 'PASSWORD'
  }
};

const store = {
  get: (k) => chrome.storage.local.get(k),
  set: (v) => chrome.storage.local.set(v)
};

async function ensureDefaults() {
  const data = await store.get(null);

  if (!data.servers) {
    await store.set({
      servers: DEFAULT_SERVERS,
      selectedServerId: 'londonA',
      connected: false,
      status: STATUS.DISCONNECTED
    });
  }
}

function setProxy(server) {
  return new Promise((resolve, reject) => {
    chrome.proxy.settings.set({
      value: {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: 'http',
            host: server.host,
            port: parseInt(server.port)
          }
        }
      },
      scope: 'regular'
    }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}

function clearProxy() {
  return chrome.proxy.settings.set({
    value: { mode: 'direct' },
    scope: 'regular'
  });
}

async function getPublicIP() {
  try {
    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

async function connect() {
  await store.set({ status: STATUS.CONNECTING });

  const data = await store.get(['servers', 'selectedServerId']);
  const server = data.servers[data.selectedServerId];

  try {
    await setProxy(server);

    const ip = await getPublicIP();

    await store.set({
      connected: true,
      status: STATUS.CONNECTED,
      connectedAt: Date.now(),
      publicIp: ip || server.host
    });

  } catch (err) {
    await clearProxy();
    await store.set({
      connected: false,
      status: STATUS.DISCONNECTED,
      lastError: err
    });
  }
}

async function disconnect() {
  await clearProxy();
  await store.set({
    connected: false,
    status: STATUS.DISCONNECTED,
    connectedAt: null,
    publicIp: null
  });
}

async function switchServer(serverId) {
  await store.set({ selectedServerId: serverId });

  const data = await store.get(['connected']);
  if (data.connected) {
    await connect();
  }
}

// AUTH
chrome.webRequest.onAuthRequired.addListener(
  () => ({
    authCredentials: {
      username: 'USERNAME',
      password: 'PASSWORD'
    }
  }),
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// MESSAGE HANDLER
chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  (async () => {
    await ensureDefaults();

    switch (msg.type) {
      case 'GET_STATE':
        sendResponse({ ok: true, data: await store.get(null) });
        break;

      case 'CONNECT':
        await connect();
        sendResponse({ ok: true });
        break;

      case 'DISCONNECT':
        await disconnect();
        sendResponse({ ok: true });
        break;

      case 'SET_SERVER':
        await switchServer(msg.serverId);
        sendResponse({ ok: true });
        break;
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(ensureDefaults);
