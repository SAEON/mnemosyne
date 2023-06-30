import sinon from 'sinon'
import { expect } from 'chai'
import httpMocks from 'node-mocks-http'
import { httpCallback } from '../src/server/index.js'

describe('Mnemosyne API tests', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should respond GET /', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/',
    })

    const res = httpMocks.createResponse()
    await httpCallback(req, res)
    expect(res.statusCode).to.equal(200)
  })

  it('should respond GET /README.md', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/README.md',
    })

    const res = httpMocks.createResponse()
    await httpCallback(req, res)
    expect(res.statusCode).to.equal(200)
  })
})
