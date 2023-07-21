import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CadastroProfessor from 'App/Models/CadastroProfessor';

export default class AuthVerify {
  public async validarAcesso(email: string, response: HttpContextContract['response']) {
    const cadastroExistente = await CadastroProfessor.query()
      .where('email', email)
      .first();

    if (!cadastroExistente) {
      response.status(401).json({
        error: 'Acesso negado. Dados inválidos.',
      });
      return false;
    }
    return true;
  }
}
