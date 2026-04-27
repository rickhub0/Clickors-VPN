# 🚀 Clickors VPN

> Self-hosted VPN (HTTP Proxy) + Chrome Extension (Manifest V3)

---

## 🧠 Overview

Clickors VPN is a lightweight, self-hosted proxy system integrated with a Chrome extension.
It enables controlled, manual VPN connections using your own servers without relying on third-party VPN providers.

This project was built through **practical experimentation, debugging, and iteration**, not tutorials — making it a real-world implementation of networking + browser extension concepts.

---

## 🎯 Features

* 🔌 Manual Connect / Disconnect
* 🌐 Multi-server support
* 🔄 Server switching (A / B)
* 🔐 Proxy authentication handling
* 🧩 Chrome Extension (Manifest V3)
* ⚡ Lightweight & fast
* 🔒 Optional strict mode (block access without VPN)

---

## 🏗️ Architecture

```text
Chrome Extension → HTTP Proxy → VPS → Internet
```

---

## 📦 Project Structure

```text
clickors-vpn/
│
├── extension/        # Chrome extension source
├── server/           # Server setup docs & commands
├── assets/           # Screenshots / diagrams
├── README.md
├── LICENSE
└── .gitignore
```

---

## ⚙️ Requirements

### Server

* Linux VPS (any provider)
* Docker installed

### Client

* Google Chrome (or Chromium-based browser)
* Developer Mode enabled

---

## 🚀 Setup Guide

---

### 🖥️ 1. Server Setup

Run the proxy using Docker:

```bash
docker run -d \
--name proxy-server \
--restart always \
-p <PORT>:8080 \
ginuerzh/gost \
-L=http://<USERNAME>:<PASSWORD>@:8080
```

---

### 🧪 Test Proxy

```bash
curl -x http://<USERNAME>:<PASSWORD>@<SERVER_IP>:<PORT> ifconfig.me
```

✔ If an IP is returned → server is working

---

### 🧩 2. Install Chrome Extension

1. Open Chrome
2. Go to:

```text
chrome://extensions
```

3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `/extension` folder

---

## 🔧 Configuration

Update your server details inside:

```text
extension/background.js
```

Example:

```js
const DEFAULT_SERVERS = {
  serverA: {
    host: "YOUR_SERVER_IP",
    port: 39667,
    username: "YOUR_USER",
    password: "YOUR_PASS"
  }
};
```

---

## 🔄 Usage

1. Open the extension
2. Select a server
3. Click **Connect**
4. Verify IP change

---

## 🔒 Strict Mode (Optional)

You can block specific websites if VPN is not connected.

This is implemented using:

```js
chrome.tabs.onUpdated
```

✔ Compatible with Manifest V3
✔ No deprecated APIs

---

## 🧠 Key Learnings

* Chrome Extension **Manifest V3 limitations**
* Proxy authentication handling in browser
* Docker-based proxy deployment
* Debugging network & system conflicts
* Handling real-world environment issues

---

## 🧪 Troubleshooting

### ❌ VPN connects but no internet

Possible causes:

* Old VPN conflicts (reset network stack)
* Windows proxy auto-detection enabled
* Firewall blocking proxy traffic

---

### ❌ Proxy not working

* Check Docker container:

```bash
docker ps
```

* Test with curl:

```bash
curl -x http://USER:PASS@IP:PORT ifconfig.me
```

---

### ❌ Extension not applying proxy

* Check permissions in `manifest.json`
* Disable other proxy extensions
* Reload extension

---

## 💰 Cost

* VPS cost depends on provider
* Typical setup works on low-cost instances

---

## ⚠️ Disclaimer

This project is for **educational and experimental purposes only**.

Do not include:

* Real credentials
* Sensitive infrastructure data
* Private workflows

---

## 🚀 Future Improvements

* 🔐 User authentication system
* 🌐 Dynamic server management
* 📊 Dashboard (stats & logs)
* 🤖 Auto failover
* 🧠 Smart routing

---

## 👤 Author

**Clickors VPN Project**

Built for learning, control, and real-world application.
