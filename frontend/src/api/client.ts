import axios from 'axios'

// base URL vem do .env — em prod será a URL do Render
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

export default client
