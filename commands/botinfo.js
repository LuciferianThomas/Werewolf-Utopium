const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
  name: "status",
  usage: "status",
  description: "Bot information.",
  aliases: ["botstatus", "botinfo", "links", "invite"],
  category: "Utility",
  run: async (client, message, args, shared) => {        
    let embed = new Discord.RichEmbed()
      .setColor(shared.embedColor)
      .setTitle(`${client.user.username} | Information`)
      .setThumbnail(client.user.avatarURL)
      .addField("Name", client.user.username, true)
      .addField("Prefix", "`w!`", true)
      .addField("Created", `${fn.utcTime(client.user.createdAt)}\n${fn.ago(client.user.createdAt)}`, true)
      .addField("Servers", client.guilds.size, true)
      .addField("Users", client.users.size, true)
      .addField("Library", "discord.js", true)
      .addField("ID", client.user.id)
    
    message.channel.send(embed)
  }
}