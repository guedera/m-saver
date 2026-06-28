import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contasApi } from '../api/contas'
import { categoriasApi } from '../api/categorias'
import { operacoesApi, type TipoOperacao } from '../api/operacoes'
import { localDateStr } from '../utils/format'
import Modal from './Modal'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const LABEL = 'text-sm text-slate-400 block mb-1'
const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'

export default function NovaOperacaoModal({ onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()

  const [tipo, setTipo] = useState<TipoOperacao>('gasto')
  const [valor, setValor] = useState('')
  const [contaId, setContaId] = useState<number | ''>('')
  const [categoriaIds, setCategoriaIds] = useState<number[]>([])
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(localDateStr())

  const { data: contas = [] } = useQuery({ queryKey: ['contas'], queryFn: contasApi.listar })
  const { data: todasCategorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })

  // apenas as categorias do tipo selecionado
  const categorias = todasCategorias.filter(c => c.tipo === tipo)

  // limpa seleção quando o tipo muda (categorias de gasto != categorias de recebimento)
  function mudarTipo(novoTipo: TipoOperacao) {
    setTipo(novoTipo)
    setCategoriaIds([])
  }

  const criar = useMutation({
    mutationFn: () =>
      operacoesApi.criar({
        tipo,
        valor: parseFloat(valor),
        descricao: descricao.trim() || undefined,
        data,
        conta_id: contaId as number,
        categoria_ids: categoriaIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] })
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Operação registrada')
      onSuccess()
    },
    onError: () => toast.error('Erro ao registrar operação'),
  })

  function toggleCategoria(id: number) {
    setCategoriaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const valido = parseFloat(valor) > 0 && contaId !== '' && categoriaIds.length > 0
  const btnColor = tipo === 'gasto' ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-500 hover:bg-emerald-400'

  return (
    <Modal title="Nova operação" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); criar.mutate() }} className="flex flex-col gap-4">

        {/* toggle tipo */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 text-sm font-medium">
          {(['gasto', 'recebimento'] as TipoOperacao[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => mudarTipo(t)}
              className={`flex-1 py-2 transition-colors ${
                tipo === t
                  ? t === 'gasto' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  : 'text-slate-400 bg-slate-800'
              }`}
            >
              {t === 'gasto' ? 'Gasto' : 'Recebimento'}
            </button>
          ))}
        </div>

        {/* valor */}
        <div>
          <label className={LABEL}>Valor (R$)</label>
          <input
            autoFocus required type="number" inputMode="decimal" step="0.01" min="0.01"
            value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00"
            className={`${INPUT} text-lg font-semibold`}
          />
        </div>

        {/* conta */}
        <div>
          <label className={LABEL}>Conta</label>
          {contas.length === 0
            ? <p className="text-sm text-slate-500">Nenhuma conta cadastrada.</p>
            : (
              <select required value={contaId} onChange={e => setContaId(Number(e.target.value))} className={INPUT}>
                <option value="">Selecionar conta...</option>
                {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )
          }
        </div>

        {/* categorias filtradas por tipo */}
        <div>
          <label className={LABEL}>Categorias</label>
          {categorias.length === 0
            ? (
              <p className="text-sm text-slate-500">
                Nenhuma categoria de {tipo === 'gasto' ? 'gasto' : 'recebimento'} cadastrada.
              </p>
            )
            : (
              <div className="flex flex-wrap gap-2">
                {categorias.map(cat => {
                  const sel = categoriaIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id} type="button" onClick={() => toggleCategoria(cat.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        sel ? 'border-transparent text-slate-950 font-medium' : 'border-slate-700 text-slate-400 bg-slate-800'
                      }`}
                      style={sel ? { backgroundColor: cat.cor ?? '#22d3ee' } : undefined}
                    >
                      {cat.nome}
                    </button>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* descrição */}
        <div>
          <label className={LABEL}>Descrição <span className="text-slate-600">(opcional)</span></label>
          <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="ex: Restaurante, Uber..." className={INPUT} />
        </div>

        {/* data */}
        <div>
          <label className={LABEL}>Data</label>
          <input required type="date" value={data} onChange={e => setData(e.target.value)} className={INPUT} />
        </div>

        <button
          type="submit" disabled={criar.isPending || !valido}
          className={`py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 ${btnColor}`}
        >
          {criar.isPending ? 'Registrando...' : 'Registrar operação'}
        </button>
      </form>
    </Modal>
  )
}
