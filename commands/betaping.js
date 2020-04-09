const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')


module.exports = {
  name: "betaping",
  run: async (client, message, args, shared) => {
    message.delete()
    if(!args[0]) return message.channel.send("Please specify an announcement message!")
    let x = client.channels.cache.get("676642370954985501").messages.fetch(args[0])
    let g = fn.getEmoji(client, "green_tick")
    let b = fn.getEmoji(client, "gray_tick")
    let r = fn.getEmoji(client, "red_tick")
    let green = x.reactions.cache.get(g.id)
    let gray = x.reactions.cache.get(g.id)
    let red = x.reactions.cache.get(g.id)
    let embed = new Discord.MessageEmbed().setTitle("Beta Test Pings")
    .setDescription("")
  }
}