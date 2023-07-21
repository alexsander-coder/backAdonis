import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Cadastro from './CadastroAluno'
import CadastroSala from './CadastroSala'

export default class AlocacaoAlunoSala extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public matricula: string

  @column()
  public numerosala: number

  @belongsTo(() => Cadastro, {
    foreignKey: 'matricula',
    localKey: 'matricula'
  })
  public cadastro: BelongsTo<typeof Cadastro>

  @belongsTo(() => CadastroSala, {
    foreignKey: 'numerosala',
    localKey: 'numerosala'
  })
  public cadastroSala: BelongsTo<typeof CadastroSala>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
