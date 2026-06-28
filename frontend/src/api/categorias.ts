import client from './client'

export interface Categoria {
  id: number
  nome: string
  cor: string | null
  criado_em: string
}

export const categoriasApi = {
  listar: () => client.get<Categoria[]>('/categorias/').then(r => r.data),
  criar: (nome: string, cor?: string) =>
    client.post<Categoria>('/categorias/', { nome, cor: cor || null }).then(r => r.data),
  atualizar: (id: number, dados: { nome?: string; cor?: string | null }) =>
    client.patch<Categoria>(`/categorias/${id}`, dados).then(r => r.data),
  deletar: (id: number) => client.delete(`/categorias/${id}`),
}
