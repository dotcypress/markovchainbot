const { Composer, optional, acl } = require('micro-bot')
const fetch = require('node-fetch')
const Markov = require('markov-strings')

const options = { minWords: 7, minScore: 15 }
const bot = new Composer()
let generator

bot.on('document', acl(process.env.ADMIN_USERNAME, async (ctx) => {
  await ctx.reply('Loading sentences...')
  const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id)
  try {
    const sentences = await fetch(fileLink).then((res) => res.text())
    const chain = new Markov(sentences.split('\n'), options)
    await chain.buildCorpus()
    await ctx.reply('Loading complete')
    generator = chain
  } catch (err) {
    await ctx.reply('☹️')
  }
}))

bot.on('text', optional(() => generator, async (ctx) => {
  const sentence = await generator.generateSentence()
  await ctx.reply(sentence.string)
}))

module.exports = bot
