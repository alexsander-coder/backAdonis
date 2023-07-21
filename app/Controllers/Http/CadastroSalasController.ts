import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CadastroSala from 'App/Models/CadastroSala'
import CadastroProfessor from 'App/Models/CadastroProfessor'


export default class CadastroSalasController {
  private async validarAcesso({ email }: any, response: any) {

    const cadastroExistente = await CadastroProfessor.query()
      .where('email', email)
      .first()

    if (!cadastroExistente) {
      response.status(401).json({
        error: 'Acesso negado. Dados inválidos.',
      })
      return false;
    }
    return true;
  }


  public async store({ request, response }: HttpContextContract) {
    const { numerosala, capacidade, disponibilidade } = request.body();

    const dadosDoProfessor = [
      { email: 'professors@gmail.com' },
    ];

    for (const dados of dadosDoProfessor) {
      await this.validarAcesso(dados, response);
    }

    // Verificar se o número da sala já está sendo usado
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

    const dadosDoProfessor = [
      { nome: 'Alex', email: 'professor@gmail.com', matricula: 'TXR428' },
    ]

    for (const dados of dadosDoProfessor) {
      await this.validarAcesso(dados, response)
    }

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

    const dadosDoProfessor = [
      { nome: 'Alex', email: 'professor@gmail.com', matricula: 'TXR428' },
    ]

    for (const dados of dadosDoProfessor) {
      await this.validarAcesso(dados, response)
    }

    const cadastro = await CadastroSala.find(params.id);

    if (!cadastro) {
      return response.status(404).json({
        error: 'Cadastro aluno não encontrado',
      });
    }

    return {
      data: cadastro,
    };
  }

  public async destroy({ params, response }: HttpContextContract) {

    const dadosDoProfessor = [
      { nome: 'Alex', email: 'professor@gmail.com', matricula: 'TXR428' },
    ]

    for (const dados of dadosDoProfessor) {
      await this.validarAcesso(dados, response)
    }

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
