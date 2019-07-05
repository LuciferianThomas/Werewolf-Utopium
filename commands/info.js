const Discord = require('discord.js')
const db = require('quick.db')
const userData = new db.table("USERDATA")

let botStaff = userData.all().filter(i => JSON.parse(i.data).botStaff).map(i => i.tag)

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
      .addField("Name", client.user.username, true)
      .addField("Prefix", `Default: \`${shared.defaultPrefix}\`\nMention: ${client.user}\nServer: ${shared.guild.prefix}`, true)
      .addField("Developer", botStaff, true)
      .addField("Created", shared.date(client.user.createdAt), true)
      .addField("Servers", client.guilds.size, true)
      .addField("Users", client.users.size, true)
      .addField("Memory Used", `${memory}MB`)
    
  }
}