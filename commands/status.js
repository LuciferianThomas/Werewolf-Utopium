const Discord = require('discord.js')

module.exports = {
  name: "status",
  usage: "status",
  description: "Obtain bot status.",
  category: "Utility",
  botStaffOnly: false,
  run: async (client, message, args, shared) => {
    
    let m = await message.channel.send("Pinging...")
    
    let botLatency = m.createdTimestamp - message.createdTimestamp,
        ping = client.ping,
        memory = process.memoryUsage().heapUsed / (1024 * 1024)
    
  }
}