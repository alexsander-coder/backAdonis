import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import AlocacaoAlunoSala from './AlocacaoAlunoSala';

export default class CadastroSala extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public numerosala: string;

  @column()
  public capacidade: number;

  @column()
  public disponibilidade: boolean;

  @hasMany(() => AlocacaoAlunoSala, {
    foreignKey: 'numerosala',
    localKey: 'numerosala',
  })
  public alocacoes: HasMany<typeof AlocacaoAlunoSala>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
