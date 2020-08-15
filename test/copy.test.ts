import { createPath } from "../src/lib/filesystem"
const path = require('path')

test('create-path creates correct path with relative path', () => {
  const createdPath = createPath('./testing.ts', process.cwd())

  expect(createdPath).toEqual(path.join(process.cwd(), 'testing.ts'))
})
