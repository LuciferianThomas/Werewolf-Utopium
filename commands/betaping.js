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
    let x = await client.guilds.cache.get("522638136635817986").channels.cache.get("676642370954985501").messages.fetch(args[0])
    if(!x) return await message.channel.send("Unable to find that announcement")
    let embed = new Discord.MessageEmbed().setTitle("Beta Test Pings").setDescription("").setColor(0xE4B400)
    let reactions = []
    x.reactions.cache.forEach(r => {
      if(!r.me) return
      reactions.push(r.emoji)
      embed.description += `${r.emoji} - ${r.count} people\n`
    })
    let m = await message.channel.send(embed)
    await reactions.forEach(e => m.react(e))
  }
}