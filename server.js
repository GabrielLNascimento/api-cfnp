const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const verificarToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Importar o arquivo de rotas
const usuarioRoutes = require('./routes/usuarios'); // Ajuste o caminho conforme necessário

// Usar as rotas
app.use('/usuarios', usuarioRoutes); // Todas as rotas de usuários estarão sob o prefixo /usuarios

// Rota inicial
app.get('/', (req, res) => {
    res.send('API de Usuários e Observações');
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
