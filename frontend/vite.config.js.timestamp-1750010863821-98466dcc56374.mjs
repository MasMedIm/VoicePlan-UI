// vite.config.js
import { defineConfig } from "file:///C:/Users/NalaBook/Desktop/voice-mcp/VoicePlan-UI/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/NalaBook/Desktop/voice-mcp/VoicePlan-UI/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy API requests during development to the backend container
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    // Docker’s shared volume FS events sometimes don’t propagate – polling
    // fixes HMR on macOS/Windows.  Slight CPU cost but negligible for small
    // projects.
    watch: {
      usePolling: true,
      interval: 300
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxOYWxhQm9va1xcXFxEZXNrdG9wXFxcXHZvaWNlLW1jcFxcXFxWb2ljZVBsYW4tVUlcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE5hbGFCb29rXFxcXERlc2t0b3BcXFxcdm9pY2UtbWNwXFxcXFZvaWNlUGxhbi1VSVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTmFsYUJvb2svRGVza3RvcC92b2ljZS1tY3AvVm9pY2VQbGFuLVVJL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFt2dWUoKV0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyBkdXJpbmcgZGV2ZWxvcG1lbnQgdG8gdGhlIGJhY2tlbmQgY29udGFpbmVyXHJcbiAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9iYWNrZW5kOjgwMDBcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gRG9ja2VyXHUyMDE5cyBzaGFyZWQgdm9sdW1lIEZTIGV2ZW50cyBzb21ldGltZXMgZG9uXHUyMDE5dCBwcm9wYWdhdGUgXHUyMDEzIHBvbGxpbmdcclxuICAgIC8vIGZpeGVzIEhNUiBvbiBtYWNPUy9XaW5kb3dzLiAgU2xpZ2h0IENQVSBjb3N0IGJ1dCBuZWdsaWdpYmxlIGZvciBzbWFsbFxyXG4gICAgLy8gcHJvamVjdHMuXHJcbiAgICB3YXRjaDoge1xyXG4gICAgICB1c2VQb2xsaW5nOiB0cnVlLFxyXG4gICAgICBpbnRlcnZhbDogMzAwLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyVyxTQUFTLG9CQUFvQjtBQUN4WSxPQUFPLFNBQVM7QUFFaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUztBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSUEsT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
