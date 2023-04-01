import { customAlphabet } from 'nanoid'
import fs from 'fs'

import pkg from '../package.json' assert { type: 'json' }

const nanoid = customAlphabet('1234567890abcdefhijklmnopqrstuvwxyz', 7)
const newId = nanoid()

const data = {
  id: 'user-latency',
  title: 'User Latency',
  description: pkg.description,
  version: pkg.version,
  author: 'hypnoCode',
  authors: [
    {
      name: 'hypnoCode',
      email: 'mawburn7@gmail.com',
      url: 'mawburn.com',
    },
  ],
  scripts: [],
  esmodules: [`userlatency-${newId}.js`],
  styles: [`userlatency-${newId}.css`],
  packs: [],
  languages: [
    {
      lang: 'en',
      name: 'English',
      path: 'lang/en.json',
    },
    {
      lang: 'es',
      name: 'Español',
      path: 'lang/es.json',
    },
    {
      lang: 'fr',
      name: 'Français',
      path: 'lang/fr.json',
    },
    {
      lang: 'zh-CH',
      name: '英语',
      path: 'lang/zh-CH.json',
    },
  ],
  socket: true,
  url: 'https://github.com/mawburn/foundry-user-latency',
  manifest: `https://github.com/mawburn/foundry-user-latency/releases/download/v${pkg.version}/module.json`,
  download: `https://github.com/mawburn/foundry-user-latency/releases/download/v${pkg.version}/module.zip`,
  license: 'GNU AGPLv3',
  readme: 'https://github.com/mawburn/foundry-user-latency/blob/main/README.md',
  bugs: 'https://github.com/mawburn/foundry-user-latency/issues',
  changelog: 'https://github.com/mawburn/foundry-user-latency/releases',
  minimumCoreVersion: 10,
  maximumCoreVersion: 10,
  compatibleCoreVersion: 10,
  compatibility: {
    minimum: '10',
    verified: '10',
  },
}

fs.renameSync('dist/main.js', `dist/logger-${newId}.js`)
fs.renameSync('dist/main.js.map', `dist/logger-${newId}.js.map`)
fs.renameSync('dist/main.css', `dist/logger-${newId}.css`)
fs.renameSync('dist/main.css.map', `dist/logger-${newId}.css.map`)
fs.writeFileSync('dist/module.json', JSON.stringify(data, null, 2))
