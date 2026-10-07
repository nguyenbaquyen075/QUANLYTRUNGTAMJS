/**
 * Tách video thành chuỗi ảnh WebP để trang web vẽ theo vị trí cuộn chuột (cuộn mượt, không giật như tua trực tiếp thẻ <video>
 * — video nén chỉ có vài khung hình chính nên tua qua lại rất nặng).
 * Dùng Google Chrome có sẵn trên máy (không cần ffmpeg).
 *   node src/utils/extractVideoFrames.js <video.mp4> <thư-mục-ra> [số-khung=64] [rộng=1024]
 * Ví dụ: node src/utils/extractVideoFrames.js ../video/arena.mp4 ../frontend/public/video/arena 64 1024
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const sharp = require('sharp');

const [, , videoArg, outArg, nArg = '64', wArg = '1024'] = process.argv;
if (!videoArg || !outArg) { console.error('Cách dùng: node extractVideoFrames.js <video.mp4> <thư-mục-ra> [số-khung] [rộng]'); process.exit(1); }
const videoPath = path.resolve(videoArg), outDir = path.resolve(outArg), N = +nArg, W = +wArg;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Máy chủ tạm có hỗ trợ Range (Chrome cần để tua video) và cùng origin với trang → canvas không bị "tainted".
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/video')) {
    const size = fs.statSync(videoPath).size;
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    const start = m ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
    res.writeHead(m ? 206 : 200, { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, ...(m && { 'Content-Range': `bytes ${start}-${end}/${size}` }) });
    return fs.createReadStream(videoPath, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<video id="v" muted playsinline preload="auto" src="/video.mp4"></video>');
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9335', `--user-data-dir=/tmp/frames-${Date.now()}`, 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 40; i++) { try { await fetch('http://127.0.0.1:9335/json/version'); break; } catch { await sleep(300); } }
    const page = (await (await fetch('http://127.0.0.1:9335/json')).json()).find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r) => ws.on('open', r));
    let id = 0; const pend = {};
    ws.on('message', (m) => { const d = JSON.parse(m); if (d.id && pend[d.id]) pend[d.id](d); });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };

    await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
    await sleep(1500);
    const meta = await ev(`new Promise(r=>{const v=document.getElementById('v');const ok=()=>r({d:v.duration,w:v.videoWidth,h:v.videoHeight});v.readyState>=1?ok():v.onloadedmetadata=ok})`);
    const H = Math.round((W * meta.h) / meta.w);
    console.log(`Video ${meta.w}x${meta.h}, ${meta.d.toFixed(2)}s → ${N} khung ${W}x${H}`);
    fs.mkdirSync(outDir, { recursive: true });
    for (let i = 0; i < N; i++) {
      const t = Math.min(meta.d - 0.04, (i / (N - 1)) * meta.d);
      const dataUrl = await ev(`new Promise(r=>{const v=document.getElementById('v');const c=document.createElement('canvas');c.width=${W};c.height=${H};
        const done=()=>setTimeout(()=>{c.getContext('2d').drawImage(v,0,0,${W},${H});r(c.toDataURL('image/png'))},120);
        v.onseeked=done;v.currentTime=${t.toFixed(4)}})`);
      const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
      await sharp(buf).webp({ quality: 72, effort: 5 }).toFile(path.join(outDir, `f${String(i).padStart(3, '0')}.webp`));
    }
    ws.close();
    const total = fs.readdirSync(outDir).reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0);
    console.log(`Xong: ${N} ảnh, tổng ${(total / 1e6).toFixed(1)} MB → ${outDir}`);
  } finally {
    chrome.kill();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
