# Lôi Đài Thách Đấu — React

## Cài vào project React/Vite hiện tại

1. Copy `LoiDaiThachDau.jsx` vào thư mục `src/components/`
2. Copy `LoiDaiThachDau.css` cùng thư mục.
3. Trong `App.jsx`:

```jsx
import LoiDaiThachDau from "./components/LoiDaiThachDau";

function App() {
  return <LoiDaiThachDau />;
}

export default App;
```

Nếu project chưa có React:

```bash
npm create vite@latest loi-dai -- --template react
cd loi-dai
npm install
npm run dev
```

Ảnh demo đang dùng URL ảnh từ Unsplash. Khi đưa lên production, nên thay bằng ảnh lôi đài/linh vật riêng của dự án.
