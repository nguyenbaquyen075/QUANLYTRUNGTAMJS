// Mở bản xem trước (kèm ảnh từ thư mục assets) trong Chrome chạy ngầm, đo các slide và ghi ra slides.json
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [,, htmlPath, assetDir, outJson, profile] = process.argv;
const assets = Object.fromEntries(readdirSync(assetDir).map((f) => [f.split('.')[0], f]));
const server = createServer((req, res) => {
  const m = req.url.match(/^\/_blob\/([0-9a-f]{32})/);
  if (m && assets[m[1]]) {
    res.writeHead(200, { 'Content-Type': assets[m[1]].endsWith('.png') ? 'image/png' : 'image/jpeg' });
    return res.end(readFileSync(join(assetDir, assets[m[1]])));
  }
  if (req.url === '/' ) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(readFileSync(htmlPath)); }
  res.writeHead(404); res.end();
}).listen(9391);

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9392', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 40; i++) { try { t = await (await fetch('http://127.0.0.1:9392/json')).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const p = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { p.get(m.id)(m.result); p.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }));

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:9391/' }); await sleep(3000);
// Bỏ co giãn để đo đúng khung 1280×720
await ev(`document.head.insertAdjacentHTML('beforeend','<style>.s{transform:none!important}</style>'); document.body.classList.remove('editing'); 1`);
await ev(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })))`);
await sleep(500);
const res = await ev(readFileSync(new URL('./extract.js', import.meta.url), 'utf8'));
if (res.exceptionDetails) { console.error(JSON.stringify(res.exceptionDetails).slice(0, 1500)); process.exit(1); }
writeFileSync(outJson, res.result.value);
const data = JSON.parse(res.result.value);
console.log('slides', data.length, data.map((s) => `${s.length}(${s.filter((i) => i.t === 'img').length} ảnh)`).join(' '));
ws.close(); chrome.kill(); server.close();
