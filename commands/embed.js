const Discord = require('discord.js')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = {
  name: "embed",
  usage: "embed [color] <message>",
  description: "Commands information.",
  category: "Utility",
  botStaffOnly: false,
  run: async (client, message, args, shared) => {
    var color = args.shift().toLowerCase()
    var content = message.content.slice(shared.prefix.length + 5).trim()

    if (!rawcontent) return message.channel.send(fn.embed(client, "You cannot embed an empty message."))

    if ( !content && color.length == 6 &&
       ( (color[0] >= "0" && color[0] <= "9") || (color[0] >= "a" && color[0] <= "f") ) && ( (color[1] >= "0" && color[1] <= "9") || (color[1] >= "a" && color[1] <= "f") ) &&
       ( (color[2] >= "0" && color[2] <= "9") || (color[2] >= "a" && color[2] <= "f") ) && ( (color[3] >= "0" && color[3] <= "9") || (color[3] >= "a" && color[3] <= "f") ) &&
       ( (color[4] >= "0" && color[4] <= "9") || (color[4] >= "a" && color[4] <= "f") ) && ( (color[5] >= "0" && color[5] <= "9") || (color[5] >= "a" && color[5] <= "f") ) ) {

      return message.channel.send(fn.embed(client, "You cannot embed an empty message."))

    } 
    
    if ( color.length == 6 &&
       ( (color[0] >= "0" && color[0] <= "9") || (color[0] >= "a" && color[0] <= "f") ) && ( (color[1] >= "0" && color[1] <= "9") || (color[1] >= "a" && color[1] <= "f") ) &&
       ( (color[2] >= "0" && color[2] <= "9") || (color[2] >= "a" && color[2] <= "f") ) && ( (color[3] >= "0" && color[3] <= "9") || (color[3] >= "a" && color[3] <= "f") ) &&
       ( (color[4] >= "0" && color[4] <= "9") || (color[4] >= "a" && color[4] <= "f") ) && ( (color[5] >= "0" && color[5] <= "9") || (color[5] >= "a" && color[5] <= "f") ) ) {

      color = parseInt(`0x${color}`)
      var embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(color)
        .setDescription(content)
        .setFooter(client.user.username, client.user.avatarURL)
      
      message.channel.send(embed)
        .catch(error => {
          message.channel.send(fn.error(client, `I couldn't make your embed!`, error))
        })
      
    } else {
      var embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor()
        .setDescription(rawcontent)
        .setFooter(client.user.username, client.user.avatarURL)
      
      message.channel.send(embed)
        .catch(error => {
          message.channel.send(fn.error(client, `I couldn't make your embed!`, error))
        })
    }
  }
}