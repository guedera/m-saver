import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Operacoes from './pages/Operacoes'
import Contas from './pages/Contas'
import Categorias from './pages/Categorias'
import Metas from './pages/Metas'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="operacoes" element={<Operacoes />} />
          <Route path="contas" element={<Contas />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="metas" element={<Metas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
