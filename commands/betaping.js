const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')


module.exports = {
  name: "betawarn",
  aliases: ["betaping"],
  run: async (client, message, args, shared) => {
    if (message.guild.id !== "522638136635817986") return;
    if (!message.member.roles.cache.find(r =>
        ["βTester Helper", "Developer"].includes(r.name)
    )) return;
    
    if (!args[0]) return message.channel.send("Please specify an announcement message!")
    let betamsg = await client.guilds.cache.get("522638136635817986").channels.cache.get("676642370954985501").messages.fetch(args[0])
    if (!betamsg) return await message.channel.send("Unable to find that announcement.")
    
    // console.log(betamsg.reactions.cache)
    let reactions = betamsg.reactions.cache.filter(r => r.me)
    console.log(reactions.first().users)
    console.log(reactions.map(r => r.users.cache))
    // console.log(reactions.map(r => r.users.cache.map(u => u.id)).flat(Infinity).filter(u => u.id !== client.user.id))
    // let embed = new Discord.MessageEmbed()
    //   .setTitle("βTesting Session Pings")
    //   .setDescription("")
    //   .setColor(0xe4b400)
    // betamsg.reactions.cache.forEach(r => {
    //   if(!r.me) return
    //   embed.description += `${r.emoji} - ${r.count - 1} ${(r.count - 1) === 1 ? "person" : "people"}\n`
    // })
    // embed.description += `\n\nPlease confirm if these are the people who you want to `
    // let m = await message.channel.send(embed)
    // await m.react(fn.getEmoji(client, "green_tick"))
    // await m.react(fn.getEmoji(client, "gray_tick"))
    // await m.react(fn.getEmoji(client, "red_tick"))
    // let reactions = await m.awaitReactions(
    //   (r, u) =>
    //   (r.emoji.id == fn.getEmoji(client, "green_tick").id ||
    //    r.emoji.id == fn.getEmoji(client, "gray_tick").id ||
    //    r.emoji.id == fn.getEmoji(client, "red_tick").id) &&
    //   u.id == message.author.id,
    //   { time: 30*1000, max: 1, errors: ['time'] }
    // ).catch(() => {})
    // m.reactions.removeAll().catch(() => {})
    // if (!reactions || reactions.first().emoji.id == fn.getEmoji(client, "red_tick").id){
    //   return m.edit(
    //     new Discord.MessageEmbed()
    //     .setColor("RED")
    //     .setTitle("Pinging canceled.")
    //   )
    // }
    // let reaction = reactions.first().emoji
    // let pings = ""
    // x.reactions.cache.forEach(r => {
    //   let u = r.users.fetch().then(u => {
    //   console.log(u)
    //   if(r.emoji === reaction) u.forEach(user => pings += `<@${user.id}>\n`)
    //   })
    // })
    // m.edit(new Discord.MessageEmbed().setTitle("βTesting Session Pings").setDescription(`Please confirm you would like to ping these people:\n\n${pings}`).setColor(0xE4B400))
    
    //client.guilds.cache.get("522638136635817986").channels.cache.get("676642370954985501").send("")
  }
}