import fs from 'fs-extra'
import program from 'commander'
import { logger } from '@/util/logger'
import { copy } from '@/util/copy-paste'
import { doneWithClose } from '@/util/cli-util'
import { copyFromFile, copyFromStdin, pasteToFile, pasteToStdout } from './handler'
import manifest from '../package.json'


interface CmdOption {
  encoding?: string
  output?: string
  input?: string
  force?: boolean
  forcePaste?: boolean
  silence?: boolean
  content?: string
  cat?: string          // 打印文件的内容
  fake?: string         // fake-clipboard 使用的临时文件路径
}


program
  .version(manifest.version)
  .arguments('[content]')

logger.registerToCommander(program)

program
  .option('-e, --encoding <encoding>', 'specified <filepath>\'s encoding')
  .option('-i, --input <filepath>', 'copy the data from the <filepath> to the system clipboard.')
  .option('-o, --output <filepath>', 'output the data from the system clipboard into <filepath>.')
  .option('-f, --force', 'overwrite the <filepath> without confirmation.')
  .option('-s, --silence', 'don\'t print info-level log.')
  .option('--force-paste', 'force paste the content of the system clipboard without copy even piped data.')
  .option('--cat <filepath>', 'output file content without extra new line break.')
  .option('--fake [fake-file-path]', 'use fake clipboard if the system clipboard is inaccessible.')
  .parse(process.argv)


doneWithClose(async (sourceContent: string, option: CmdOption) => {
  const {
    encoding = 'UTF-8',
    input,
    output,
    force = false,
    silence = false,
    forcePaste = false,
    cat,
    fake,
  } = option


  logger.debug('cat:', cat)
  logger.debug('fake:', fake)
  logger.debug('encoding:', encoding)
  logger.debug('input:', input)
  logger.debug('output:', output)
  logger.debug('force:', force)
  logger.debug('silence:', silence)
  logger.debug('forcePaste:', forcePaste)
  logger.debug('sourceContent:', sourceContent)

  if (cat != null) {
    let content = await fs.readFileSync(cat, 'utf-8')
    if (/(?:\r\n|\n\r)$/.test(content)) content = content.slice(0, -2)
    else if (/[\r\n]$/.test(content)) content = content.slice(0, -1)
    await new Promise(resolve => process.stdout.write(content, encoding, resolve))
    process.exit(-1)
  }

  // if filepath is not exist, print the content of the system clipboard to the terminal
  // thanks to https://github.com/sindresorhus/clipboard-cli
  if (sourceContent == null) {
    if (process.stdin.isTTY || process.env.STDIN === '0' || forcePaste) {
      // paste to file
      if (output != null) {
        logger.debug(`paste to ${output}.`)
        await pasteToFile(output, encoding, force, !silence, fake)
        return
      }

      if (forcePaste) {
        // paste to stdout
        logger.debug(`paste to stdout.`)
        await pasteToStdout(encoding, forcePaste, fake)
        return
      }

      // copy from file
      if (input != null) {
        logger.debug(`copy from ${input}.`)
        await copyFromFile(input, encoding, !silence, fake)
        return
      }

      // paste to stdout
      logger.debug(`paste to stdout.`)
      await pasteToStdout(encoding, forcePaste, fake)
      return
    }

    // copy data from stdin
    logger.debug(`copy from stdin.`)
    await copyFromStdin(encoding, !silence, fake)
    return
  }

  // copy from sourceContent
  logger.debug(`copy from argument.`)
  await copy(sourceContent, fake)
  if (!silence) logger.info(`copied into system clipboard.`)
})(program.args[0], program)
  .catch(error => {
    logger.debug(error)
    process.exit(-1)
  })
