import fs from 'fs-extra'
import chalk from 'chalk'
import program from 'commander'
import clipboard from 'clipboardy'
import { doneWithClose, yesOrNo } from '@/util/cli-util'
import { ensureFileExist, isFile } from '@/util/fs-util'
import manifest from '../package.json'


interface CmdOption {
  encoding?: string
  output?: boolean
  force?: boolean
}


program
  .version(manifest.version)
  .arguments('[filepath]')
  .option('-e, --encoding <encoding>', 'specified <filepath>\'s encoding')
  .option('-o, --output', 'output the content from the system clipboard into <filepath>.')
  .option('-f, --force', 'overwrite the <filepath> without confirmation.')
  .parse(process.argv)


doneWithClose(async (filepath: string, option: CmdOption) => {
  // if filepath is not exist, print the content of the system clipboard to the terminal
  if (filepath == null) {
    const content: string = await clipboard.read()
    process.stdout.write(content)
    return
  }

  const { encoding = 'UTF-8', output = false, force = false } = option

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
      content = await clipboard.read()
    } catch (e) {
      console.log(chalk.magenta('read the system clipboard failed.'))
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
    await clipboard.write(content)
    console.log(chalk.green(`copied from ${filepath}.`))
  } catch (e) {
    console.log(chalk.magenta('write into the system clipboard failed.'))
    process.exit(-1)
  }
})(program.args[0], program)
