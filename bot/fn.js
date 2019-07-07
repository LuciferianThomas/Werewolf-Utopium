const Discord = require("discord.js")
const moment = require("moment")

const { defaultPrefix, embedColor } = require('./config.js'),
      { client } = require('../index.js')

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
      .setDescription(content)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    message.channel.send(embed).catch(e => {
      message.channel.send(`${content}\n\n*I need the \`Embed Links\` permission!`).catch(er => {
        message.author.send(embed).then(message.author.send("*I need the `Send Messages` and `Embed Links` permissions!*")).catch(console.error)
      })
    })
  } else {
    throw Error('Invalid output type.\nAccepts Discord.RichEmbed, Object or String.')
  }
  return undefined
}

let getUser = (data) => {
  if (data instanceof Discord.User) return data
  if (data instanceof Discord.GuildMember) return data.user
  if (data instanceof Discord.Message) return data.author
  if (typeof data == "string") return client.users.find(user => user.id == data || user.tag.toLowerCase() == data.toLowerCase())
  throw Error('Cannot find user.')
}

let getMember = (guild, data) => {
  if (data instanceof Discord.User) return guild.members.get(data.id)
  if (data instanceof Discord.GuildMember) return data
  if (data instanceof Discord.Message) return data.member
  if (typeof data == "string") return guild.members.find(member => member.user.id == data || member.user.tag.toLowerCase() == data.toLowerCase())
  throw Error('Cannot find member.')
}

let modCase = (type, member, moderator, reason) => {
  this.type = type.toUpperCase()
  this.user = member.user.id
  this.moderator = moderator.id
  this.reason = reason
  this.time = moment()
}

let modCaseEmbed = (modCase) => {
  if (modCase instanceof modCase) {
    getUser()
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setAuthor()
  }
  throw Error("Passed an invalid modCase")
}

module.exports = {
  date: date,
  send: send,
  getUser: getUser,
  getMember: getMember,
  modCase: modCase
}