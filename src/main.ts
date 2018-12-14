import fs from 'fs-extra'
import chalk from 'chalk'
import program from 'commander'
import { copy, paste } from '@/util/clipboard'
import { ensureFileExist, isFile } from '@/util/fs-util'
import { closeStream, doneWithClose, yesOrNo } from '@/util/cli-util'
import manifest from '../package.json'


interface CmdOption {
  encoding?: string
  output?: boolean
  force?: boolean
  forcePaste: boolean
}


program
  .version(manifest.version)
  .arguments('[filepath]')
  .option('-e, --encoding <encoding>', 'specified <filepath>\'s encoding')
  .option('-o, --output', 'output the content from the system clipboard into <filepath>.')
  .option('-f, --force', 'overwrite the <filepath> without confirmation.')
  .option('--force-paste')
  .parse(process.argv)


doneWithClose(async (filepath: string, option: CmdOption) => {
  const { encoding = 'UTF-8', output = false, force = false, forcePaste = false } = option

  // if filepath is not exist, print the content of the system clipboard to the terminal
  // thanks to https://github.com/sindresorhus/clipboard-cli
  if (filepath == null) {
    // close stream, otherwise the terminal will echo content from stdin
    closeStream()
    if (process.stdin.isTTY || process.env.STDIN === '0' || forcePaste) {
      try {
        const content: string = await paste()
        process.stdout.write(content, encoding)
      } catch (e) {
        console.log(chalk.magenta('read the system clipboard failed.'))
        console.log(chalk.red(e))
        process.exit(-1)
      }
    } else {
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
            resolve(ret)
          })
      })
      try {
        await copy(content)
        console.log(chalk.green(`copied into system clipboard.`))
      } catch (e) {
        console.log(chalk.magenta('write into the system clipboard failed.'))
        console.log(chalk.red(e))
        process.exit(-1)
      }
    }
    return
  }

  // if the option 'output' is specified, then output to filepath
  if (output) {
    if (fs.existsSync(filepath)) {
      if (!await isFile(filepath)) {
        console.log(chalk.magenta(`${filepath} is not a file.`))
        process.exit(-1)
      }

      // the filepath is exists, wait for user's confirmation to overwrite it.
      if (!force) {
        const flag: boolean = await yesOrNo(`overwrite ${filepath}`)
        if (!flag) return
      }
    }

    let content: string = ''
    try {
      content = await paste()
    } catch (e) {
      console.log(chalk.magenta('read the system clipboard failed.'))
      console.log(chalk.red(e))
      process.exit(-1)
    }
    await fs.writeFile(filepath, content, { encoding })
    console.log(chalk.green(`pasted into ${filepath}.`))
    return
  }

  // copy the content from filepath to the system clipboard.
  await ensureFileExist(filepath)
  const content: string = await fs.readFile(filepath, { encoding })
  try {
    await copy(content)
    console.log(chalk.green(`copied from ${filepath}.`))
  } catch (e) {
    console.log(chalk.magenta('write into the system clipboard failed.'))
    console.log(chalk.red(e))
    process.exit(-1)
  }
})(program.args[0], program)
