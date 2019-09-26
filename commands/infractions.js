const Discord = require('discord.js'),
      db = require("quick.db"),
      moment = require("moment")

const modCases = new db.table("MODCASES")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
  name: "infractions",
  usage: "infractions <user>",
  description: "View bad records of a member.",
  aliases: ["warns", "warnings"],
  category: "Moderation",
  run: async (client, message, args, shared) => {
    let target = message.member
    if (args[0]) target = fn.getMember(message.guild, args[0])
    if ([`<@${client.user.id}> `,`<@!${client.user.id}> `].includes(shared.prefix) && message.mentions.members.first().user.id == client.user.id) target = message.mentions.members.first(2)[1]
    else if (message.mentions.members.size) target = message.mentions.members.first()
    let user = target.user
    
    let cases = modCases.get(message.guild.id).filter(c => c.active)
    if (!cases || cases.length == 0) return await message.channel.send(fn.embed(client, `${target} has no infractions yet!`))
    cases = cases.filter(thisCase => thisCase.user == user.id && !thisCase.type.includes("UN"))
    if (!cases || cases.length == 0) return await message.channel.send(fn.embed(client, `${target} has no infractions yet!`))
    
    return await message.channel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor(user.tag, message.guild.iconURL)
        .setThumbnail(user.displayAvatarURL)
        .addField("Last 24 Hours", cases.filter(c => moment() < moment(c.time) + 1000*60*60*24).length, true)
        .addField("Last 7 Days", cases.filter(c => moment() < moment(c.time) + 1000*60*60*24*7).length, true)
        .addField("Total", cases.length, true)
        .addField("Warnings", cases.filter(c => c.type == "WARN").length, true)
        .addField("Mutes", cases.filter(c => c.type == "MUTE").length, true)
        .addField("Kicks", cases.filter(c => c.type == "KICK").length, true)
        .addField("Bans", cases.filter(c => c.type == "BAN").length, true)
        .addField("Last 10 Records", cases.splice(-10, 10).map(c => `#${c.id} **[${c.type}] ${c.reason}** (${fn.ago(c.time)})`).join("\n"))
        .setTimestamp()
    )
  }
}