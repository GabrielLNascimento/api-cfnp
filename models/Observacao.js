const mongoose = require('mongoose');

const ObservacaoSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    usuarioId: { type: String, ref: 'Usuario', required: true },
});

module.exports = mongoose.model('Observacao', ObservacaoSchema);
