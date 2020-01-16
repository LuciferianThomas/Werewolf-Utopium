const Discord = require('discord.js')

const gamemodes = ["quick"/*, "ranked", "sandbox"*/]

module.exports = {
  name: "joingame",
  aliases: ["join","jg"],
  run: async (client, message, args, shared) => {
    let gamemode = args[0].toLowerCase()
    if (!gamemodes.includes(gamemode))
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle(`\`${args[0]}\` is not a valid game mode!`)
          .addField(
            "List of valid game modes",
            gamemodes.map(g => `\`${g}\``).join(", ")
          )
      )
    
    require(`./${gamemode}`)(client, message, args, shared)
  }
}