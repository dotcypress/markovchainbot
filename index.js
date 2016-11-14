const { Composer, optional, log } = require('micro-bot')

const fetch = require('node-fetch')
const Markov = require('markov-strings')

const options = {
  minWords: 5,
  minScore: 10
}

let generator
const bot = new Composer()

bot.on('text', async (ctx) => {
  if (!generator) {
    return
  }
  const sentence = await generator.generateSentence()
  await ctx.reply(sentence.string)
})

bot.on('document', optional((ctx) => ctx.from.id == process.env.ADMIN_ID && ctx.message.document.mime_type === 'text/plain', async (ctx) => {
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

module.exports = bot
