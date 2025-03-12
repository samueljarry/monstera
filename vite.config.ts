import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@managers": path.resolve(__dirname, "./src/managers"),
      "@": path.resolve(__dirname, "./src/"),
      "@materials": path.resolve(__dirname, "./src/materials"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
