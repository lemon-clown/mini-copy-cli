import fs from 'fs-extra'
import { logger } from '@/util/logger'
import { yesOrNo } from '@/util/cli-util'
import { copy, paste } from '@/util/copy-paste'
import { ensureFileExist, isFile } from '@/util/fs-util'


/**
 * copy the data from file
 * @param filepath    the input file path
 * @param encoding    the file's encoding
 * @param showMessage
 * @param fakeClipboard
 */
export async function copyFromFile(filepath: string, encoding: string, showMessage: boolean, fakeClipboard?: string) {
  await ensureFileExist(filepath)
  const content: string = await fs.readFile(filepath, { encoding })
  await copy(content, fakeClipboard)
  if (showMessage) logger.info(`copied from ${ filepath }.`)
}


/**
 * copy data from stdin to the system clipboard
 * @param encoding      the content's encoding
 * @param showMessage
 * @param fakeClipboard
 */
export async function copyFromStdin(encoding: string, showMessage: boolean, fakeClipboard?: string) {
  const content: string = await new Promise<string>(resolve => {
    let ret: string = ''
    const stdin = process.stdin

    if (stdin.isTTY) return resolve(ret)
    stdin
      .setEncoding(encoding)
      .on('readable', () => {
        for (let chunk; (chunk = stdin.read()) != null;) ret += chunk
      })
      .on('end', () => {
        resolve(ret.replace(/^([^]*?)(?:\r\n|\n\r|[\n\r])$/, '$1'))
      })
  })
  await copy(content, fakeClipboard)
  if (showMessage) logger.info(`copied into system clipboard.`)
}


/**
 * copy the data from system clipboard into file
 * @param filepath      the output file path
 * @param encoding      the file's encoding
 * @param force         if the file has existed, whether if to cover it without confirmation
 * @param showMessage
 * @param fakeClipboard
 */
export async function pasteToFile(filepath: string,
                                  encoding: string,
                                  force: boolean,
                                  showMessage: boolean,
                                  fakeClipboard?: string) {
  if (fs.existsSync(filepath)) {
    if (!await isFile(filepath)) {
      if (showMessage) logger.error(`${filepath} is not a file.`)
      process.exit(-1)
    }

    // the filepath is exists, wait for user's confirmation to overwrite it.
    if (!force) {
      const flag: boolean = await yesOrNo(`overwrite ${filepath}`)
      if (!flag) return
    }
  }

  const content: string = await paste(fakeClipboard)
  await fs.writeFile(filepath, content, { encoding })
  if (showMessage) logger.info(`pasted into ${filepath}.`)
  return
}


/**
 *
 * @param encoding
 * @param forcePaste
 * @param fakeClipboard
 */
export async function pasteToStdout(encoding: string, forcePaste: boolean, fakeClipboard?: string) {
  const content: string = await paste(fakeClipboard) || ''
  await new Promise(resolve => process.stdout.write(content, encoding, resolve))
}
