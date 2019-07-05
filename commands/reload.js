const Discord = require('discord.js');

module.exports = {
  name: "reload",
  usage: "reload",
  aliases: ["restart"],
  description: "Reloads commands and functions of the bot.",
  category: "Bot Staff",
  botStaffOnly: true,
  run: async (client, message, args, shared) => {
    let embed = new Discord.RichEmbed()
      .setColor(shared.embedColor)
      .setTitle("Reloading commands and functions...")
    
    message.channel.send(embed).then(() => {
      console.log("[INFO] Reloading...")
      process.exit(2)
    })
  }
}