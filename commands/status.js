const Discord = require('discord.js')

module.exports = {
  name: "info",
  usage: "info",
  description: "Bot information.",
  category: "Utility",
  botStaffOnly: false,
  run: async (client, message, args, shared) => {
    
    let m = await message.channel.send("Pinging...")
    
    let botLatency = m.createdTimestamp - message.createdTimestamp,
        ping = client.ping,
        memory = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)
    
    let embed = new Discord.RichEmbed()
      .setColor(shared.embedColor)
      .setTitle(`${client.user.username} | Information`)
      .setThumbnail(client.user.avatarURL)
      .addField("Name", client.user.username, )
    
  }
}