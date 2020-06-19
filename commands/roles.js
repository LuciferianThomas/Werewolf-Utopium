const Discord = require('discord.js')

module.exports = {
  name: "roles",
  run: async (client, message, args, shared) => {
    await message.channel.send(`All Roles in Werewolf Utopium:\nhttps://werewolf-utopium.tk/roles`)
  }
}
