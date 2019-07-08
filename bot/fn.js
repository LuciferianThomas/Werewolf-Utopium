const Discord = require("discord.js")
const moment = require("moment")

const { defaultPrefix, embedColor } = require('./config.js')

let date = (date = moment()) => {
  return moment(date).format("Y MMM D HH:mm [GMT]")
}

let embed = (client, content) => {
  if (content instanceof Object) {
    let { title, description } = content
    return new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(description)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
  } else if (typeof content == "string") {
    return new Discord.RichEmbed()
      .setColor(embedColor)
      .setDescription(content)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
  } else {
    throw Error('Invalid content type.\nAccepts Object or String.')
  }
  return undefined
}

let error = (client, message, error) => {
  return new Discord.RichEmbed()
    .setColor(embedColor)
    .setTitle(message)
    .setDescription(`${error}`)
    .setFooter(client.user.username, client.user.avatarURL)
    .setTimestamp()
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

function ModCase (client, id, type, member, moderator, reason, tmlength) {
  this.id = parseInt(id)
  this.type = type.toUpperCase()
  this.user = getUser(client, member).id
  this.moderator = getUser(client, moderator).id
  this.reason = reason
  this.time = moment()
  if (tmlength) this.tmlength = tmlength
  this.active = true
}

let modCaseEmbed = (client, thisCase) => {
  if (thisCase instanceof ModCase) {
    let user = getUser(client, thisCase.user)
    let moderator = getUser(client, thisCase.moderator)
    
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setAuthor(`[${thisCase.type}] ${user.tag}`, user.displayAvatarURL)
      .addField("User", user, true)
      .addField("Moderator", moderator, true)
    if (thisCase.tmlength) embed.addField("Length", `${thisCase.tmlength/1000/60} minute${thisCase.tmlength/1000/60 == 1 ? "" : "s"}`, true)
    embed.addField("Reason", thisCase.reason)
      .setFooter(`Case #${thisCase.id}`, client.user.avatarURL)
      .setTimestamp(moment(thisCase.time))
    
    return embed
  }
  else throw Error("Passed an invalid modCase!")
}

module.exports = {
  date: date,
  embed: embed,
  getUser: getUser,
  getMember: getMember,
  ModCase: ModCase,
  modCaseEmbed: modCaseEmbed,
}