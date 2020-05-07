const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
  name: "ping",
  aliases: ["pong", "whomstdve", "status", "poing"],
  run: async (client, message, args, shared) => {    
    let nick = await fn.wuNick(message.author.id)
    await message.channel.send(`Your Werewolf Utopium nickname is ${nick}`)
  }
}