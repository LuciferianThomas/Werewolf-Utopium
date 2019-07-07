const Discord = require("discord.js")
const moment = require("moment")

const { defaultPrefix, embedColor } = require('./config.js')

let date = (date = moment()) => {
  return moment(date).format("Y MMM D HH:mm [GMT]")
}

let send = (content, config) => {
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
    Error('Invalid output type.\nAccepts Discord.RichEmbed, Object or String.')
  }
  return undefined
}

let resolveUser = (data) => {
  if (data instanceof Discord.User) return data
  if (data instanceof Discord.GuildMember) return data.user
  if (data instanceof Discord.Message) return data.author
}

module.exports = {
  date: date,
  send: send,
}