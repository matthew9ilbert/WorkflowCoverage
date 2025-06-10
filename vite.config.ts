import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html")
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src")
    }
  }
});
