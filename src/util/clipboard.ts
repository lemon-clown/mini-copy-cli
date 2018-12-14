import fs from 'fs'
import chalk from 'chalk'
import iconv from 'iconv-lite'
import { exec } from 'child_process'
import clipboardy from 'clipboardy'


const powerShellCommandPath: string = [
  '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
  '/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
].filter(p => fs.existsSync(p))[0]


const clipCommandPath: string = [
  '/mnt/c/Windows/System32/clip.exe',
  '/c/Windows/System32/clip.exe',
  'C:\\Windows\\System32\\clip.exe',
].filter(p => fs.existsSync(p))[0]



const encoding: string = (() => {
  switch (process.platform) {
    case 'win32': return 'gbk'
    default: return 'utf-8'
  }
})()


/**
 * copy content to system clipboard
 * @param content
 */
export async function copy(content: string) {
  content = content.replace(/\r\n|\n\r|[\n\r]$/, '')
  if (clipCommandPath != null) {
    let succeed: boolean = false
    await new Promise((resolve, reject) => {
      const cmd = `${ clipCommandPath }`
      exec(cmd, (error, stdout, stderr) => {
        if (error != null) return reject(error)
        if (stderr != null && stderr != '') return reject(stderr)
        resolve(stdout)
      })
        .stdin
        .end(content)
    })
      .then(() => succeed = true)
      .catch(e => {})
    if (succeed) return
  }

  clipboardy.writeSync(content)
}


/**
 * paste content from system clipboard
 */
export async function paste(): Promise<string> {
  if (powerShellCommandPath != null) {
    let succeed: boolean = false
    const content: string | any = await new Promise((resolve, reject) => {
      const cmd = `${ powerShellCommandPath } -Command Get-Clipboard`
      exec(cmd, (error, stdout, stderr) => {
        if (error != null) return reject(error)
        if (stderr != null && stderr != '') return reject(stderr)
        resolve(stdout.slice(0, -2))
      })
    })
      .then(content => {
        succeed = true
        return content
      })
      .catch(e => {})
      // .catch(e => console.log(`try powershell: ${ powerShellCommandPath } + ${chalk.red(e)}`))
      if (succeed) return iconv.decode(iconv.encode(content, encoding), encoding)
  }
  const content: string = clipboardy.readSync()
  return iconv.decode(iconv.encode(content, encoding), encoding)
}

