const Discord = require('discord.js')

const gamemodes = ["quick", "custom"/*, "ranked"*/, "sandbox"]

module.exports = {
  name: "joingame",
  aliases: ["join","jg"],
  run: async (client, message, args, shared) => {
    if (!args[0]) return await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Missing Arguments")
        .setDescription(
          "`w!joingame <gamemode>`"
        )
    )
    let gamemode = args[0].toLowerCase()
    if (!gamemodes.includes(gamemode))
      return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`\`${args[0]}\` is not a valid game mode!`)
          .addField(
            "List of valid game modes",
            "`quick`,`sandbox`,`custom`"
          )
      )
    
    if (gamemode !== "custom") require(`./${gamemode}`).run(client, message, args, shared)
    else require(`./custom`).run(client, Object.assign(message, {content: `w!custom join${args[1] ? ` ${args[1]}` : ""}`}), undefined, Object.assign(shared, {commandName: "custom"}))
  }
}