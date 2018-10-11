import chalk from 'chalk'
import readline from 'readline'


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})


/**
 * launch a question in command line, and get the the user's input (one line).
 *
 * @param desc          question's description
 * @param clearConsole  whether if clear this lines (prepare for reprinting.)
 * @return user's answer.
 */
export const question = async (desc: string, clearConsole?: boolean): Promise<string> => {
  return await new Promise<string>(resolve => {
    rl.question(desc, (answer: string) => {
      if (clearConsole) {
        // clear this lines in terminal, prepare for reprinting.
        const lineCnt: number = desc.split('\n').length + answer.split('\n').length
        readline.cursorTo(process.stdout, 0)
        readline.clearLine(process.stdout, 0)
        for (let i=1; i < lineCnt; ++i) {
          readline.moveCursor(process.stdout, 0, -1)
          readline.clearLine(process.stdout, 0)
        }
      }
      resolve(answer)
    })
  })
}


/**
 * launch a question in command line, and get the the user's answer (true/false).
 *
 * @param desc          question's description
 * @param defaultValue  the default value when user enter blank characters
 * @return true/false
 */
export const yesOrNo = async (desc: string, defaultValue: boolean = false): Promise<boolean> => {
  desc = chalk.white(`${desc}? (y/n) `)
  const answer: string = await question(desc, true)
  const flag: boolean = /^\s*(y|n|yes|no)\s*$/i.test(answer)? answer[0].toLowerCase() === 'y': defaultValue
  console.log(desc + chalk.green(flag? 'yes': 'no'))
  return flag
}


/**
 * exit process when completed all processing.
 * @param fn
 */
export const doneWithClose = (fn: (...args: any[]) => Promise<void>) => (...args: any[]) => {
  (async () => {
    await fn(...args)
    rl.close()
    process.exit(0)
  })()
}


/**
 * close stream resources manually.
 */
export const closeStream = () => rl.close()
