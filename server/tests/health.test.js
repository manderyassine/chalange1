import request from 'supertest'
import app from '../src/app.js'

describe('health', () => {
  it('GET /api/health should return ok true', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
