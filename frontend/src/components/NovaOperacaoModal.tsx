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

export default function NovaOperacaoModal({ onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()

  const [tipo, setTipo] = useState<TipoOperacao>('gasto')
  const [valor, setValor] = useState('')
  const [contaId, setContaId] = useState<number | ''>('')
  const [categoriaIds, setCategoriaIds] = useState<number[]>([])
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(localDateStr())

  const { data: contas = [] } = useQuery({ queryKey: ['contas'], queryFn: contasApi.listar })
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })

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
      // invalida operações e contas (saldo muda)
      queryClient.invalidateQueries({ queryKey: ['operacoes'] })
      queryClient.invalidateQueries({ queryKey: ['contas'] })
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

  const valido =
    parseFloat(valor) > 0 &&
    contaId !== '' &&
    categoriaIds.length > 0

  return (
    <Modal title="Nova operação" onClose={onClose}>
      <form
        onSubmit={e => { e.preventDefault(); criar.mutate() }}
        className="flex flex-col gap-4"
      >
        {/* toggle gasto / recebimento */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-medium">
          {(['gasto', 'recebimento'] as TipoOperacao[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`flex-1 py-2 transition-colors capitalize ${
                tipo === t
                  ? t === 'gasto'
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white'
                  : 'text-gray-500 bg-white'
              }`}
            >
              {t === 'gasto' ? 'Gasto' : 'Recebimento'}
            </button>
          ))}
        </div>

        {/* valor */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Valor (R$)</label>
          <input
            autoFocus
            required
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="0,00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* conta */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Conta</label>
          {contas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma conta cadastrada.</p>
          ) : (
            <select
              required
              value={contaId}
              onChange={e => setContaId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Selecionar conta...</option>
              {contas.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          )}
        </div>

        {/* categorias */}
        <div>
          <label className="text-sm text-gray-600 block mb-2">Categorias</label>
          {categorias.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => {
                const selecionada = categoriaIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategoria(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selecionada
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 bg-white'
                    }`}
                    style={selecionada ? { backgroundColor: cat.cor ?? '#6366f1' } : undefined}
                  >
                    {cat.nome}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* descrição */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">
            Descrição <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="ex: Restaurante, Uber..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* data */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Data</label>
          <input
            required
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={criar.isPending || !valido}
          className={`py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            tipo === 'gasto' ? 'bg-red-500' : 'bg-emerald-500'
          }`}
        >
          {criar.isPending ? 'Registrando...' : 'Registrar operação'}
        </button>
      </form>
    </Modal>
  )
}
