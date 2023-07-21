import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cadastro from 'App/Models/CadastroAluno'
import { gerarMatricula } from 'App/middleware/gerarMatricula';

export default class CadastroAlunosController {
    public async store({ request, response }: HttpContextContract) {
        const { nome, email, nascimento } = request.body()

        const cadastroExistente = await Cadastro.findBy('nome', nome);
        if (cadastroExistente) {
            return response.status(400).json({
                error: 'Já existe um cadastro com o mesmo nome',
            });
        }

        //middleware para gerar matricula
        const matricula = gerarMatricula()

        const cadastro = await Cadastro.create({
            nome,
            email,
            matricula,
            nascimento,
        })

        response.status(201)

        return {
            message: 'Cadastro criado com sucesso',
            data: cadastro,
        }
    }


    public async update({ params, request, response }: HttpContextContract) {
        const { nome, email, nascimento } = request.body();

        const cadastroExistente = await Cadastro.query()
            .where('nome', nome)
            //excluir registros onde a coluna id seja igual ao valor de params.id
            .whereNot('id', params.id)
            .first();

        if (cadastroExistente) {
            return response.status(400).json({
                error: 'Já existe um cadastro com o mesmo nome',
            });
        }

        const cadastro = await Cadastro.findOrFail(params.id);

        cadastro.nome = nome;
        cadastro.email = email;
        cadastro.nascimento = nascimento;

        await cadastro.save();

        return {
            message: 'Cadastro atualizado com sucesso',
            data: cadastro,
        };
    }

    public async destroy({ params, response }: HttpContextContract) {
        const cadastro = await Cadastro.find(params.id);

        if (!cadastro) {
            return response.status(404).json({
                error: 'Cadastro aluno não encontrado',
            });
        }

        await cadastro.delete();

        return {
            message: 'Cadastro aluno excluído com sucesso',
        };
    }

    public async show({ params, response }: HttpContextContract) {
        const cadastro = await Cadastro.find(params.id);

        if (!cadastro) {
            return response.status(404).json({
                error: 'Cadastro aluno não encontrado',
            });
        }

        return {
            data: cadastro,
        };
    }

    public async index() {
        const cadastros = await Cadastro.all()

        return {
            cadastros,
        }
    }
}
