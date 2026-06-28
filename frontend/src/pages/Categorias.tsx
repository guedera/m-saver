import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoriasApi, type Categoria } from '../api/categorias'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

type ModalState =
  | { type: 'criar' }
  | { type: 'editar'; categoria: Categoria }

const COR_PADRAO = '#6366f1'

export default function Categorias() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // form fields compartilhados entre criar e editar
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(COR_PADRAO)

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  })

  const criar = useMutation({
    mutationFn: () => categoriasApi.criar(nome.trim(), cor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria criada')
      fecharModal()
    },
    onError: () => toast.error('Erro ao criar categoria'),
  })

  const editar = useMutation({
    mutationFn: (id: number) =>
      categoriasApi.atualizar(id, { nome: nome.trim(), cor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria atualizada')
      fecharModal()
    },
    onError: () => toast.error('Erro ao atualizar categoria'),
  })

  const deletar = useMutation({
    mutationFn: categoriasApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria removida')
      setDeletingId(null)
    },
    onError: () => toast.error('Erro ao remover categoria'),
  })

  function abrirCriar() {
    setNome('')
    setCor(COR_PADRAO)
    setModal({ type: 'criar' })
  }

  function abrirEditar(categoria: Categoria) {
    setNome(categoria.nome)
    setCor(categoria.cor ?? COR_PADRAO)
    setModal({ type: 'editar', categoria })
  }

  function fecharModal() {
    setModal(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (modal?.type === 'criar') criar.mutate()
    if (modal?.type === 'editar') editar.mutate(modal.categoria.id)
  }

  const isPending = criar.isPending || editar.isPending

  return (
    <div>
      <PageHeader
        title="Categorias"
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

      {!isLoading && categorias.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Nenhuma categoria cadastrada.
        </p>
      )}

      <ul className="divide-y divide-gray-100 bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
        {categorias.map(cat => (
          <li key={cat.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* bolinha colorida */}
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.cor ?? '#d1d5db' }}
              />
              <span className="font-medium text-gray-900 text-sm">{cat.nome}</span>
            </div>

            {deletingId === cat.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Remover?</span>
                <button
                  onClick={() => deletar.mutate(cat.id)}
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
                  onClick={() => abrirEditar(cat)}
                  className="text-gray-400 hover:text-indigo-600 p-1"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={() => setDeletingId(cat.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Modal: criar ou editar */}
      {modal && (
        <Modal
          title={modal.type === 'criar' ? 'Nova categoria' : 'Editar categoria'}
          onClose={fecharModal}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nome</label>
              <input
                autoFocus
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="ex: COMIDA, TRANSPORTE"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-sm text-gray-500 font-mono">{cor}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || !nome.trim()}
              className="mt-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {isPending
                ? 'Salvando...'
                : modal.type === 'criar'
                  ? 'Criar categoria'
                  : 'Salvar alterações'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
