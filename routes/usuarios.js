const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Observacao = require('../models/Observacao');

// Listar todos os usuários
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Criar um novo usuário
router.post('/', async (req, res) => {
    const usuario = new Usuario({
        nome: req.body.nome,
        cpf: req.body.cpf,
    });

    try {
        const novoUsuario = await usuario.save();
        res.status(201).json(novoUsuario);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Buscar usuário pelo CPF
router.get('/cpf/:cpf', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ cpf: req.params.cpf });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Adicionar observação a um usuário pelo CPF
router.post('/cpf/:cpf/observacoes', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ cpf: req.params.cpf });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const observacao = new Observacao({
            texto: req.body.texto,
            usuarioId: usuario._id,
        });

        const novaObservacao = await observacao.save();

        await Usuario.findByIdAndUpdate(usuario._id, {
            $push: { observacoes: novaObservacao._id },
        });

        res.status(201).json(novaObservacao);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Listar observações de um usuário pelo CPF
router.get('/cpf/:cpf/observacoes', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ cpf: req.params.cpf });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const observacoes = await Observacao.find({ usuarioId: usuario._id });
        res.json(observacoes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Deletar um usuário e suas observações
router.delete('/cpf/:cpf', async (req, res) => {
    try {
        const cpf = req.params.cpf;

        const usuario = await Usuario.findOneAndDelete({ cpf });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        await Observacao.deleteMany({ usuarioId: usuario._id });

        res.json({ message: 'Usuário e observações deletados com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para editar um usuário pelo CPF
router.put('/cpf/:cpf', async (req, res) => {
    try {
        const cpfAntigo = req.params.cpf;
        const { nome, cpf: novoCpf } = req.body;

        // Verifica se o novo CPF já existe
        const usuarioExistente = await Usuario.findOne({ cpf: novoCpf });
        if (usuarioExistente && usuarioExistente.cpf !== cpfAntigo) {
            return res.status(400).json({ message: 'CPF já está em uso' });
        }

        // Atualiza o usuário
        const usuario = await Usuario.findOneAndUpdate(
            { cpf: cpfAntigo },
            { nome, cpf: novoCpf },
            { new: true } // Retorna o usuário atualizado
        );

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
