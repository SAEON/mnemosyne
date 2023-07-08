import sinon from 'sinon'
import { expect } from 'chai'
import httpMocks from 'node-mocks-http'
import { httpCallback } from '../src/server/index.js'

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
  
  describe('Read only mode', () => {
    it('Uploads disabled', async () => {
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

    it('should respond GET /', async () => {
      await testHttpRequest({ method: 'GET', url: '/' }, 200)
    })

    it('should NOT respond GET /missing-file.md', async () => {
      await testHttpRequest({ method: 'GET', url: '/README.md' }, 404)
    })
  })

  describe('Upload/update mode', () => {
    it('Should respond PUT path', async () => {
      expect(1).to.equal(2)
    })

    it('Should not respond PUT directory', async () => {
      expect(1).to.equal(2)
    })

    it('Should respond DELETE path', async () => {
      expect(1).to.equal(2)
    })

    it('Should respond DELETE directory', async () => {
      expect(1).to.equal(2)
    })
  })
})
