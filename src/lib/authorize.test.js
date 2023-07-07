import authorize from './authorize.js'
import { expect } from 'chai'

describe('Mnemosyne permissions model tests', () => {
  const user = {
    username: 'test',
    permissions: ['./dir', './dir2/sub', 'dir2/sub2/'],
  }

  const testPaths = {
    okay: ['dir/file.txt', 'dir2/sub/file.txt'],
    bad: [null, undefined, '/', 'dir', 'dir3/file.txt', 'dir2/sub3/file.txt'],
  }

  describe('Authorized users', () => {
    it('should authorize upload for valid paths', async () => {
      testPaths.okay.forEach(path => {
        const authorized = authorize(user, path)
        expect(authorized).to.be.true
      })
    })
  })

  describe('Unauthorized users', () => {
    it('should not authorize upload for invalid paths', async () => {
      testPaths.bad.forEach(path => {
        const authorized = authorize(user, path)
        expect(authorized).to.be.false
      })
    })
  })
})
