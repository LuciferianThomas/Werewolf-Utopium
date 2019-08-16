const Discord = require("discord.js")
const moment = require("moment")

const { defaultPrefix, embedColor } = require('./config.js')

let time = (date = moment()) => {
  return moment(date).format("YYYY/MM/DD HH:mm:ss")
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

let getRole = (guild, data) => {
  if (data instanceof Discord.Role) return data
  if (typeof data == "string") return guild.roles.find(role => role.id == data || role.name.toLowerCase().startsWith(data.toLowerCase()))
  throw Error('Cannot find role.')
}

function ModCase (client, id, type, member, moderator, reason, period) {
  this.id = parseInt(id)
  this.type = type.toUpperCase()
  this.user = getUser(client, member).id
  this.moderator = getUser(client, moderator).id
  this.reason = reason
  this.time = moment()
  this.period = period
  this.active = true
}

let modCaseEmbed = (client, thisCase) => {  
  // if (!(thisCase instanceof ModCase)) throw Error('Passed an invalid ModCase.')
  
  let user = getUser(client, thisCase.user)
  let moderator = getUser(client, thisCase.moderator)

  let embed = new Discord.RichEmbed()
    .setColor(embedColor)
    .setAuthor(`[${thisCase.type}] ${user.tag}`, user.displayAvatarURL)
    .addField(user.bot ? "Bot" : "User", user, true)
    .addField("Moderator", moderator, true)
  if (thisCase.period) embed.addField("Period", `${thisCase.period/1000/60} minute${thisCase.period/1000/60 == 1 ? "" : "s"}`, true)
  embed.addField("Reason", thisCase.reason)
    .setFooter(`Case #${thisCase.id}`, client.user.avatarURL)
    .setTimestamp(moment(thisCase.time))

  return embed
}

let paginator = async (author, msg, embeds, pageNow) => {
  msg.awaitReactions((reaction, user) => {
    if (reaction.emoji.name == "◀" && user.id == author) {
      msg.channel.send(embeds[Math.max(pageNow-1, 0)])
        .then(m => {
          msg.delete()
          paginator(author, m, embeds, Math.max(pageNow-1, 0))
        })
    } else if (reaction.emoji.name == "▶" && user.id == author) {
      msg.channel.send(embeds[Math.min(pageNow+1, embeds.length-1)])
        .then(m => {
          msg.delete()
          paginator(author, m, embeds, Math.min(pageNow+1, embeds.length-1))
        })
    } else if (reaction.emoji.name == "⏪" && user.id == author) {
      msg.channel.send(embeds[0])
        .then(m => {
          msg.delete()
          paginator(author, m, embeds, 0)
        })
    } else if (reaction.emoji.name == "⏩" && user.id == author) {
      msg.channel.send(embeds[embeds.length-1])
        .then(m => {
          msg.delete()
          paginator(author, m, embeds, embeds.length-1)
        })
    } else return false
  }, {time: 30*1000})
  await msg.react("⏪")
  await msg.react("◀")
  await msg.react("▶")
  await msg.react("⏩")
}

module.exports = {
  time: time,
  date: time,
  embed: embed,
  error: error,
  getUser: getUser,
  getMember: getMember,
  getRole: getRole,
  ModCase: ModCase,
  modCaseEmbed: modCaseEmbed,
  paginator: paginator
}