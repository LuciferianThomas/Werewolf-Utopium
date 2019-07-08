const Discord = require("discord.js")
const moment = require("moment")

const { defaultPrefix, embedColor } = require('./config.js')

let date = (date = moment()) => {
  return moment(date).format("Y MMM D HH:mm [GMT]")
}

let send = async (client, message, content) => {
  if (!(message instanceof Discord.Message)) throw Error('Invalid message.')
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
    throw Error('Invalid content type.\nAccepts Discord.RichEmbed, Object or String.')
  }
  return undefined
}

let dm = async (client, user, content) => {
  if (user instanceof Discord.GuildMember) user = user.user
  if (!(user instanceof Discord.User)) throw Error('Invalid user.')
  if (content instanceof Discord.RichEmbed) {
    user.send(content).catch()
  } else if (content instanceof Object) {
    let { title, description } = content
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(description)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    user.send(embed).catch()
  } else if (typeof content == "string") {
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setDescription(content)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    return user.send(embed).catch()
  } else {
    throw Error('Invalid content type.\nAccepts Discord.RichEmbed, Object or String.')
  return undefined
  }
}

let getUser = (client, data) => {
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

let modCase = (id, type, member, moderator, reason) => {
  this.id = parseInt(id)
  this.type = type.toUpperCase()
  this.user = getUser(member).id
  this.moderator = getUser(moderator).id
  this.reason = reason
  this.time = moment()
}

let modCaseEmbed = (client, modCase) => {
  if (modCase instanceof modCase) {
    let user = getUser(modCase.user)
    let moderator = getUser(modCase.moderator)
    
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setAuthor(`[${modCase.type}] ${user.tag}`, user.displayAvatarURL)
      .addField("User", user, true)
      .addField("Moderator", moderator, true)
      .addField("Reason", modCase.reason)
      .setFooter(`Case #${modCase.id}`, client.user.avatarURL)
    
    return embed
  }
  throw Error("Passed an invalid modCase!")
}

module.exports = {
  date: date,
  send: send,
  dm: dm,
  getUser: getUser,
  getMember: getMember,
  modCase: modCase
}