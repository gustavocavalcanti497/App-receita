require('dotenv').config();
const express = require('express');

const cors = require('cors');
const receitasRoutes = require('./routes/receitasRoutes');
const { connectDB } = require('./config/db');



const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rota principal para receitas
app.use('/api/receitas', receitasRoutes);

// Porta do servidor
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));


connectDB();
