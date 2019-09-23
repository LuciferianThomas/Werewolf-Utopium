const Discord = require('discord.js')

const config = require('/app/util/config.js'),
      fn = require('/app/util/fn.js')

module.exports = {
  name: "echo",
  usage: "echo <message>",
  description: "Commands information.",
  aliases: ["embed", "rawembed"],
  category: "Utility",
  run: async (client, message, args, shared) => {
    var content = message.content.slice(shared.prefix.length + shared.commandName.length).trim()

    if (!content) return message.channel.send(fn.embed(client, "I cannot echo an empty message."))
    
    var embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setDescription(content)
      .setFooter(client.user.username, client.user.avatarURL)
    
    if (shared.commandName != "rawembed" || !shared.user.botStaff) embed.setAuthor(message.author.tag, message.author.displayAvatarURL)

    message.channel.send(embed)
      .catch(error => {
        message.channel.send(fn.error(client, `I couldn't make your embed!`, error))
      })
  }
}