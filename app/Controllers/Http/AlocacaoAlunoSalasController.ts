import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AlocacaoAlunoSala from 'App/Models/AlocacaoAlunoSala'
import CadastroSala from 'App/Models/CadastroSala'
import Cadastro from 'App/Models/CadastroAluno'
import CadastroProfessor from 'App/Models/CadastroProfessor'

//dados fake auth
const dadosDoProfessor = [
  { email: 'professor@gmail.com' },
]
//fim dados fake auth

export default class AlocacaoAlunoSalasController {

  private async validarAcesso(email: string, response: HttpContextContract['response']) {
    const cadastroExistente = await CadastroProfessor.query()
      // .where('matricula', matricula)
      .andWhere('email', email)
      .first();

    if (!cadastroExistente) {
      response.status(401).json({
        error: 'Acesso negado. Sem permissão.',
      });
      return false;
    }
    return true;
  }


  public async create({ request, response }: HttpContextContract) {
    const matricula = request.input('matricula');
    const numerosala = request.input('numerosala');

    // Verificar se o professor tem permissão para alocar o aluno
    for (const dados of dadosDoProfessor) {
      const acessoValido = await this.validarAcesso(dados.email, response);
      if (!acessoValido) {
        return;
      }
    }

    // Verificar se a sala já está com a capacidade máxima
    const sala = await CadastroSala.findBy('numerosala', numerosala);


    const matriculaExist = await Cadastro.findBy('matricula', matricula);


    if (!sala) {
      return response.status(400).send({
        error: 'Sala não encontrada.',
      });
    }

    if (!matriculaExist) {
      return response.status(400).send({
        error: 'Matricula não encontrada.',
      });
    }

    const capacidadeSala = sala.capacidade;
    const alocacoesSala = await sala.related('alocacoes').query();

    if (alocacoesSala.length === capacidadeSala) {
      return response.status(400).send({
        error: 'A capacidade da sala já foi atingida.',
      });
    }
    await CadastroSala.query().where('numerosala', numerosala).update({ disponibilidade: false });


    const existingAlocacao = await AlocacaoAlunoSala.query()
      .where('matricula', matricula)
      .where('numerosala', numerosala)
      .first();

    if (existingAlocacao) {
      return response.status(400).send({
        error: 'O aluno já está alocado nesta sala.',
      });
    }

    const alocacao = new AlocacaoAlunoSala();
    alocacao.matricula = matricula;
    alocacao.numerosala = numerosala;

    await alocacao.save();

    return alocacao;
  }



  public async delete({ request, response }: HttpContextContract) {
    const { matricula, numerosala } = request.body();

    const alocacao = await AlocacaoAlunoSala.query()
      .where('matricula', matricula)
      .andWhere('numerosala', numerosala)
      .first();

    if (!alocacao) {
      return response.status(404).send({
        error: 'Aluno(a) não encontrado(a).',
      });
    }

    try {
      await alocacao.delete();

      const sala = await CadastroSala.findBy('numerosala', numerosala);
      const capacidadeSala = sala?.capacidade || 0;
      const alocacoesSala = await sala?.related('alocacoes').query();

      if (alocacoesSala !== undefined && alocacoesSala.length < capacidadeSala) {
        await CadastroSala.query().where('numerosala', numerosala).update({ disponibilidade: true });
      }

      return response.status(200).send({
        message: 'Aluno(a) removido(a) com sucesso.',
      });
    } catch (error) {
      return response.status(500).send({
        error: 'Erro ao excluir aluno(a).',
      });
    }
  }




  public async getAllByStudent({ request, response }: HttpContextContract) {
    const { matricula } = request.only(['matricula']);

    if (!matricula) {
      return response.status(400).send({
        error: 'A matrícula do aluno não foi fornecida.',
      });
    }

    const aluno = await Cadastro.findBy('matricula', matricula);

    if (!aluno) {
      return response.status(404).send({
        error: 'Aluno não encontrado.',
      });
    }

    const dataOne = await AlocacaoAlunoSala.query()
      .where('matricula', matricula)
      .preload('cadastroSala');

    const alunoData = {
      nome: aluno.nome,
    };

    const salasData = dataOne.map((alocacao) => {
      return {
        numerosala: alocacao.numerosala,
        professor: dadosDoProfessor[0].email
      };
    });

    return [
      { aluno: alunoData, salas: salasData },
    ];
  }

  public async getAllByRoom({ params }: HttpContextContract) {
    const numerosala = params.numerosala;

    const alocacoesSala = await AlocacaoAlunoSala.query()
      .where('numerosala', numerosala)
      .preload('cadastro');

    const data = alocacoesSala.map((alocacao) => {
      return {
        nome: alocacao.cadastro.nome,
        matricula: alocacao.matricula,
      };
    });

    return data;
  }
}
