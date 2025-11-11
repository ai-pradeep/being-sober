import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/being-sober/", // IMPORTANT: Replace with your actual repo name
  plugins: [tailwindcss()],
});
