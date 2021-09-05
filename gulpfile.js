const gulp = require('gulp')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const archiver = require('archiver')
const rollup = require('rollup')
const postcss = require('rollup-plugin-postcss')

const rollupTypescript = require('@rollup/plugin-typescript')
const { terser } = require('rollup-plugin-terser')
const { customAlphabet, urlAlphabet } = require('nanoid')

const PACKAGE_JSON_ROOT = path.join(__dirname, 'package.json')
const CONFIG_ROOT = path.join(__dirname, 'foundryconfig.json')
const MANIFEST_ROOT = path.join(__dirname, 'src', 'module.json')

const packageJson = require(PACKAGE_JSON_ROOT)
const config = require(CONFIG_ROOT)
const manifest = require(MANIFEST_ROOT)

const rand = () => Math.floor(Math.random() * (14 - 7 + 1) + 7)
const nanoid = customAlphabet(urlAlphabet, rand())
const id = nanoid().replace(/[-|_]/gi, '42')
const packageId = `logger-${id}.js`
const cssId = `logger-${id}.css`

const bundler = () =>
  rollup
    .rollup({
      input: './src/index.ts',
      plugins: [
        rollupTypescript(),
        postcss({
          config: { minimize: true, extensions: ['.scss'] },
          extract: path.resolve(`dist/${cssId}`),
        }),
        terser(),
      ],
    })
    .then(bundle =>
      bundle.write({
        file: `./dist/${packageId}`,
        format: 'umd',
        name: 'library',
        sourcemap: true,
      })
    )

const packageBuild = async () =>
  new Promise((resolve, reject) => {
    try {
      const zipFile = fs.createWriteStream(path.join(__dirname, 'module.zip'))
      const zip = archiver('zip', { zlib: { level: 9 } })

      zipFile.on('close', () => {
        console.log(chalk.green(`${zip.pointer()} total bytes`))
        console.log(chalk.green(`Zip file package.json has been written`))
        return resolve()
      })

      zip.on('error', err => {
        throw err
      })

      zip.pipe(zipFile)
      zip.directory('dist/', manifest.name)
      zip.finalize()
    } catch (err) {
      return reject(err)
    }
  })

const updateManifest = cb => {
  if (!config) {
    cb(Error(chalk.red('foundryconfig.json not found')))
    return
  } else if (!manifest) {
    cb(Error(chalk.red('Manifest JSON not found')))
    return
  } else if (!config.url) {
    cb(Error(chalk.red('Repository URLs not configured in foundryconfig.json')))
    return
  }

  manifest.esmodules = [packageId]
  manifest.styles = [cssId]
  manifest.version = packageJson.version
  manifest.url = config.url
  manifest.manifest = config.manifest
  manifest.download = `${config.downloadURL}/v${packageJson.version}/module.zip`
  manifest.readme = config.readme
  manifest.bugs = config.bugs
  manifest.changelog = config.changelog
  manifest.compatibleCoreVersion = config.compatibleCoreVersion

  try {
    const manifestOut = JSON.stringify(manifest, null, 2)

    fs.writeFileSync(MANIFEST_ROOT, manifestOut, 'utf8')
    fs.outputFileSync('./dist/module.json', manifestOut)
    return cb()
  } catch (err) {
    cb(err)
  }
}

const copyLang = cb => {
  try {
    fs.copySync(path.join(__dirname, 'src', 'lang'), path.join(__dirname, 'dist', 'lang'))

    return cb()
  } catch (err) {
    cb(err)
  }
}

exports.build = gulp.series(updateManifest, copyLang, bundler)
exports.package = packageBuild
