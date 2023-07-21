/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
//como posso melhorar minhas rotas de alocacao? veja o código a seguir:
import Route from '@ioc:Adonis/Core/Route'



Route.group(() => {

  //cadastras aluno
  Route.resource('/aluno', "CadastroAlunosController").apiOnly()

  //cadastrar professor
  Route.resource('/professor', 'CadastroProfessorsController').apiOnly()

  //cadastrar sala
  Route.resource('/sala', 'CadastroSalasController').apiOnly()


  //alocacao de alunos para as salas
  Route.post('/alocacao', 'AlocacaoAlunoSalasController.create')

  //mostrar para o estudante cada sala que ele está inscrito passando sua matricula para retorno dos dados
  Route.get('/alocacao/aluno/:matricula', 'AlocacaoAlunoSalasController.getAllByStudent')

  //mostrar todos os alunos em cada sala, passando o numero da sala para retorno de dados
  Route.get('/alocacao/sala/:numerosala', 'AlocacaoAlunoSalasController.getAllByRoom')

  //remover aluno de uma sala passando matricula e numero da sala a ser removido
  Route.delete('/alocacao/aluno/:matricula/sala/:numerosala', 'AlocacaoAlunoSalasController.delete');

}).prefix('/api')