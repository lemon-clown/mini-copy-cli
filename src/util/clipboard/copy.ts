import clipboardy from 'clipboardy'
import { exec } from 'child_process'
import { logger } from '@/util/logger'


/**
 * copy data to system clipboard
 * @param copyCommandPath   the path where the system call is located
 * @param content           the data coping to system clipboard
 */
// @ts-ignore
export async function copy(copyCommandPath: string, content: string) {
  content = content.replace(/\r\n|\n\r|[\n\r]$/, '')
  if (copyCommandPath != null) {
    const cmd = `${ copyCommandPath }`
    logger.debug(`try: ${ cmd }`)
    try {
      await new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error != null) return reject(error)
          if (stderr != null && stderr != '') return reject(stderr)
          resolve(stdout)
        })
          .stdin
          .end(content)
      })
      return
    } catch (error) {
      logger.debug(error)
    }
  }

  logger.debug('try: clipboardy')
  clipboardy.writeSync(content)
}
