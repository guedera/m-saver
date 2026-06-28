import client from './client'

export interface Meta {
  id: number
  descricao: string
  valor_alvo: number
  valor_atual: number
  concluida: boolean
  criado_em: string
}

export const metasApi = {
  listar: () => client.get<Meta[]>('/metas/').then(r => r.data),
  criar: (descricao: string, valor_alvo: number) =>
    client.post<Meta>('/metas/', { descricao, valor_alvo }).then(r => r.data),
  atualizar: (id: number, dados: { descricao?: string; valor_atual?: number; concluida?: boolean }) =>
    client.patch<Meta>(`/metas/${id}`, dados).then(r => r.data),
  deletar: (id: number) => client.delete(`/metas/${id}`),
}
