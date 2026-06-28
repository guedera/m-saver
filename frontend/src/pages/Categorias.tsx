import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoriasApi, type Categoria, type TipoCategoria } from '../api/categorias'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

type ModalState = { type: 'criar' } | { type: 'editar'; categoria: Categoria }
type Aba = 'gasto' | 'recebimento'

const COR_PADRAO = '#22d3ee'
const LABEL = 'text-sm text-slate-400 block mb-1'
const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'
const BTN_PRIMARY = 'mt-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-40 transition-colors glow-cyan'

export default function Categorias() {
  const queryClient = useQueryClient()
  const [aba, setAba] = useState<Aba>('gasto')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(COR_PADRAO)
  const [tipo, setTipo] = useState<TipoCategoria>('gasto')

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  })

  const visiveis = categorias.filter(c => c.tipo === aba)

  const criar = useMutation({
    mutationFn: () => categoriasApi.criar(nome.trim(), cor, tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria criada')
      setModal(null)
    },
    onError: () => toast.error('Erro ao criar categoria'),
  })

  const editar = useMutation({
    mutationFn: (id: number) => categoriasApi.atualizar(id, { nome: nome.trim(), cor, tipo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria atualizada')
      setModal(null)
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
    setNome(''); setCor(COR_PADRAO); setTipo(aba)
    setModal({ type: 'criar' })
  }

  function abrirEditar(cat: Categoria) {
    setNome(cat.nome); setCor(cat.cor ?? COR_PADRAO); setTipo(cat.tipo)
    setModal({ type: 'editar', categoria: cat })
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
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-3 py-1.5 rounded-lg glow-cyan transition-colors"
          >
            <Plus size={16} />
            Nova
          </button>
        }
      />

      {/* abas gasto / recebimento */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        {(['gasto', 'recebimento'] as Aba[]).map(t => (
          <button
            key={t}
            onClick={() => setAba(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
              aba === t
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-500 border-b-2 border-transparent'
            }`}
          >
            {t === 'gasto' ? 'Gastos' : 'Recebimentos'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-center text-slate-500 text-sm mt-8">Carregando...</p>}

      {!isLoading && visiveis.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-8">
          Nenhuma categoria de {aba === 'gasto' ? 'gasto' : 'recebimento'} cadastrada.
        </p>
      )}

      <ul className="divide-y divide-slate-800 bg-slate-900 mx-4 mt-4 rounded-xl overflow-hidden border border-slate-800">
        {visiveis.map(cat => (
          <li key={cat.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.cor ?? '#64748b' }} />
              <span className="font-medium text-slate-100 text-sm">{cat.nome}</span>
            </div>

            {deletingId === cat.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Remover?</span>
                <button onClick={() => deletar.mutate(cat.id)} disabled={deletar.isPending} className="text-sm text-rose-400 font-medium">Sim</button>
                <button onClick={() => setDeletingId(null)} className="text-sm text-slate-500">Não</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => abrirEditar(cat)} className="text-slate-600 hover:text-cyan-400 p-1 transition-colors"><Pencil size={17} /></button>
                <button onClick={() => setDeletingId(cat.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors"><Trash2 size={17} /></button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {modal && (
        <Modal title={modal.type === 'criar' ? 'Nova categoria' : 'Editar categoria'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* tipo gasto / recebimento */}
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-sm font-medium">
              {(['gasto', 'recebimento'] as TipoCategoria[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 py-2 transition-colors ${
                    tipo === t
                      ? t === 'gasto'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  {t === 'gasto' ? 'Gasto' : 'Recebimento'}
                </button>
              ))}
            </div>

            <div>
              <label className={LABEL}>Nome</label>
              <input autoFocus required value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: COMIDA, SALÁRIO" className={INPUT} />
            </div>

            <div>
              <label className={LABEL}>Cor</label>
              <div className="flex items-center gap-3">
                <input type="color" value={cor} onChange={e => setCor(e.target.value)} className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer p-0.5 bg-slate-800" />
                <span className="text-sm text-slate-400 font-mono">{cor}</span>
              </div>
            </div>

            <button type="submit" disabled={isPending || !nome.trim()} className={BTN_PRIMARY}>
              {isPending ? 'Salvando...' : modal.type === 'criar' ? 'Criar categoria' : 'Salvar alterações'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
