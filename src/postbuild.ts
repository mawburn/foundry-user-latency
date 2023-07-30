import { customAlphabet } from 'nanoid'
import fs from 'fs'

import pkg from '../package.json' assert { type: 'json' }

const nanoid = customAlphabet('1234567890abcdefhijklmnopqrstuvwxyz', 7)
const newId = nanoid()
const prefix = 'userlatency-'

const generateFileName = fileName => `${prefix}${newId}${fileName}`

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
  esmodules: [generateFileName('.js')],
  styles: [generateFileName('.css')],
  packs: [],
  languages: [
    { lang: 'en', name: 'English', path: 'lang/en.json' },
    { lang: 'es', name: 'Español', path: 'lang/es.json' },
    { lang: 'fr', name: 'Français', path: 'lang/fr.json' },
    { lang: 'zh-CH', name: '英语', path: 'lang/zh-CH.json' },
    { lang: 'zh-TW', name: '正體中文', path: 'lang/zh-TW.json' },
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
  maximumCoreVersion: 11,
  compatibleCoreVersion: 11,
  compatibility: {
    minimum: '10',
    verified: '11',
  },
}

const renameFiles = [
  { src: 'dist/index.js', dest: `dist/${generateFileName('.js')}` },
  { src: 'dist/index.js.map', dest: `dist/${generateFileName('.js.map')}` },
  { src: 'dist/index.css', dest: `dist/${generateFileName('.css')}` },
  { src: 'dist/index.css.map', dest: `dist/${generateFileName('.css.map')}` },
]

setTimeout(() => {
  renameFiles.forEach(({ src, dest }) => {
    fs.renameSync(src, dest)
  })
}, 1000)

fs.writeFileSync('dist/module.json', JSON.stringify(data, null, 2))
