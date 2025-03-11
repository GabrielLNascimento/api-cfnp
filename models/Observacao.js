const mongoose = require('mongoose');

const ObservacaoSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    data: { type: Date, default: Date.now }, 
    complemento: { type: String }, 
    usuarioId: { type: String, ref: 'Usuario', required: true },
});

module.exports = mongoose.model('Observacao', ObservacaoSchema);
