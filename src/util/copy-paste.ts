import { copy as realCopy, paste as realPaste } from 'mini-copy'
import { logger } from './logger'


export const copy = async (content: string, fakeClipboard?: string) => realCopy(content, { logger, fakeClipboard })
export const paste = async (fakeClipboard?: string) => realPaste({ logger, fakeClipboard })
