const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "mention",
  usage: "mention <role1> [role2...]",
  description: "Mention roles.",
  category: "Utility",
  guildPerms: ["MANAGE_ROLES"],
  run: async (client, message, args, shared) => {
		let roles = []

		for (let i = 0; i < args.length; i++) {
      let role = fn.getRole(message.guild, args[i])
      if (!role) {
        message.channel.send(fn.embed(client, `${args[i]} is not a role!`))
      }
      roles.push(role)
    }

		for (let i = 0; i < args.length; i++) await roles[i].setMentionable(true).catch(error => {})

		await message.channel.send(`${roles.map(r => `${r}`).join(' ')}`)

		for (let i = 0; i < args.length; i++) await roles[i].setMentionable(false).catch(error => {})
  }
}