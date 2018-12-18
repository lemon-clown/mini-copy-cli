import program from 'commander'
import { copy } from '@/util/clipboard'
import { doneWithClose } from '@/util/cli-util'
import { logger } from '@/util/logger'
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
}


program
  .version(manifest.version)
  .arguments('[content]')
  .option('--log-level <level>', 'index logger\'s level.')
  .option('--log-option <option>', 'index logger\' option. (date,colorful)')
  .option('-e, --encoding <encoding>', 'specified <filepath>\'s encoding')
  .option('-i, --input <filepath>', 'copy the data from the <filepath> to the system clipboard.')
  .option('-o, --output <filepath>', 'output the data from the system clipboard into <filepath>.')
  .option('-f, --force', 'overwrite the <filepath> without confirmation.')
  .option('-s, --silence', 'don\'t print info-level log.')
  .option('--force-paste', 'force paste the content of the system clipboard without copy even piped data.')
  .parse(process.argv)


doneWithClose(async (sourceContent: string, option: CmdOption) => {
  const {
    encoding = 'UTF-8',
    input,
    output,
    force = false,
    silence = false,
    forcePaste = false,
  } = option


  logger.debug('encoding:', encoding)
  logger.debug('input:', input)
  logger.debug('output:', output)
  logger.debug('force:', force)
  logger.debug('silence:', silence)
  logger.debug('forcePaste:', forcePaste)
  logger.debug('sourceContent:', sourceContent)

  // if filepath is not exist, print the content of the system clipboard to the terminal
  // thanks to https://github.com/sindresorhus/clipboard-cli
  if (sourceContent == null) {
    if (process.stdin.isTTY || process.env.STDIN === '0' || forcePaste) {
      // paste to file
      if (output != null) {
        logger.debug(`paste to ${output}.`)
        await pasteToFile(output, encoding, force, !silence)
        return
      }

      if (forcePaste) {
        // paste to stdout
        logger.debug(`paste to stdout.`)
        await pasteToStdout(encoding, forcePaste)
        return
      }

      // copy from file
      if (input != null) {
        logger.debug(`paste to ${input}.`)
        await copyFromFile(input, encoding, !silence)
      }

      // paste to stdout
      logger.debug(`paste to stdout.`)
      await pasteToStdout(encoding, forcePaste)
      return
    }

    // copy data from stdin
    logger.debug(`copy from stdin.`)
    await copyFromStdin(encoding, !silence)
    return
  }

  // copy from sourceContent
  logger.debug(`copy from argument.`)
  await copy(sourceContent)
})(program.args[0], program)
  .catch(error => {
    logger.debug(error)
    process.exit(-1)
  })
