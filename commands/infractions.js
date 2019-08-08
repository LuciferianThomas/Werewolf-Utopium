const Discord = require('discord.js'),
      db = require("quick.db")

const modCases = new db.table("MODCASES")

const fn = require('/app/bot/fn.js')

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
    
    let cases = modCases.get(message.guild.id).filter(thisCase => thisCase.user == target.user.id && !thisCase.type.includes("UN"))
    
    if (!cases || cases.length == 0) return await message.channel.send(fn.embed(client, `${target} has no infractions yet!`))
    
    
  }
}