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
    let embed = new Discord.MessageEmbed().setTitle("βTesting Session Pings").setDescription("").setColor(0xE4B400)
    x.reactions.cache.forEach(r => {
      console.log(r.users.cache.map(u => `<@${u.id}>`))
      if(!r.me) return
      embed.description += `${r.emoji} - ${r.count} people\n`
    })
    embed.description += `\n\nPlease select Green or Gray to ping those people, or Red to cancel`
    let m = await message.channel.send(embed)
    await m.react(fn.getEmoji(client, "green_tick"))
    await m.react(fn.getEmoji(client, "gray_tick"))
    await m.react(fn.getEmoji(client, "red_tick"))
    let reactions = await m.awaitReactions(
      (r, u) =>
      (r.emoji.id == fn.getEmoji(client, "green_tick").id ||
       r.emoji.id == fn.getEmoji(client, "gray_tick").id ||
       r.emoji.id == fn.getEmoji(client, "red_tick").id) &&
      u.id == message.author.id,
      { time: 30*1000, max: 1, errors: ['time'] }
    ).catch(() => {})
    if (!reactions || reactions.first().emoji.id == fn.getEmoji(client, "red_tick").id)
      m.reactions.removeAll().catch(() => {})
      m.edit(
        new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Pinging canceled.")
      )
    let reaction = reactions.first().emoji
    m.reactions.removeAll().catch(() => {})
    let pings = ""
    x.reactions.cache.forEach(r => {
        if(r.emoji === reaction) pings = r.users.cache.map(u => `<@${u.id}>`)
    })
    m.edit(new Discord.MessageEmbed().setTitle("βTesting Session Pings").setDescription(`Please confirm you would like to ping these people:\n\n${pings}`).setColor(0xE4B400))
    
    //client.guilds.cache.get("522638136635817986").channels.cache.get("676642370954985501").send("")
  }
}