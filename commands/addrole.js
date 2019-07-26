const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "addrole",
  usage: "addrole <user> <role>",
  description: "Give role to users.",
  category: "Moderation",
  guildPerms: ["MANAGE_ROLES"],
  run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please mention the user you want to give a role to."))
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to give a role to."))
    
    if (!args[1]) return message.channel.send(fn.embed(client, "Please mention the role you want to give."))
		let role = message.mentions.roles.filter(role => role.name != "@everyone").first()
    if (!role) role = fn.getRole(message.guild, args[1])
    if (!role) return message.channel.send(fn.embed(client, "Please mention the role you want to give."))
    
    target.addRole(role).then(() => {
      message.channel.send(
      )
    }).catch(error => {
      message.channel.send(fn.error(client, `I cannot give ${role.name} to ${target.user.tag}!`, error))
    })
    
  }
}