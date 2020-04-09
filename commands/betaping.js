const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')


module.exports = {
  name: "betaping",
  run: async (client, message, args, shared) => {
    message.delete().catch(()=>{})
    if(!args[0]) return message.channel.send("Please specify an announcement message!")
    let x = client.guilds.get(channels.cache.get("676642370954985501").messages.cache.get(args[0])
    if(!x) return await message.channel.send("Unable to find that announcement")
    let embed = new Discord.MessageEmbed().setTitle("Beta Test Pings")
    x.reactions.cache.forEach(r => {
      if(!r.me) return
      embed.description += `${r.emoji} - ${r.count} people`
    })
    message.author.send(embed)
  }
}