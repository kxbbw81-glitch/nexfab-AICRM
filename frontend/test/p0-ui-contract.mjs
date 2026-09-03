import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const files = {
  package: new URL('package.json', root),
  shell: new URL('src/components/crm-shell.tsx', root),
  api: new URL('src/lib/api.ts', root),
  proxy: new URL('src/app/api/backend/[...path]/route.ts', root),
  globals: new URL('src/app/globals.css', root),
}

const pkg = JSON.parse(await readFile(files.package, 'utf8'))
assert.ok(pkg.dependencies.next, 'Next.js dependency is required')
assert.ok(pkg.dependencies.react, 'React dependency is required')
assert.ok(pkg.devDependencies.tailwindcss, 'Tailwind dependency is required')
assert.ok(pkg.dependencies['@radix-ui/react-slot'], 'shadcn/ui Radix slot dependency is required')
assert.ok(pkg.scripts.build && pkg.scripts.typecheck && pkg.scripts.lint, 'build/typecheck/lint scripts are required')

const shell = await readFile(files.shell, 'utf8')
assert.match(shell, /api\.session\(\)/, 'frontend must consume backend session API')
assert.match(shell, /api\.navigation\(\)/, 'frontend must consume backend dynamic navigation API')
assert.match(shell, /api\.dashboard\(\)/, 'frontend must consume backend dashboard API')
assert.match(shell, /w-\[232px\]/, 'sidebar width must follow the real HTML reference')
assert.match(shell, /h-\[56px\]/, 'header height must follow the real HTML reference')
assert.match(shell, /AI 助手/, 'AI assistant footer must follow navigation reference')

const api = await readFile(files.api, 'utf8')
assert.match(api, /\/api\/backend/, 'browser requests must go through the same-origin backend proxy')
assert.match(api, /const basePath = process\.env\.NEXT_PUBLIC_BASE_PATH \|\| ''/, 'API client must read the deployment base path')
assert.match(api, /fetch\(`\$\{basePath\}\/api\/backend\$\{path\}`/, 'API client must preserve the /new deployment prefix')
assert.doesNotMatch(api, /passwordHash/, 'frontend API layer must not request or persist passwordHash')

const proxy = await readFile(files.proxy, 'utf8')
assert.match(proxy, /BACKEND_URL/, 'proxy must target existing backend URL')
assert.doesNotMatch(proxy, /DATABASE_URL|SESSION_SECRET/, 'frontend proxy must not read database/session secrets')

const css = await readFile(files.globals, 'utf8')
assert.match(css, /#2d2d2d/i, 'brand color must follow NexFab VI reference')
assert.match(css, /overflow: hidden/, 'page shell must follow reference full-height app behavior')

console.log(JSON.stringify({ result: 'passed', mode: 'p0-ui-contract', checks: 14 }))
