const Discord = require('discord.js');

const fn = require('/app/bot/fn.js')

module.exports = {
  name: "reload",
  usage: "reload",
  aliases: ["restart"],
  description: "Reloads commands and functions of the bot.",
  category: "Bot Staff",
  botStaffOnly: true,
  run: async (client, message, args, shared) => {
    message.channel.send(fn.embed(client, {title: "Reloading commands and functions...", description: `${client.user.username} is now reloading. Please wait.`})).then(() => {
      setTimeout(() => {
        process.exit(2)
      }, 100)
    })
  }
}