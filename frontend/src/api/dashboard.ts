import client from './client'
import type { Conta } from './contas'
import type { Meta } from './metas'

export interface GastoCategoria {
  categoria_id: number
  nome: string
  cor: string | null
  total: number
}

export interface DashboardData {
  mes: string
  total_entradas: number
  total_saidas: number
  saldo_mes: number
  saldos_por_conta: Conta[]
  gastos_por_categoria: GastoCategoria[]
  meses_com_operacoes: string[]
  metas: Meta[]
}

export const dashboardApi = {
  get: (mes?: string) =>
    client
      .get<DashboardData>('/dashboard/', { params: mes ? { mes } : {} })
      .then(r => r.data),
}
