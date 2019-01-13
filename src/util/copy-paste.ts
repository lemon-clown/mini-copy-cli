import { copy as realCopy, paste as realPaste } from 'mini-copy'
import { logger } from './logger'


export const copy = async (content: string) => realCopy(content, { logger })
export const paste = async () => realPaste({ logger })
