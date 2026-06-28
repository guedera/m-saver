import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import { metasApi, type Meta } from '../api/metas'
import { brl } from '../utils/format'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

type ModalState = { type: 'criar' } | { type: 'atualizar'; meta: Meta }

const LABEL = 'text-sm text-slate-400 block mb-1'
const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'
const BTN_PRIMARY = 'mt-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-40 transition-colors glow-cyan'

export default function Metas() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [descricao, setDescricao] = useState('')
  const [valorAlvo, setValorAlvo] = useState('')
  const [valorAtual, setValorAtual] = useState('')

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ['metas'],
    queryFn: metasApi.listar,
  })

  const criar = useMutation({
    mutationFn: () => metasApi.criar(descricao.trim(), parseFloat(valorAlvo)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] })
      toast.success('Meta criada')
      setModal(null)
    },
    onError: () => toast.error('Erro ao criar meta'),
  })

  const atualizarValor = useMutation({
    mutationFn: (id: number) => metasApi.atualizar(id, { valor_atual: parseFloat(valorAtual) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] })
      toast.success('Meta atualizada')
      setModal(null)
    },
    onError: () => toast.error('Erro ao atualizar meta'),
  })

  const concluir = useMutation({
    mutationFn: (id: number) => metasApi.atualizar(id, { concluida: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] })
      toast.success('Meta concluída!')
    },
    onError: () => toast.error('Erro ao concluir meta'),
  })

  const deletar = useMutation({
    mutationFn: metasApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] })
      toast.success('Meta removida')
      setDeletingId(null)
    },
    onError: () => toast.error('Erro ao remover meta'),
  })

  function pct(meta: Meta) {
    if (meta.valor_alvo <= 0) return 0
    return Math.min(100, Math.round((meta.valor_atual / meta.valor_alvo) * 100))
  }

  return (
    <div>
      <PageHeader
        title="Metas"
        action={
          <button
            onClick={() => { setDescricao(''); setValorAlvo(''); setModal({ type: 'criar' }) }}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-3 py-1.5 rounded-lg glow-cyan transition-colors"
          >
            <Plus size={16} />
            Nova
          </button>
        }
      />

      {isLoading && <p className="text-center text-slate-500 text-sm mt-8">Carregando...</p>}

      {!isLoading && metas.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-8">Nenhuma meta cadastrada.</p>
      )}

      <ul className="flex flex-col gap-3 mx-4 mt-4">
        {metas.map(meta => {
          const progresso = pct(meta)
          return (
            <li key={meta.id} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${meta.concluida ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-100 text-sm">{meta.descricao}</p>
                    {meta.concluida && (
                      <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                        Concluída
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {brl(meta.valor_atual)} de {brl(meta.valor_alvo)}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${progresso >= 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {progresso}%
                </span>
              </div>

              {/* barra de progresso */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${progresso >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                  style={{ width: `${progresso}%`, boxShadow: progresso > 0 ? '0 0 8px rgba(34,211,238,0.5)' : 'none' }}
                />
              </div>

              {/* ações */}
              {deletingId === meta.id ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Remover?</span>
                  <button onClick={() => deletar.mutate(meta.id)} disabled={deletar.isPending} className="text-sm text-rose-400 font-medium">Sim</button>
                  <button onClick={() => setDeletingId(null)} className="text-sm text-slate-500">Não</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {!meta.concluida && (
                    <>
                      <button onClick={() => { setValorAtual(String(meta.valor_atual)); setModal({ type: 'atualizar', meta }) }} className="text-xs text-cyan-400 font-medium">
                        Atualizar valor
                      </button>
                      <button onClick={() => concluir.mutate(meta.id)} disabled={concluir.isPending} className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle size={13} />
                        Concluir
                      </button>
                    </>
                  )}
                  <button onClick={() => setDeletingId(meta.id)} className="ml-auto text-slate-700 hover:text-rose-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {modal?.type === 'criar' && (
        <Modal title="Nova meta" onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); criar.mutate() }} className="flex flex-col gap-3">
            <div>
              <label className={LABEL}>Descrição</label>
              <input autoFocus required value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="ex: Reserva de emergência" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Valor alvo (R$)</label>
              <input required type="number" inputMode="decimal" step="0.01" min="0.01" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} placeholder="0,00" className={INPUT} />
            </div>
            <button type="submit" disabled={criar.isPending || !descricao.trim() || !valorAlvo} className={BTN_PRIMARY}>
              {criar.isPending ? 'Salvando...' : 'Criar meta'}
            </button>
          </form>
        </Modal>
      )}

      {modal?.type === 'atualizar' && (
        <Modal title={`Atualizar — ${modal.meta.descricao}`} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); atualizarValor.mutate(modal.meta.id) }} className="flex flex-col gap-3">
            <div>
              <label className={LABEL}>Valor atual (R$)</label>
              <input autoFocus required type="number" inputMode="decimal" step="0.01" min="0" value={valorAtual} onChange={e => setValorAtual(e.target.value)} className={INPUT} />
            </div>
            <button type="submit" disabled={atualizarValor.isPending} className={BTN_PRIMARY}>
              {atualizarValor.isPending ? 'Salvando...' : 'Atualizar'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
