const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor rodando 🚀');
});

// Subir servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});