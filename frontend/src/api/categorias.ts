import client from './client'

export type TipoCategoria = 'gasto' | 'recebimento'

export interface Categoria {
  id: number
  nome: string
  cor: string | null
  tipo: TipoCategoria
  criado_em: string
}

export const categoriasApi = {
  listar: () => client.get<Categoria[]>('/categorias/').then(r => r.data),
  criar: (nome: string, cor: string | undefined, tipo: TipoCategoria) =>
    client.post<Categoria>('/categorias/', { nome, cor: cor || null, tipo }).then(r => r.data),
  atualizar: (id: number, dados: { nome?: string; cor?: string | null; tipo?: TipoCategoria }) =>
    client.patch<Categoria>(`/categorias/${id}`, dados).then(r => r.data),
  deletar: (id: number) => client.delete(`/categorias/${id}`),
}
