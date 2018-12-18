import iconv from 'iconv-lite'
import clipboardy from 'clipboardy'
import { exec } from 'child_process'
import { logger } from '@/util/logger'


/**
 * process the data from system clipboard
 * @param encoding        the content's preferred encoding
 * @param lineSeparator   the system's line separator
 * @param content         the content from system clipboard
 */
function processContent(encoding: string, lineSeparator: string, content: string): string {
  if (content == null) content = ''
  content = content.replace(/\r\n|\r|\n/g, lineSeparator)
  return iconv.decode(iconv.encode(content, encoding), encoding)
}


/**
 * get the data from system clipboard
 * @param pasteCommandPath  the path where the system call is located
 * @param encoding          the content's preferred encoding
 * @param lineSeparator     the system's line separator
 */
export async function paste(pasteCommandPath: string,
                            encoding: string,
                            lineSeparator: string): Promise<string> {
  if (pasteCommandPath != null) {
    const cmd = `${ pasteCommandPath } -Command Get-Clipboard`
    logger.debug(`try: ${ cmd }`)
    try {
      let content: string | any = await new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error != null) return reject(error)
          if (stderr != null && stderr != '') return reject(stderr)
          resolve(stdout.slice(0, -2))
        })
      })
      return processContent(encoding, lineSeparator, content)
    } catch (error) {
      logger.debug(error)
    }
  }
  const content: string = clipboardy.readSync()
  return processContent(encoding, lineSeparator, content)
}
