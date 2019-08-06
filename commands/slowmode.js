const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "slowmode",
  usage: "slowmode <seconds> [reason]",
  description: "Set channel slowmode.",
  category: "Moderation",
  guildPerms: ["MANAGE_CHANNELS"],
  run: async (client, message, args, shared) => {
		let time = parseInt(args[0]), reason = args.slice(1).join(" ") || ""
    reason =+ `\nSet by ${message.member.displayName} (${message.author.tag})`
    
    message.channel.setRateLimitPerUser(time, reason).then(() => {
      message.channel.send(fn.embed(client, `Slowmode set to ${}`))
    })
  }
}