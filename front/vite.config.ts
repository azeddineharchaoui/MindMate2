import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env variables based on mode
    const env = loadEnv(mode, process.cwd());
    const apiUrl = env.VITE_API_URL || "https://92ad-34-83-133-6.ngrok-free.app";
    
    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        server: {
            proxy: {
                // Proxy all API requests to bypass CORS
                "/api": {
                    target: apiUrl,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path,
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('Sending Request:', req.method, req.url);
                        });
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            console.log('Received Response from:', req.url, proxyRes.statusCode);
                        });
                    },
                },
            },
        },
    };
});