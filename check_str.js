import fs from 'fs';

const serverFile = fs.readFileSync('server.js', 'utf8');
console.log(serverFile.includes('ORDEM DE SERVIÇO / TAREFA'));
