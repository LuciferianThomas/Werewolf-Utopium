const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "giverole",
  usage: "giverole <user> <role>",
  description: "Give role to users.",
  category: "Moderation",
  aliases: ["addrole"],
  guildPerms: ["MANAGE_ROLES"],
  run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please mention the user you want to give a role to."))
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to give a role to."))
    
    if (!args[1]) return message.channel.send(fn.embed(client, "Please mention the role you want to give."))
		let role = message.mentions.roles.filter(role => role.name != "@everyone").first()
    if (!role) role = fn.getRole(message.guild, args.slice(1).join(" "))
    if (!role) return message.channel.send(fn.embed(client, "Please mention the role you want to give."))
    
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send(fn.embed(client, "I do not have permissions to give roles."))
    if (role.position >= message.guild.me.highestRole.position) return message.channel.send(fn.embed(client, "I do not have permissions to give this role."))
    
    target.addRole(role).then(() => {
      message.channel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setTitle("Give Role Success")
          .setThumbnail(target.user.displayAvatarURL)
          .addField(target.user.bot ? "Bot" : "User", `${target}`, true)
          .addField("Role", `${role}`, true)
          .setFooter(client.user.username, client.user.avatarURL)
      )
    }).catch(error => {
      message.channel.send(fn.error(client, `I cannot give ${role.name} to ${target.user.tag}!`, error))
    })
  }
}