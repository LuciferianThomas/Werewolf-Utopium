const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
  name: "ping",
  aliases: ["pong", "whomstdve", "status"],
  run: async (client, message, args, shared) => {    
    let m = await message.channel.send("Pinging...")
    
    let botLatency = Math.abs(m.createdTimestamp - message.createdTimestamp),
        ping = client.ping,
        memory = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)
    
    let embed = new Discord.RichEmbed()
      .setTitle(`Bot Status`)
      .setThumbnail(client.user.avatarURL)
      .addField("Bot Latency", `${botLatency}ms`, true)
      .addField("Ping", `${Math.round(ping)}ms`, true)
      .addField("Memory Used", `${memory}MB`, true)
    
    m.delete()
    message.channel.send(embed)
  }
}