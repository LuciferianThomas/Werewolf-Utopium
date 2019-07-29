const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "purge",
	usage: "purge <amount>",
	description: "Purge messages.",
  category: "Moderation",
  aliases: ["clear"],
  guildPerms: ["MANAGE_MESSAGES"],
	run: async (client, message, args, shared) => {
		let amount = parseInt(args[0])
    if (!amount) return message.channel.send(fn.embed(client, "Please mention the number of messages to remove."))
    
    message.delete().catch(error => {})
    message.channel.bulkDelete(amount).then(deleted => {
      message.channel.send(fn.embed(client, `Successfully purged ${deleted.size} messages from ${message.channel}.`)).then(m => setTimeout(m.delete, 5*1000))
    }).catch(error => {
      message.channel.send(fn.error(client, `I was unable to give ${muteRole} to ${target}!`))
    })
    
    return undefined
	}
}