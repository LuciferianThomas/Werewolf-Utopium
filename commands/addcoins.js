const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
  name: "addcoins",
  run: async (client, message, args, shared) => {    
    let player = await fn.wuAddcoins(message.author.id, 100)
    message.channel.send(player.id)
  }
}