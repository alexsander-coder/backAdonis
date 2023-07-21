import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CadastroSala from 'App/Models/CadastroSala'
import CadastroProfessor from 'App/Models/CadastroProfessor'

//dados fake auth
const dadosDoProfessor = [
  { email: 'professor@gmail.com' },
]
//fim dados fake auth

export default class CadastroSalasController {
  private async validarAcesso(email: string, response: HttpContextContract['response']) {
    const cadastroExistente = await CadastroProfessor.query()
      // .where('matricula', matricula)
      .andWhere('email', email)
      .first();

    if (!cadastroExistente) {
      response.status(401).json({
        error: 'Acesso negado. Dados inválidos.',
      });
      return false;
    }

    return true;
  }

  public async store({ request, response }: HttpContextContract) {
    const { numerosala, capacidade, disponibilidade } = request.body();



    //simulando validacao professor
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, response);
      if (!acessoValido) {
        return;
      }
    }
    //fim simulacao


    const salaExistente = await CadastroSala.findBy('numerosala', numerosala);

    if (salaExistente) {
      return response.status(400).json({
        error: 'Já existe uma sala com esse número de sala.',
      });
    }

    // Criar a nova sala
    const cadastro = await CadastroSala.create({
      numerosala,
      capacidade,
      disponibilidade,
    });

    response.status(201);

    return {
      message: 'Sala criada com sucesso',
      data: cadastro,
    };
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { numerosala, capacidade, disponibilidade } = request.body();

    //simulando validacao professor
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, response);
      if (!acessoValido) {
        return;
      }
    }
    //fim simulacao

    const cadastroExistente = await CadastroSala.query()
      .where('numerosala', numerosala)
      .whereNot('id', params.id)
      .first();

    if (cadastroExistente) {
      return response.status(400).json({
        error: 'Já existe uma sala com essas informações',
      });
    }

    const cadastro = await CadastroSala.findOrFail(params.id);

    cadastro.numerosala = numerosala;
    cadastro.capacidade = capacidade;
    cadastro.disponibilidade = disponibilidade;

    await cadastro.save();

    return {
      message: 'Sala atualizado com sucesso',
      data: cadastro,
    };
  }

  public async show({ params, response }: HttpContextContract) {

    //simulando validacao professor
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, response);
      if (!acessoValido) {
        return;
      }
    }
    //fim simulacao
    const cadastro = await CadastroSala.find(params.id);

    if (!cadastro) {
      return response.status(404).json({
        error: 'Sala não encontrada',
      });
    }

    return {
      data: cadastro,
    };
  }

  public async destroy({ params, response }: HttpContextContract) {

    //simulando validacao professor
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, response);
      if (!acessoValido) {
        return;
      }
    }
    //fim simulacao
    const cadastro = await CadastroSala.find(params.id);

    if (!cadastro) {
      return response.status(404).json({
        error: 'Sala não encontrada',
      });
    }

    await cadastro.delete();

    return {
      message: 'Sala excluída com sucesso',
    };
  }

  public async index() {
    const cadastros = await CadastroSala.all()

    return {
      cadastros
    }
  }
}
