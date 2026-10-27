import { setupServer } from 'msw/node'

export const API_URL = 'http://localhost:3000/api/parts'
export const server = setupServer()
