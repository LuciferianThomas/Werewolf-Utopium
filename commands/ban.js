const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require("/home/utopium/wwou/util/fn.js")

module.exports = {
  name: "ban",
  aliases: ["blacklist","bl"],
  run: async (client, message, args) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "Moderator",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    let target
    if (!args[0]) target = message.author
    else if (message.mentions.users.size) target = message.mentions.users.first()
    if (!target && args[0]) 
      target = fn.getUser(
        client, 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")) ? 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")).ID : args[0]
      )
    if (args[0] && !target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} User \`${args[0]}\` not found.`)
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    
    let player = players.get(target.id)
    if (!player)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    
    if (
      client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(target.id) &&
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(target.id)
        .roles.cache.find(r =>
          [
            "*",
            "βTester Helper",
            "Mini Moderator",
            "Moderator",
            "Bot Helper",
            "Developer",
            "Staff"
          ].includes(r.name)
        )
    )
      return await message.channel.send("Excuse me. What are you trying to do?")
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    if (reason == "Unspecified") return await message.channel.send("You must provide a valid reason to ban a player!")
    
    let reasonPrompt = await message.author.send("Please input the")
    let reasonInput = await reasonPrompt.channel
      .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
      .catch(() => {})
    if (!reasonInput)
      return await message.author.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("Prompt timed out.")
      )
    reasonInput = reasonInput.first().content
    
    let durationPrompt = await message.author.send(
      new Discord.MessageEmbed()
        .setTitle("Custom Game Setup")
        .setDescription(
          `Select a join code for your game.`
        )
    )
    let durationInput = await durationPrompt.channel
      .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
      .catch(() => {})
    if (!durationInput)
      return await message.author.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("Prompt timed out.")
      )
    durationInput = durationInput.first().content
//     let prompt = await message.author.send(
//       new Discord.MessageEmbed()
//         .setColor("GOLD")
//         .setDescription(
//           `You are about to blacklist **${nicknames.get(player.id)}**${
//             duration ? ` for **${days}d ${hours}h ${mins}m**` : ""
//           } for the following reason: **${reason}**. Proceed?`
//         )
//     )
//     await prompt.react(fn.getEmoji(client, "green_tick"))
//     let reactions = await prompt.awaitReactions(
//       (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
//                 u.id == message.author.id,
//       { max: 1, time: 10000, errors: ["time"] }
//     ).catch(() => {})
//     if (!reactions) return await message.author.send("Prompt cancelled.")
    
//     players.set(`${target.id}.banned`, {
//       reason: reason,
//       until: duration ? moment().add(duration, "m") : moment().add(100, "y")
//     })
//     message.channel.send(
//       `${target} (${nicknames.get(
//         player.id
//       )}) has been blacklisted${
//         duration ? ` for **${days}d ${hours}h ${mins}m**` : ""
//       } for the following reason: **${reason}**.`
//     )
//     target.send(
//       `You have been blacklisted by ${message.author} (${nicknames.get(
//         message.author.id
//       )})${
//         duration ? ` for **${days}d ${hours}h ${mins}m**` : ""
//       } for the following reason: **${reason}**.\n` +
//       `**Please be reminded that blacklist evasions will result in a permanent full ban.**`
//     ).catch(e => {})
    
//     let embed = new Discord.MessageEmbed()
//       .setColor(0x7289da)
//       .setTitle(`Blacklist`)
//       .setThumbnail(target.avatarURL())
//       .addField("Player", `${target} (${nicknames.get(target.id)})`, true)
//       .addField(
//         "Blacklisted by",
//         `${message.author} (${nicknames.get(message.author.id)})`, true
//       )
    
//     if (duration) embed.setFooter("Blaclist expires", moment(players.get(`${target.id}.banned.until`)))
//     else embed.setFooter("Permanently blaklisteded")
    
//     client.channels.cache.get("714774959402254376").send(embed)
  }
}
