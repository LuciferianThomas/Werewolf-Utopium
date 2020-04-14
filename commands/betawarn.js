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
    
    let prompt = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("GOLD")
        .setTitle(`Please wait...`)
        .setDescription("Getting information...")
    )
    
    let green = await betamsg.reactions.cache.find(r => r.emoji.name == "green_tick").users.fetch()
    let gray = await betamsg.reactions.cache.find(r => r.emoji.name == "gray_tick").users.fetch()
    let pingMembers = green.concat(gray).filter(u => u.id !== client.user.id).map(user => message.guild.members.cache.get(user.id))
    let warnRole = fn.getRole(message.guild, "βTest Warn")
    
    if (!pingMembers.length)
      return await prompt.edit(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`Prompt cancelled.`)
          .setDescription(`There isn't anyone to ping for [this announcement message](${betamsg.id})!`)
      )
    
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
    prompt.reactions.removeAll()
    
    await prompt.edit(
      new Discord.MessageEmbed()
        .setColor("GOLD")
        .setTitle(`Please wait...`)
        .setDescription("Giving the Warn role to the βTesters...")
    )
    for (var member of pingMembers)
      await member.roles.add(warnRole)
    
    let βtest_announcements = message.guild.channels.cache.find(
      c => c.name == "βtest-announcements"
    )
    
    // await warnRole.setMentionable(true, "βTest Announcement").catch(() => {})
    await client.channels.cache
      .get("676642370954985501")
      .send(`${warnRole}`, {
        embed: new Discord.MessageEmbed()
                 .setColor(warnRole.color)
                 .setTitle("βTesting Session")
                 .setDescription(`A [βTesting Session](${betamsg.url}) is starting right now.${args[1] ? ` The βTest game code is \`${args[1]}\`.` : ""}`),
        allowedMentions: { roles: [warnRole.id] }
      })
    // await warnRole.setMentionable(false, "βTest Announcement").catch(() => {})
    await prompt.edit(
      new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle(`Announcement has been sent.`)
        .setDescription(`Check ${βtest_announcements}!`)
    )
    
    for (var member of pingMembers)
      member.roles.remove(warnRole)
  }
}