import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import { metasApi, type Meta } from '../api/metas'
import { brl } from '../utils/format'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

type ModalState =
  | { type: 'criar' }
  | { type: 'atualizar'; meta: Meta }

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
    mutationFn: (id: number) =>
      metasApi.atualizar(id, { valor_atual: parseFloat(valorAtual) }),
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

  function abrirCriar() {
    setDescricao('')
    setValorAlvo('')
    setModal({ type: 'criar' })
  }

  function abrirAtualizar(meta: Meta) {
    setValorAtual(String(meta.valor_atual))
    setModal({ type: 'atualizar', meta })
  }

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
            onClick={abrirCriar}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
          >
            <Plus size={16} />
            Nova
          </button>
        }
      />

      {isLoading && (
        <p className="text-center text-gray-400 text-sm mt-8">Carregando...</p>
      )}

      {!isLoading && metas.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Nenhuma meta cadastrada.
        </p>
      )}

      <ul className="flex flex-col gap-3 mx-4 mt-4">
        {metas.map(meta => {
          const progresso = pct(meta)
          return (
            <li
              key={meta.id}
              className={`bg-white rounded-xl shadow-sm p-4 ${
                meta.concluida ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{meta.descricao}</p>
                    {meta.concluida && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                        Concluída
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {brl(meta.valor_atual)} de {brl(meta.valor_alvo)}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    progresso >= 100 ? 'text-emerald-600' : 'text-indigo-600'
                  }`}
                >
                  {progresso}%
                </span>
              </div>

              {/* barra de progresso */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    progresso >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progresso}%` }}
                />
              </div>

              {/* ações */}
              {deletingId === meta.id ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Remover?</span>
                  <button
                    onClick={() => deletar.mutate(meta.id)}
                    disabled={deletar.isPending}
                    className="text-sm text-red-600 font-medium"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-sm text-gray-400"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {!meta.concluida && (
                    <>
                      <button
                        onClick={() => abrirAtualizar(meta)}
                        className="text-xs text-indigo-600 font-medium"
                      >
                        Atualizar valor
                      </button>
                      <button
                        onClick={() => concluir.mutate(meta.id)}
                        disabled={concluir.isPending}
                        className="flex items-center gap-1 text-xs text-emerald-600 font-medium"
                      >
                        <CheckCircle size={13} />
                        Concluir
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setDeletingId(meta.id)}
                    className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* modal criar */}
      {modal?.type === 'criar' && (
        <Modal title="Nova meta" onClose={() => setModal(null)}>
          <form
            onSubmit={e => { e.preventDefault(); criar.mutate() }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="text-sm text-gray-600 block mb-1">Descrição</label>
              <input
                autoFocus
                required
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="ex: Reserva de emergência"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Valor alvo (R$)</label>
              <input
                required
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={valorAlvo}
                onChange={e => setValorAlvo(e.target.value)}
                placeholder="0,00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={criar.isPending || !descricao.trim() || !valorAlvo}
              className="mt-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {criar.isPending ? 'Salvando...' : 'Criar meta'}
            </button>
          </form>
        </Modal>
      )}

      {/* modal atualizar valor */}
      {modal?.type === 'atualizar' && (
        <Modal title={`Atualizar — ${modal.meta.descricao}`} onClose={() => setModal(null)}>
          <form
            onSubmit={e => { e.preventDefault(); atualizarValor.mutate(modal.meta.id) }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="text-sm text-gray-600 block mb-1">Valor atual (R$)</label>
              <input
                autoFocus
                required
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={valorAtual}
                onChange={e => setValorAtual(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={atualizarValor.isPending}
              className="mt-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {atualizarValor.isPending ? 'Salvando...' : 'Atualizar'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
