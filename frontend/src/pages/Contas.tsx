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

export default function Contas() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // form fields
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
      fecharModal()
    },
    onError: () => toast.error('Erro ao criar conta'),
  })

  const editarSaldo = useMutation({
    mutationFn: (id: number) => contasApi.atualizarSaldo(id, parseFloat(novoSaldo)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      toast.success('Saldo atualizado')
      fecharModal()
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
    setNome('')
    setSaldoInicial('')
    setModal({ type: 'criar' })
  }

  function abrirEditarSaldo(conta: Conta) {
    setNovoSaldo(String(conta.saldo_atual))
    setModal({ type: 'editar-saldo', conta })
  }

  function fecharModal() {
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Contas"
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

      {!isLoading && contas.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Nenhuma conta cadastrada.
        </p>
      )}

      <ul className="divide-y divide-gray-100 bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
        {contas.map(conta => (
          <li key={conta.id} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{conta.nome}</p>
                <p
                  className={`text-sm font-semibold ${
                    conta.saldo_atual >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {brl(conta.saldo_atual)}
                </p>
              </div>

              {deletingId === conta.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Remover?</span>
                  <button
                    onClick={() => deletar.mutate(conta.id)}
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
                  <button
                    onClick={() => abrirEditarSaldo(conta)}
                    className="text-gray-400 hover:text-indigo-600 p-1"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => setDeletingId(conta.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Modal: criar conta */}
      {modal?.type === 'criar' && (
        <Modal title="Nova conta" onClose={fecharModal}>
          <form
            onSubmit={e => {
              e.preventDefault()
              criar.mutate()
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nome</label>
              <input
                autoFocus
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="ex: BTG, Itaú"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Saldo inicial (R$)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
                placeholder="0,00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={criar.isPending || !nome.trim()}
              className="mt-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {criar.isPending ? 'Salvando...' : 'Criar conta'}
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: editar saldo */}
      {modal?.type === 'editar-saldo' && (
        <Modal
          title={`Saldo — ${modal.conta.nome}`}
          onClose={fecharModal}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              editarSaldo.mutate(modal.conta.id)
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Novo saldo (R$)
              </label>
              <input
                autoFocus
                required
                type="number"
                inputMode="decimal"
                step="0.01"
                value={novoSaldo}
                onChange={e => setNovoSaldo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={editarSaldo.isPending}
              className="mt-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {editarSaldo.isPending ? 'Salvando...' : 'Atualizar saldo'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
