import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { operacoesApi } from '../api/operacoes'
import { contasApi } from '../api/contas'
import { brl, formatDate, mesLabel, localDateStr, navMes } from '../utils/format'
import PageHeader from '../components/PageHeader'
import NovaOperacaoModal from '../components/NovaOperacaoModal'

export default function Operacoes() {
  const queryClient = useQueryClient()
  const [mes, setMes] = useState(() => localDateStr().slice(0, 7))
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: operacoes = [], isLoading } = useQuery({
    queryKey: ['operacoes', mes],
    queryFn: () => operacoesApi.listar({ mes }),
  })

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: contasApi.listar,
  })

  const deletar = useMutation({
    mutationFn: operacoesApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] })
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Operação removida')
      setDeletingId(null)
    },
    onError: () => toast.error('Erro ao remover operação'),
  })

  const contaMap = Object.fromEntries(contas.map(c => [c.id, c.nome]))

  return (
    <div>
      <PageHeader
        title="Operações"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-3 py-1.5 rounded-lg glow-cyan transition-colors"
          >
            <Plus size={16} />
            Nova
          </button>
        }
      />

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

      {!isLoading && operacoes.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-8">Nenhuma operação neste mês.</p>
      )}

      <ul className="divide-y divide-slate-800 bg-slate-900 mx-4 mt-4 rounded-xl overflow-hidden border border-slate-800">
        {operacoes.map(op => (
          <li key={op.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${op.tipo === 'gasto' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {op.descricao ?? (op.tipo === 'gasto' ? 'Gasto' : 'Recebimento')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(op.data)}{contaMap[op.conta_id] ? ` · ${contaMap[op.conta_id]}` : ''}
                  </p>
                  {op.categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {op.categorias.map(cat => (
                        <span
                          key={cat.id}
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: (cat.cor ?? '#22d3ee') + '22',
                            color: cat.cor ?? '#22d3ee',
                          }}
                        >
                          {cat.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                <p className={`text-sm font-semibold ${op.tipo === 'gasto' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {op.tipo === 'gasto' ? '−' : '+'}&nbsp;{brl(op.valor)}
                </p>
                {deletingId === op.id ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => deletar.mutate(op.id)} disabled={deletar.isPending} className="text-xs text-rose-400 font-medium">Remover</button>
                    <button onClick={() => setDeletingId(null)} className="text-xs text-slate-500">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setDeletingId(op.id)} className="text-xs text-slate-700 hover:text-rose-400 transition-colors">
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <NovaOperacaoModal onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
      )}
    </div>
  )
}
