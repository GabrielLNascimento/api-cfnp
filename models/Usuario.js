const mongoose = require('mongoose');
const shortid = require('shortid');

const UsuarioSchema = new mongoose.Schema({
    _id: { type: String, default: shortid.generate },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true }, // Campo CPF
    observacoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Observacao' }],
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
