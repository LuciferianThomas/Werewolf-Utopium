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
    
    let prompt = await message.channel.send("Please wait...")
    
    let green = await betamsg.reactions.cache.find(r => r.emoji.name == "green_tick").users.fetch()
    let gray = await betamsg.reactions.cache.find(r => r.emoji.name == "gray_tick").users.fetch()
    let pingMembers = green.concat(gray).filter(u => u.id !== client.user.id).map(user => message.guild.members.cache.get(user.id))
    let warnRole = fn.getRole(message.guild, "βTest Warn")
    
    if (!pingMembers.length)
      return await prompt.edit("There is no one to warn for this announcement!")
    
    await prompt.edit(
      new Discord.MessageEmbed()
        .setTitle("Comfirmation")
        .setDescription(
          `The following ${pingMembers.length} βTester${
            pingMembers.length == 1 ? "" : "s"
          } will be mentioned:\n${pingMembers.map(x => `${x}`).join(", ")}.`
        )
    )
    await prompt.react(fn.getEmoji(client, "green_tick"))
    let pReactions = await prompt
      .awaitReactions(
        (r, u) =>
          r.emoji.id == client.emojis.cache.find(e => e.name == "green_tick").id &&
          u.id == message.author.id,
        { max: 1, time: 10000, errors: ["time"] }
      )
      .catch(() => {})
    if (!pReactions)
      return await prompt
        .edit(new Discord.MessageEmbed().setColor("RED").setTitle("Prompt cancelled."))
        .then(m => m.reactions.removeAll().catch(() => {}))
    
    for (var member of pingMembers)
      await member.roles.add(warnRole)
    
    await warnRole.setMentionable(true, "βTest Announcement").catch(() => {})
    await client.channels.cache.get("676642370954985501").send(`${warnRole}`, {allowedMentions: {roles: [warnRole.id]}})
    await warnRole.setMentionable(true, "βTest Announcement").catch(() => {})
    
    for (var member of pingMembers)
      member.roles.remove(warnRole)
    
    // let reactions = betamsg.reactions.cache.filter(r => ["green_tick","gray_tick"].includes(r.emoji.name))
    // let users = reactions.map(r => r.users.fetch())
    // for (var user of users) await user
    // console.log(users.map(u => u.map(u => u.id)).flat(Infinity))
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