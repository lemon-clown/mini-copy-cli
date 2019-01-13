import { ColorfulChalkLogger, DEBUG } from 'colorful-chalk-logger'


export const logger: ColorfulChalkLogger = new ColorfulChalkLogger('mcp', {
  colorful: true,
  inline: true,
  date: true,
}, process.argv)
