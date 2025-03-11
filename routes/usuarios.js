const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth'); // Importe o middleware
require('dotenv').config();

const Usuario = require('../models/Usuario');
const Observacao = require('../models/Observacao');

// Rota de login (pública)
router.post('/login', async (req, res) => {
    const { senha } = req.body;

    if (senha === process.env.SENHA) {
        const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    } else {
        return res.status(401).json({ message: 'Senha incorreta' });
    }
});

// Rotas protegidas
router.get('/', verificarToken, async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', verificarToken, async (req, res) => {
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

router.get('/cpf/:cpf', verificarToken, async (req, res) => {
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

router.post('/cpf/:cpf/observacoes', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ cpf: req.params.cpf });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const observacao = new Observacao({
            texto: req.body.texto,
            data: req.body.data,
            complemento: req.body.complemento,
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

router.get('/cpf/:cpf/observacoes', verificarToken, async (req, res) => {
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

router.delete('/cpf/:cpf', verificarToken, async (req, res) => {
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

router.delete('/cpf/:cpf/observacoes/:id', verificarToken, async (req, res) => {
    try {
        const observacaoId = req.params.id;

        // Verifica se a observação existe
        const observacao = await Observacao.findById(observacaoId);
        if (!observacao) {
            return res
                .status(404)
                .json({ message: 'Observação não encontrada' });
        }

        // Remove a observação do banco de dados
        await Observacao.findByIdAndDelete(observacaoId);

        // Remove a referência da observação no usuário
        await Usuario.findByIdAndUpdate(observacao.usuarioId, {
            $pull: { observacoes: observacaoId },
        });

        res.json({ message: 'Observação deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/cpf/:cpf', verificarToken, async (req, res) => {
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

router.put('/usuarios/:cpf/relatorio', async (req, res) => {
    const { cpf } = req.params;
    const { relatorio } = req.body;

    try {
        // Atualiza o relatório do aluno
        const usuarioAtualizado = await Usuario.findOneAndUpdate(
            { cpf }, // Filtra pelo CPF
            { relatorio }, // Atualiza o campo relatorio
            { new: true } // Retorna o documento atualizado
        );

        if (!usuarioAtualizado) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        res.status(200).json(usuarioAtualizado);
    } catch (error) {
        console.error('Erro ao salvar o relatório:', error);
        res.status(500).json({ message: 'Erro ao salvar o relatório.' });
    }
});

module.exports = router;
