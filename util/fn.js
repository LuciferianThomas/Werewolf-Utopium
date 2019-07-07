const Discord = require("discord.js")
const moment = require("moment")

let date = async (date = moment()) => {
  return moment(date).format("D MMM Y HH:mm [GMT]")
}

let send = async (content, config) => {
  let { client, message } = config
  if (content instanceof Discord.RichEmbed) {
    message.channel.send(content).catch(e => {
      message.author.send(content).then(message.author.send("*I need the `Embed Links` permission!*"))
        .catch(er => {
          message.channel.send("I need the `Embed Links` permission!").catch(console.error)
        })
    })
  } else if (content instanceof Object) {
    let { title, description } = content
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(description)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    message.channel.send(embed).catch(e => {
      message.channel.send(`**${title}**\n${description}\n\n*I need the \`Embed Links\` permission!`).catch(er => {
        message.author.send(embed).then(message.author.send("*I need the `Send Messages` and `Embed Links` permissions!*")).catch(console.error)
      })
    })
  } else if (typeof content == "string") {
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(content)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    message.channel.send(embed).catch(e => {
      message.channel.send(`${content}\n\n*I need the \`Embed Links\` permission!`).catch(er => {
        message.author.send(embed).then(message.author.send("*I need the `Send Messages` and `Embed Links` permissions!*")).catch(console.error)
      })
    })
  } else {
    // Error('Invalid output type.\nAccepts Discord.RichEmbed, Object or String.')
  }
  return undefined
}

module.exports = {
  
}