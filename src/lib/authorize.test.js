import authorize from './authorize.js'
import { expect } from 'chai'

describe('Mnemosyne permissions model tests', () => {
  const user = {
    username: 'test',
    permissions: ['./dir', './dir2/sub', 'dir2/sub2/'],
  }

  const testPaths = {
    okay: ['dir/file.txt', 'dir2/sub/file.txt'],
    bad: [null, undefined, '', '.', '..', './', '/', 'dir', 'dir3/file.txt', 'dir2/sub3/file.txt'],
  }

  describe('Invalid user', () => {
    it('Should return unauthorized', async () => {
      const invalidUsers = [
        null,
        '',
        undefined,
        'no-user',
        {},
        [],
        1,
        false,
        true,
        { username: '', permissions: [] },
      ]
      invalidUsers.forEach(user => {
        const authorized = authorize(user, 'file.txt')
        expect(authorized).to.be.false
      })
    })
  })

  describe('Authorized users', () => {
    it('permissible uploads', async () => {
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
