const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/home/sd/utopium/spyfall/util/config'),
      fn = require('/home/sd/utopium/spyfall/util/fn')

module.exports = {
  name: "nick",
  run: async (client, message, args, shared) => {    
    let nick = await fn.wuNick(message.author.id)
    await message.channel.send(`Your Werewolf Utopium nickname is ${nick}`)
  }
}