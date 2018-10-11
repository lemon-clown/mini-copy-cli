import fs from 'fs-extra'
import path from 'path'
import env from './env'


const appDirectory = fs.realpathSync(process.cwd())
const resolvePath = (...relativePath: string[]) => path.resolve(appDirectory, ...relativePath)


export default {
  appRoot: appDirectory,
  appSrc: resolvePath('src'),
  appMain: resolvePath('src', 'main.ts'),
  appTarget: resolvePath('target'),
  appManifest: resolvePath('package.json'),
  appNodeModules: resolvePath('node_modules'),
  appExternals: getExternals(),
}


function getExternals() {
  return Object
    .getOwnPropertyNames(env.manifest.dependencies)
    .reduce((externals: any, key: string) => {
      externals[key] = `commonjs ${key}`
      return externals
    }, {})
}
