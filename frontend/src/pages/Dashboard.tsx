import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api/dashboard'
import { brl, mesLabel, localDateStr, navMes } from '../utils/format'
import PageHeader from '../components/PageHeader'

// paleta de fallback para categorias sem cor definida
const PALETTE = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']

export default function Dashboard() {
  const [mes, setMes] = useState(() => localDateStr().slice(0, 7))

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', mes],
    queryFn: () => dashboardApi.get(mes),
  })

  const totalGastos = data?.gastos_por_categoria.reduce((s, g) => s + g.total, 0) ?? 0

  const pieData = (data?.gastos_por_categoria ?? []).map((g, i) => ({
    ...g,
    fill: g.cor ?? PALETTE[i % PALETTE.length],
  }))

  return (
    <div className="pb-4">
      <PageHeader title="Dashboard" />

      {/* seletor de mês */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={() => setMes(m => navMes(m, -1))} className="p-1 text-gray-400 hover:text-gray-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-gray-700 capitalize">
          {mesLabel(mes)}
        </span>
        <button onClick={() => setMes(m => navMes(m, +1))} className="p-1 text-gray-400 hover:text-gray-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-gray-400 text-sm mt-8">Carregando...</p>
      )}

      {data && (
        <div className="px-4 mt-4 flex flex-col gap-4">

          {/* cards: entradas e saídas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Entradas</p>
              <p className="text-base font-semibold text-emerald-600">
                {brl(data.total_entradas)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Saídas</p>
              <p className="text-base font-semibold text-red-500">
                {brl(data.total_saidas)}
              </p>
            </div>
          </div>

          {/* card saldo do mês */}
          <div
            className={`rounded-xl p-4 shadow-sm ${
              data.saldo_mes >= 0 ? 'bg-emerald-50' : 'bg-red-50'
            }`}
          >
            <p className="text-xs text-gray-500 mb-1">Saldo do mês</p>
            <p
              className={`text-2xl font-bold ${
                data.saldo_mes >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {data.saldo_mes >= 0 ? '+' : ''}{brl(data.saldo_mes)}
            </p>
          </div>

          {/* saldos por conta */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <p className="text-xs text-gray-400 font-medium px-4 pt-3 pb-2 uppercase tracking-wide">
              Saldo por conta
            </p>
            <ul className="divide-y divide-gray-100">
              {data.saldos_por_conta.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400">Nenhuma conta cadastrada.</li>
              )}
              {data.saldos_por_conta.map(conta => (
                <li key={conta.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-700">{conta.nome}</span>
                  <span
                    className={`text-sm font-semibold ${
                      conta.saldo_atual >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {brl(conta.saldo_atual)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* gastos por categoria */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <p className="text-xs text-gray-400 font-medium px-4 pt-3 pb-2 uppercase tracking-wide">
              Gastos por categoria
            </p>
            {pieData.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-gray-400">Sem gastos neste mês.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="total"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => brl(value as number)}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* legenda */}
                <ul className="px-4 pb-4 flex flex-col gap-2">
                  {pieData.map((g, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: g.fill }}
                        />
                        <span className="text-sm text-gray-700">{g.nome}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {brl(g.total)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1.5">
                          {totalGastos > 0 ? Math.round((g.total / totalGastos) * 100) : 0}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
