const gulp = require('gulp')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const archiver = require('archiver')
const typescript = require('typescript')
const ts = require('gulp-typescript')

const PACKAGE_JSON_ROOT = path.join(__dirname, 'package.json')
const CONFIG_ROOT = path.join(__dirname, 'foundryconfig.json')
const MANIFEST_ROOT = path.join(__dirname, 'src', 'module.json')

const packageJson = require(PACKAGE_JSON_ROOT)
const config = require(CONFIG_ROOT)
const manifest = require(MANIFEST_ROOT)

function createTransformer() {
  function shouldMutateModuleSpecifier(node) {
    if (!typescript.isImportDeclaration(node) && !typescript.isExportDeclaration(node)) return false
    if (node.moduleSpecifier === undefined) return false
    if (!typescript.isStringLiteral(node.moduleSpecifier)) return false
    if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../'))
      return false
    if (path.extname(node.moduleSpecifier.text) !== '') return false
    return true
  }

  function importTransformer(context) {
    return node => {
      function visitor(node) {
        if (shouldMutateModuleSpecifier(node)) {
          if (typescript.isImportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`)
            return typescript.updateImportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.importClause,
              newModuleSpecifier
            )
          } else if (typescript.isExportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`)
            return typescript.updateExportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.exportClause,
              newModuleSpecifier
            )
          }
        }
        return typescript.visitEachChild(node, visitor, context)
      }
      return typescript.visitNode(node, visitor)
    }
  }
  return importTransformer
}

const tsConfig = ts.createProject('tsconfig.json', {
  getCustomTransformers: _program => ({
    after: [createTransformer()],
  }),
})

const buildTS = () => gulp.src('src/**/*.ts').pipe(tsConfig()).pipe(gulp.dest('dist'))

async function copyFiles() {
  const statics = ['module.json']

  try {
    for (const file of statics) {
      if (fs.existsSync(path.join('src', file))) {
        await fs.copy(path.join('src', file), path.join('dist', file))
      }
    }
    return Promise.resolve()
  } catch (err) {
    Promise.reject(err)
  }
}

const packageBuild = async () =>
  new Promise((resolve, reject) => {
    try {
      const zipFile = fs.createWriteStream(path.join(__dirname, 'package.zip'))
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

  manifest.version = packageJson.version
  manifest.url = config.url
  manifest.manifest = config.manifest
  manifest.download = `${config.downloadURL}/v${packageJson.version}/package.zip`
  manifest.readme = config.readme
  manifest.bugs = config.bugs
  manifest.changelog = config.changelog
  manifest.compatibleCoreVersion = config.compatibleCoreVersion

  try {
    const manifestOut = JSON.stringify(manifest, null, 2)

    fs.writeFileSync(MANIFEST_ROOT, manifestOut, 'utf8')
    return cb()
  } catch (err) {
    cb(err)
  }
}

exports.build = gulp.series(updateManifest, buildTS, copyFiles)
exports.package = packageBuild
