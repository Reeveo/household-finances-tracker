import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";


export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./client/src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      input: {
        // Define the entry point relative to the project root
        main: fileURLToPath(new URL('./client/index.html', import.meta.url))
      }
    },
    // Keep outDir definition consistent with the build script
    outDir: 'client/dist',
    emptyOutDir: true // Good practice to clean output dir
  },
  server: {
    port: 3000,
  },
});
