import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { contasApi, type Conta } from '../api/contas'
import { brl } from '../utils/format'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

type ModalState =
  | { type: 'criar' }
  | { type: 'editar-saldo'; conta: Conta }

const LABEL = 'text-sm text-slate-400 block mb-1'
const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'
const BTN_PRIMARY = 'mt-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-40 transition-colors glow-cyan'

export default function Contas() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [saldoInicial, setSaldoInicial] = useState('')
  const [novoSaldo, setNovoSaldo] = useState('')

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas'],
    queryFn: contasApi.listar,
  })

  const criar = useMutation({
    mutationFn: () => contasApi.criar(nome.trim(), parseFloat(saldoInicial) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      toast.success('Conta criada')
      setModal(null)
    },
    onError: () => toast.error('Erro ao criar conta'),
  })

  const editarSaldo = useMutation({
    mutationFn: (id: number) => contasApi.atualizarSaldo(id, parseFloat(novoSaldo)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      toast.success('Saldo atualizado')
      setModal(null)
    },
    onError: () => toast.error('Erro ao atualizar saldo'),
  })

  const deletar = useMutation({
    mutationFn: contasApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      toast.success('Conta removida')
      setDeletingId(null)
    },
    onError: () => toast.error('Erro ao remover conta'),
  })

  function abrirCriar() {
    setNome(''); setSaldoInicial('')
    setModal({ type: 'criar' })
  }

  function abrirEditarSaldo(conta: Conta) {
    setNovoSaldo(String(conta.saldo_atual))
    setModal({ type: 'editar-saldo', conta })
  }

  return (
    <div>
      <PageHeader
        title="Contas"
        action={
          <button
            onClick={abrirCriar}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-3 py-1.5 rounded-lg glow-cyan transition-colors"
          >
            <Plus size={16} />
            Nova
          </button>
        }
      />

      {isLoading && <p className="text-center text-slate-500 text-sm mt-8">Carregando...</p>}

      {!isLoading && contas.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-8">Nenhuma conta cadastrada.</p>
      )}

      <ul className="divide-y divide-slate-800 bg-slate-900 mx-4 mt-4 rounded-xl overflow-hidden border border-slate-800">
        {contas.map(conta => (
          <li key={conta.id} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">{conta.nome}</p>
                <p className={`text-sm font-semibold ${conta.saldo_atual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {brl(conta.saldo_atual)}
                </p>
              </div>

              {deletingId === conta.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Remover?</span>
                  <button onClick={() => deletar.mutate(conta.id)} disabled={deletar.isPending} className="text-sm text-rose-400 font-medium">Sim</button>
                  <button onClick={() => setDeletingId(null)} className="text-sm text-slate-500">Não</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => abrirEditarSaldo(conta)} className="text-slate-600 hover:text-cyan-400 p-1 transition-colors"><Pencil size={17} /></button>
                  <button onClick={() => setDeletingId(conta.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors"><Trash2 size={17} /></button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {modal?.type === 'criar' && (
        <Modal title="Nova conta" onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); criar.mutate() }} className="flex flex-col gap-3">
            <div>
              <label className={LABEL}>Nome</label>
              <input autoFocus required value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: BTG, Itaú" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Saldo inicial (R$)</label>
              <input type="number" inputMode="decimal" step="0.01" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} placeholder="0,00" className={INPUT} />
            </div>
            <button type="submit" disabled={criar.isPending || !nome.trim()} className={BTN_PRIMARY}>
              {criar.isPending ? 'Salvando...' : 'Criar conta'}
            </button>
          </form>
        </Modal>
      )}

      {modal?.type === 'editar-saldo' && (
        <Modal title={`Saldo — ${modal.conta.nome}`} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); editarSaldo.mutate(modal.conta.id) }} className="flex flex-col gap-3">
            <div>
              <label className={LABEL}>Novo saldo (R$)</label>
              <input autoFocus required type="number" inputMode="decimal" step="0.01" value={novoSaldo} onChange={e => setNovoSaldo(e.target.value)} className={INPUT} />
            </div>
            <button type="submit" disabled={editarSaldo.isPending} className={BTN_PRIMARY}>
              {editarSaldo.isPending ? 'Salvando...' : 'Atualizar saldo'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
