import fs from 'fs'
import { copy as realCopy } from '@/util/clipboard/copy'
import { paste as realPaste } from '@/util/clipboard/paste'


const copyCommandPath: string = [
  '/mnt/c/Windows/System32/clip.exe',
  '/c/Windows/System32/clip.exe',
  'C:\\Windows\\System32\\clip.exe',
].filter(p => fs.existsSync(p))[0]


const pasteCommandPath: string = [
  '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
  '/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
].filter(p => fs.existsSync(p))[0]


const encoding: string = (() => {
  switch (process.platform) {
    case 'win32': return 'gbk'
    default: return 'utf-8'
  }
})()


const lineSeparator: string = (() => {
  switch (process.platform) {
    case 'win32': return '\r\n'
    default: return '\n'
  }
})()


export const copy = async (content: string) => realCopy(copyCommandPath, content)
export const paste = async (): Promise<string> => realPaste(pasteCommandPath, encoding, lineSeparator)
