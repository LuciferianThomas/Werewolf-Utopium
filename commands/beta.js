const Discord = require('discord.js'),
      fn = require('')

module.exports = {
  name: "beta",
  run: async (client, message, args, shared) => {
    let time = fn.time(args.join(' '))
    if (time == "Invalid date")
      return await message.channel.send("")
  }
}