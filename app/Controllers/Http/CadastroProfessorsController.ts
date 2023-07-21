import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CadastroProfessor from 'App/Models/CadastroProfessor'
import { gerarMatricula } from 'App/middleware/gerarMatricula';

export default class CadastroProfessorsController {
  public async store({ request, response }: HttpContextContract) {

    const { nome, email, nascimento } = request.body()

    const cadastroExistente = await CadastroProfessor.query()
      .where('nome', nome)
      .orWhere('email', email)
      .first();

    if (cadastroExistente) {
      if (cadastroExistente.nome === nome) {
        return response.status(400).json({
          error: 'Já existe um cadastro com o mesmo nome',
        });
      }

      if (cadastroExistente.email === email) {
        return response.status(400).json({
          error: 'Já existe um cadastro com o mesmo email',
        });
      }
    }

    //middleware para gerar matriculas
    const matricula = gerarMatricula()

    const cadastro = await CadastroProfessor.create({
      nome,
      email,
      matricula,
      nascimento,
    })

    response.status(201)

    return {
      message: 'Cadastro professor criado com sucesso',
      data: cadastro
    }
  }


  public async update({ params, request, response }: HttpContextContract) {

    const { nome, email, nascimento } = request.body();

    const cadastroExistente = await CadastroProfessor.query()
      .where('nome', nome)
      .whereNot('id', params.id)
      .first();

    if (cadastroExistente) {
      return response.status(400).json({
        error: 'Já existe um cadastro com o mesmo nome',
      });
    }

    const cadastro = await CadastroProfessor.findOrFail(params.id);

    cadastro.nome = nome;
    cadastro.email = email;
    cadastro.nascimento = nascimento;

    await cadastro.save();

    return {
      message: 'Cadastro professor atualizado com sucesso',
      data: cadastro,
    };
  }

  public async destroy({ params, response }: HttpContextContract) {
    const cadastro = await CadastroProfessor.find(params.id);

    if (!cadastro) {
      return response.status(404).json({
        error: 'Cadastro professor não encontrado',
      });
    }

    await cadastro.delete();

    return {
      message: 'Cadastro professor excluído com sucesso',
    };
  }

  public async show({ params, response }: HttpContextContract) {
    const cadastro = await CadastroProfessor.find(params.id);

    if (!cadastro) {
      return response.status(404).json({
        error: 'Cadastro professor não encontrado',
      });
    }

    return {
      data: cadastro,
    };
  }

  public async index() {
    const cadastros = await CadastroProfessor.all()

    return {
      cadastros
    }
  }

}
