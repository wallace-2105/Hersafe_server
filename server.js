const express = require('express');
const { MongoClient } = require('mongodb');
const dns = require('node:dns');
require('dotenv').config();

// Força o Node.js a usar os servidores DNS do Google para evitar erros de conexão SRV com o MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Conexão com o MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor rodando 🚀');
});

// Subir servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});