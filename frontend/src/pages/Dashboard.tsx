import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api/dashboard'
import { brl, mesLabel, localDateStr, navMes } from '../utils/format'
import PageHeader from '../components/PageHeader'

const PALETTE = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#e879f9']

export default function Dashboard() {
  const [mes, setMes] = useState(() => localDateStr().slice(0, 7))
  const [metaId, setMetaId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', mes],
    queryFn: () => dashboardApi.get(mes),
  })

  useEffect(() => {
    if (metaId === null && data?.metas.length) {
      setMetaId(data.metas[0].id)
    }
  }, [data])

  const metaSelecionada = data?.metas.find(m => m.id === metaId) ?? null

  const totalGastos = data?.gastos_por_categoria.reduce((s, g) => s + g.total, 0) ?? 0
  const pieData = (data?.gastos_por_categoria ?? []).map((g, i) => ({
    ...g,
    fill: g.cor ?? PALETTE[i % PALETTE.length],
  }))

  return (
    <div className="pb-4">
      <PageHeader title="Dashboard" />

      {/* seletor de mês */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button onClick={() => setMes(m => navMes(m, -1))} className="p-1 text-slate-500 hover:text-slate-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-slate-300 capitalize">{mesLabel(mes)}</span>
        <button onClick={() => setMes(m => navMes(m, +1))} className="p-1 text-slate-500 hover:text-slate-200 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && <p className="text-center text-slate-500 text-sm mt-8">Carregando...</p>}

      {data && (
        <div className="px-4 mt-4 flex flex-col gap-4">

          {/* cards entradas / saídas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Entradas</p>
              <p className="text-base font-semibold text-emerald-400">{brl(data.total_entradas)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Saídas</p>
              <p className="text-base font-semibold text-rose-400">{brl(data.total_saidas)}</p>
            </div>
          </div>

          {/* saldo do mês */}
          <div className={`rounded-xl p-4 border ${
            data.saldo_mes >= 0 ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-rose-950/40 border-rose-800/40'
          }`}>
            <p className="text-xs text-slate-500 mb-1">Saldo do mês</p>
            <p className={`text-2xl font-bold ${data.saldo_mes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.saldo_mes >= 0 ? '+' : ''}{brl(data.saldo_mes)}
            </p>
          </div>

          {/* saldos por conta */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <p className="text-xs text-slate-500 font-medium px-4 pt-3 pb-2 uppercase tracking-wide">Saldo por conta</p>
            <ul className="divide-y divide-slate-800">
              {data.saldos_por_conta.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-500">Nenhuma conta cadastrada.</li>
              )}
              {data.saldos_por_conta.map(conta => (
                <li key={conta.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-300">{conta.nome}</span>
                  <span className={`text-sm font-semibold ${conta.saldo_atual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {brl(conta.saldo_atual)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* metas */}
          {data.metas.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Meta</p>
                {data.metas.length > 1 && (
                  <select
                    value={metaId ?? ''}
                    onChange={e => setMetaId(Number(e.target.value))}
                    className="text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {data.metas.map(m => (
                      <option key={m.id} value={m.id}>{m.descricao}</option>
                    ))}
                  </select>
                )}
              </div>

              {metaSelecionada && (() => {
                const pct = Math.min((metaSelecionada.valor_atual / metaSelecionada.valor_alvo) * 100, 100)
                const falta = Math.max(metaSelecionada.valor_alvo - metaSelecionada.valor_atual, 0)
                const concluida = metaSelecionada.concluida || pct >= 100
                return (
                  <div className="px-4 pb-4 flex flex-col gap-3">
                    {data.metas.length === 1 && (
                      <p className="text-sm font-medium text-slate-200">{metaSelecionada.descricao}</p>
                    )}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Acumulado</p>
                        <p className="text-lg font-bold text-cyan-400">{brl(metaSelecionada.valor_atual)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">{concluida ? 'Meta atingida!' : 'Faltam'}</p>
                        <p className={`text-base font-semibold ${concluida ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {concluida ? brl(metaSelecionada.valor_alvo) : brl(falta)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${concluida ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${pct}%`, boxShadow: concluida ? '0 0 8px rgba(52,211,153,0.5)' : '0 0 8px rgba(34,211,238,0.4)' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-right">
                      {pct.toFixed(0)}% de {brl(metaSelecionada.valor_alvo)}
                    </p>
                  </div>
                )
              })()}
            </div>
          )}

          {/* gastos por categoria */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <p className="text-xs text-slate-500 font-medium px-4 pt-3 pb-2 uppercase tracking-wide">Gastos por categoria</p>
            {pieData.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-slate-500">Sem gastos neste mês.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="total" nameKey="nome" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => brl(v as number)}
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12, color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="px-4 pb-4 flex flex-col gap-2">
                  {pieData.map((g, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.fill }} />
                        <span className="text-sm text-slate-300">{g.nome}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-slate-100">{brl(g.total)}</span>
                        <span className="text-xs text-slate-500 ml-1.5">
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
