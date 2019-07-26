const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "removerole",
  usage: "removerole <user> <role>",
  description: "Remove role from users.",
  category: "Moderation",
  aliases: ["delrole"],
  guildPerms: ["MANAGE_ROLES"],
  run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please mention the user you want to remove a role from."))
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to remove a role from."))
    
    if (!args[1]) return message.channel.send(fn.embed(client, "Please mention the role you want to remove."))
		let role = message.mentions.roles.filter(role => role.name != "@everyone").first()
    if (!role) role = fn.getRole(message.guild, args[1])
    if (!role) return message.channel.send(fn.embed(client, "Please mention the role you want to remove."))
    
    target.removeRole(role).then(() => {
      message.channel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setTitle("Remove Role Success")
          .setThumbnail(target.user.displayAvatarURL)
          .addField(target.user.bot ? "Bot" : "User", `${target}`, true)
          .addField("Role", `${role}`, true)
          .setFooter(client.user.username, client.user.avatarURL)
      )
    }).catch(error => {
      message.channel.send(fn.error(client, `I cannot remove ${role.name} from ${target.user.tag}!`, error))
    })
  }
}