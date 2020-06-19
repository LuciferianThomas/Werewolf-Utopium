const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/home/sd/wwou/util/config.js'),
      fn = require('/home/sd/wwou/util/fn.js')

module.exports = {
  name: "botinfo",
  run: async (client, message, args, shared) => {        
    let embed = new Discord.MessageEmbed()
      .setColor(shared.embedColor)
      .setTitle(`${client.user.username} | Information`)
      .setThumbnail(client.user.avatarURL)
      .addField("Name", client.user.username, true)
      .addField("Prefix", "`w!`", true)
      .addField("Created", `${fn.utcTime(client.user.createdAt)}\n${fn.ago(client.user.createdAt)}`, true)
      .addField("Servers", client.guilds.size, true)
      .addField("Users", client.users.cache.size, true)
      .addField("Library", "discord.js", true)
      .addField("ID", client.user.id)
    
    message.channel.send(embed)
  }
}