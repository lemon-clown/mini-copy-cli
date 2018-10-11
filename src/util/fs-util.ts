import fs from 'fs-extra'
import chalk from 'chalk'


/**
 * check whether p is a file path.
 *
 * @param p   file path
 * @return a boolean value whether p is a file path or not.
 */
export async function isFile(p: string | null): Promise<boolean> {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  let stat = await fs.stat(p)
  return stat.isFile()
}


/**
 * check whether p is exist
 *
 * @param p
 * @param message
 */
export const ensureFileExist = async (p: string | null, message?: string) => {
  if (p == null) {
    console.error(chalk.magenta(message == null? 'the path is null.': message))
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    console.error(chalk.magenta(message == null? `${p} is not found.`: message))
    process.exit(-1)
  }
    if (await isFile(p)) return
    console.error(chalk.magenta(message == null? `${p} is not a file.`: message))
    process.exit(-1)
}
