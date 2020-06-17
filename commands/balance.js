const Discord = require('discord.js')

const gamemodes = ["quick", "custom"/*, "ranked", "sandbox"*/]

module.exports = {
  name: "balance",
  aliases: ["bal"],
  run: async (client, message, args, shared) => {
    message.content = `w!coins balance${` ${args.join(' ')}`}`
    require('./coins.js').run(client, message, undefined, Object.assign(shared, {commandName: "coins"}))
  }
}