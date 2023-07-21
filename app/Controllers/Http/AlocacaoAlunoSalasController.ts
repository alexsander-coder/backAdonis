import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AlocacaoAlunoSala from 'App/Models/AlocacaoAlunoSala'
import CadastroSala from 'App/Models/CadastroSala'
import Cadastro from 'App/Models/CadastroAluno'
import CadastroProfessor from 'App/Models/CadastroProfessor'
// import { validarAcesso } from 'App/middleware/authTestProfessor'


export default class AlocacaoAlunoSalasController {

  private async validarAcesso(email: string, matricula: string, response: HttpContextContract['response']) {
    const cadastroExistente = await CadastroProfessor.query()
      .where('matricula', matricula)
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


  public async create({ request, response }: HttpContextContract) {

    const dadosDoProfessor = [
      { matricula: 'S1ZUH2B', email: 'professor@gmail.com' },
    ]

    const matricula = request.input('matricula');
    const numerosala = request.input('numerosala');


    //simulando validacao professor
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, dados.matricula, response);
      if (!acessoValido) {
        return; // Retorna para interromper a criação da sala
      }
    }

    //fim simulacao

    const existingAlocacao = await AlocacaoAlunoSala.query()
      .where('matricula', matricula)
      .andWhere('numerosala', numerosala)
      .first();

    if (existingAlocacao) {
      return response.status(400).send({
        error: 'A matricula já está alocada nesta sala.',
      });
    }

    const sala = await CadastroSala.findBy('numerosala', numerosala);

    if (!sala) {
      return response.status(400).send({
        error: 'Sala não encontrada.',
      });
    }

    const capacidadeSala = sala.capacidade;
    const alocacoesSala = await sala.related('alocacoes').query();

    if (alocacoesSala.length >= capacidadeSala) {
      return response.status(400).send({
        error: 'A capacidade da sala já foi atingida.',
      });
    }

    const alocacao = new AlocacaoAlunoSala();
    alocacao.matricula = matricula;
    alocacao.numerosala = numerosala;

    await alocacao.save();

    return alocacao;
  }


  public async delete({ params, response }: HttpContextContract) {
    const matricula = params.matricula;
    const numerosala = params.numerosala;

    // Busca a alocação do aluno e sala pelos parametros, revisar melhoria de consultas
    const alocacao = await AlocacaoAlunoSala.query()
      .where('matricula', matricula)
      .andWhere('numerosala', numerosala)
      .first();

    if (!alocacao) {
      return response.status(404).send({
        error: 'Alocação não encontrada.',
      });
    }

    try {
      await alocacao.delete();

      return response.status(200).send({
        message: 'Alocação removida com sucesso.',
      });
    } catch (error) {

      return response.status(500).send({
        error: 'Erro ao excluir a alocação.',
      });
    }
  }


  public async getAllByStudent({ params, response }: HttpContextContract) {
    const matricula = params.matricula;

    const aluno = await Cadastro.findBy('matricula', matricula);

    if (!aluno) {
      return response.status(404).send({
        error: 'Aluno não encontrado.',
      });
    }

    const dataOne = await AlocacaoAlunoSala.query().where('matricula', matricula).preload('cadastroSala');

    const alunoData = {
      nome: aluno.nome,
    };

    const salasData = dataOne.map((alocacao) => {
      return {
        numerosala: alocacao.numerosala
        // professor: dadosDoProfessor[0].email
      };
    });

    return [
      { aluno: alunoData, salas: salasData },
    ];
  }

  public async getAllByRoom({ params }: HttpContextContract) {
    const numerosala = params.numerosala
    return await AlocacaoAlunoSala.query().where('numerosala', numerosala)
  }
}
