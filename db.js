const mongoose = require('mongoose');
const dns = require('node:dns');
require('dotenv').config();

// Força DNS do Google para evitar erros SRV com MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'hersafe',
        });
        console.log('✅ MongoDB conectado via Mongoose');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
