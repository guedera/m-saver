import client from './client'

export interface Conta {
  id: number
  nome: string
  saldo_atual: number
  criado_em: string
}

export const contasApi = {
  listar: () => client.get<Conta[]>('/contas/').then(r => r.data),
  criar: (nome: string, saldo_inicial: number) =>
    client.post<Conta>('/contas/', { nome, saldo_inicial }).then(r => r.data),
  atualizarSaldo: (id: number, saldo_atual: number) =>
    client.patch<Conta>(`/contas/${id}`, { saldo_atual }).then(r => r.data),
  deletar: (id: number) => client.delete(`/contas/${id}`),
}
