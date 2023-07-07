import sinon from 'sinon'
import { expect } from 'chai'
import httpMocks from 'node-mocks-http'
import { httpCallback } from './index.js'

function mockHttpRequest({ method, url, body = null, headers = {} }) {
  const req = httpMocks.createRequest({ method, url, body, headers })
  const res = httpMocks.createResponse()
  return { req, res }
}

async function testHttpRequest(options, expectedStatusCode) {
  const { req, res } = mockHttpRequest(options)
  await httpCallback(req, res)
  expect(res.statusCode).to.equal(expectedStatusCode)
}

describe('Mnemosyne API tests', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should respond GET /', async () => {
    await testHttpRequest({ method: 'GET', url: '/' }, 200)
  })

  it('should NOT respond GET /missing-file.md', async () => {
    await testHttpRequest({ method: 'GET', url: '/README.md' }, 404)
  })

  it('should be in read-only mode', async () => {
    await testHttpRequest(
      {
        method: 'PUT',
        url: '/README.md',
        body: 'hello world',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
      405,
    )
  })
})
