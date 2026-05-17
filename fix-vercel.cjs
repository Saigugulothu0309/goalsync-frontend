const fs = require('fs');
const path = require('path');

const files = {
  "vite.config.js": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 5173,\n    proxy: {\n      '/api': {\n        target: 'http://localhost:3000',\n        changeOrigin: true,\n      },\n    },\n  },\n  build: {\n    outDir: 'dist',\n  },\n})\n",
  "src/api/client.js": "import axios from 'axios'\n\nconst baseURL = import.meta.env.VITE_API_URL\n  ? import.meta.env.VITE_API_URL + '/api'\n  : '/api'\n\nconst api = axios.create({ baseURL })\n\napi.interceptors.request.use((config) => {\n  const token = localStorage.getItem('token')\n  if (token) config.headers.Authorization = `Bearer ${token}`\n  return config\n})\n\napi.interceptors.response.use(\n  (res) => res,\n  (err) => {\n    if (err.response?.status === 401) {\n      localStorage.removeItem('token')\n      localStorage.removeItem('user')\n      window.location.href = '/login'\n    }\n    return Promise.reject(err)\n  }\n)\n\nexport default api\n",
  "vercel.json": "{\n  \"rewrites\": [{ \"source\": \"/(.*)\", \"destination\": \"/index.html\" }]\n}\n"
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('  updated:', relPath);
}
console.log('\n✅ Frontend ready for Vercel deployment!');
console.log('\nNext: push to GitHub then set VITE_API_URL in Vercel dashboard');
