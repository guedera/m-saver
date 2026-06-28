import client from './client'
import type { Categoria } from './categorias'

export type TipoOperacao = 'gasto' | 'recebimento'

export interface Operacao {
  id: number
  tipo: TipoOperacao
  valor: number
  descricao: string | null
  data: string
  conta_id: number
  criado_em: string
  categorias: Categoria[]
}

export interface OperacaoCreate {
  tipo: TipoOperacao
  valor: number
  descricao?: string
  data: string
  conta_id: number
  categoria_ids: number[]
}

export const operacoesApi = {
  listar: (params?: { mes?: string; conta_id?: number; categoria_id?: number }) =>
    client.get<Operacao[]>('/operacoes/', { params }).then(r => r.data),
  criar: (data: OperacaoCreate) =>
    client.post<Operacao>('/operacoes/', data).then(r => r.data),
  deletar: (id: number) => client.delete(`/operacoes/${id}`),
}
