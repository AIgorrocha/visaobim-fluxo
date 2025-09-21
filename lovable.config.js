export default {
  project: "visaobim-fluxo",
  framework: "react",
  buildTool: "vite",
  language: "typescript",
  styling: "tailwindcss",
  ui: "shadcn",
  deploy: {
    autoSync: true,
    branch: "master",
    buildCommand: "npm run build",
    outputDir: "dist"
  },
  features: {
    crm: true,
    authentication: true,
    gamification: true,
    dashboard: true,
    projectManagement: true,
    taskManagement: true,
    permissions: true
  },
  status: "ready",
  lastUpdate: "2025-09-21",
  version: "1.0.0"
};