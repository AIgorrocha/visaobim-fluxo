// Script para corrigir dados mock
const fs = require('fs');

// Corrigir mockTasks.ts
let mockTasks = fs.readFileSync('src/data/mockTasks.ts', 'utf8');

// Corrigir start_date para activity_start
mockTasks = mockTasks.replace(/start_date:/g, 'activity_start:');

// Corrigir phases com espaço
mockTasks = mockTasks.replace(/phase: 'PROJETO BASICO'/g, "phase: 'PROJETO_BASICO'");
mockTasks = mockTasks.replace(/phase: 'ESTUDO PRELIMINAR'/g, "phase: 'ESTUDO_PRELIMINAR'");

fs.writeFileSync('src/data/mockTasks.ts', mockTasks);

// Corrigir Relatorios.tsx
let relatorios = fs.readFileSync('src/pages/Relatorios.tsx', 'utf8');
relatorios = relatorios.replace(/user\.username/g, 'user.full_name');
fs.writeFileSync('src/pages/Relatorios.tsx', relatorios);

console.log('Arquivos corrigidos!');