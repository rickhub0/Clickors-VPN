const ui = {
  statusLabel: document.getElementById('statusLabel'),
  statusDot: document.getElementById('statusDot'),
  connectButton: document.getElementById('connectButton'),
  currentServer: document.getElementById('currentServer'),
  connectionState: document.getElementById('connectionState'),
  connectedFor: document.getElementById('connectedFor'),
  publicIp: document.getElementById('publicIp'),
  serverRadios: Array.from(document.querySelectorAll('input[name="server"]'))
};

let timer = null;

function api(type, extra = {}) {
  return new Promise(resolve =>
    chrome.runtime.sendMessage({ type, ...extra }, resolve)
  );
}

function startTimer(time) {
  clearInterval(timer);
  timer = setInterval(() => {
    const sec = Math.floor((Date.now() - time) / 1000);
    ui.connectedFor.textContent = new Date(sec * 1000).toISOString().substr(11, 8);
  }, 1000);
}

function render(state) {
  const server = state.servers[state.selectedServerId];

  ui.currentServer.textContent = server.name;

  ui.serverRadios.forEach(r => {
    r.checked = r.value === state.selectedServerId;
  });

  if (state.status === 'connected') {
    ui.statusDot.className = 'status-dot connected';
    ui.statusLabel.textContent = 'Connected';
    ui.connectionState.textContent = '🟢 Connected';
    ui.connectButton.textContent = 'Disconnect';
    ui.connectButton.className = 'connect-btn disconnect';
    ui.publicIp.textContent = state.publicIp || server.host;

    startTimer(state.connectedAt);

  } else if (state.status === 'connecting') {
    ui.statusDot.className = 'status-dot connecting';
    ui.statusLabel.textContent = 'Connecting';
    ui.connectionState.textContent = '🟡 Connecting…';
    ui.connectButton.textContent = 'Please wait…';
    ui.connectButton.className = 'connect-btn connecting';
    ui.publicIp.textContent = 'Verifying…';

  } else {
    clearInterval(timer);

    ui.statusDot.className = 'status-dot';
    ui.statusLabel.textContent = 'Disconnected';
    ui.connectionState.textContent = '🔴 Disconnected';
    ui.connectButton.textContent = 'Connect';
    ui.connectButton.className = 'connect-btn';
    ui.publicIp.textContent = '--';
  }
}

async function connectFlow() {
  await api('CONNECT');
  update();
}

async function disconnectFlow() {
  await api('DISCONNECT');
  update();
}

async function update() {
  const res = await api('GET_STATE');
  if (res?.data) render(res.data);
}

ui.connectButton.addEventListener('click', async () => {
  const res = await api('GET_STATE');
  if (res.data.status === 'connected') {
    disconnectFlow();
  } else {
    connectFlow();
  }
});

ui.serverRadios.forEach(r => {
  r.addEventListener('change', async (e) => {
    await api('SET_SERVER', { serverId: e.target.value });
    update();
  });
});

// AUTO REFRESH UI
setInterval(update, 2000);

// INIT
update();