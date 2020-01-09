const Discord = require("discord.js")
const moment = require("moment")

const db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players")

const { defaultPrefix, embedColor } = require('./config.js')

let time = (date = moment()) => {
  return moment(date).utcOffset(8).format("YYYY/MM/DD HH:mm:ss")
}

let utcTime = (date = moment()) => {
  return moment(date).format("YYYY/MM/DD HH:mm:ss [GMT]")
}

let ago = (date = moment()) => {
  return moment(date).fromNow()
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
  if (typeof data == "string") return guild.roles.find(role => role.name.toLowerCase() == data.toLowerCase() || role.id == data || role.name.toLowerCase().startsWith(data.toLowerCase()))
  throw Error('Cannot find role.')
}

let getEmoji = (client, name) => {
  return client.emojis.find(emoji => emoji.name == name.replace(/ /g, "_"))
}

function ModCase (client, id, type, member, message, reason, period) {
  this.id = parseInt(id)
  this.type = type.toUpperCase()
  this.user = getUser(client, member).id
  this.moderator = getUser(client, message.member).id
  this.reason = reason
  this.time = moment()
  this.period = period
  this.active = true
  this.message = message.id
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
  if (thisCase.period) embed.addField("Duration", `${thisCase.period/1000/60} minute${thisCase.period/1000/60 == 1 ? "" : "s"}`, true)
  embed.addField("Reason", thisCase.reason)
    .setFooter(`Case #${thisCase.id}`, client.user.avatarURL)
    .setTimestamp(moment(thisCase.time))

  return embed
}

let paginator = async (author, msg, embeds, pageNow) => {
  if (pageNow != 0) {
    await msg.react("⏪")
    await msg.react("◀")
  }
  if (pageNow != embeds.length-1) {
    await msg.react("▶")
    await msg.react("⏩")
  }
  let reaction = await msg.awaitReactions((reaction, user) => user.id == author && ["◀","▶","⏪","⏩"].includes(reaction.emoji.name), {time: 30*1000, max:1, errors: ['time']}).catch(() => msg.clearReactions().catch(() => {}))
  if (!reaction.size) return undefined
  reaction = reaction.first()
  if (reaction.emoji.name == "◀") {
    let m = await msg.channel.send(embeds[Math.max(pageNow-1, 0)])
    msg.delete()
    paginator(author, m, embeds, Math.max(pageNow-1, 0))
  } else if (reaction.emoji.name == "▶") {
    let m = await msg.channel.send(embeds[Math.min(pageNow+1, embeds.length-1)])
    msg.delete()
    paginator(author, m, embeds, Math.min(pageNow+1, embeds.length-1))
  } else if (reaction.emoji.name == "⏪") {
    let m = await msg.channel.send(embeds[0])
    msg.delete()
    paginator(author, m, embeds, 0)
  } else if (reaction.emoji.name == "⏩") {
    let m = await msg.channel.send(embeds[embeds.length-1])
    msg.delete()
    paginator(author, m, embeds, embeds.length-1)
  }
}

const broadcast = async (client, game, content, ignore = []) => {
  for (var i = 0; i < game.players.length; i++) 
    if (!ignore.includes(game.players[i].id)) await client.users.get(game.players[i].id).send(content)
}

const broadcastTo = (client, users, content) => {
  if (typeof users[0] !== "string") users = users.map(x => x.id)
  
  let game = games.get("quick").find(g => g.gameID == players.get(`${users[0].id}.currentGame`))
  // if (game.currentPhase % 3 !== 0) users.push(...game.spectators)
  
  for (var i = 0; i < users.length; i++) 
    client.users.get(users[i]).send(content)
}

const addXP = (users, xp) => {
  if (typeof users[0] !== "string") users = users.map(x => x.id)
  for (var i = 0; i < users.length; i++)
    players.add(`${users[i]}.xp`, xp)
}

const addWin = (game, winners, team) => {
  for (var i = 0; i < game.players.length; i++) {
    if (winners.include(game.players[i].number))
      players.push(`${game.players[i].id}.wins`, {role: game.players[i].role, team: team})
    else 
      players.push(`${game.players[i].id}.loses`, {role: game.players[i].role, team:})
  }
}

module.exports = {
  time: time,
  utcTime: utcTime,
  date: utcTime,
  ago: ago,
  embed: embed,
  error: error,
  getUser: getUser,
  getMember: getMember,
  getEmoji: getEmoji,
  getRole: getRole,
  ModCase: ModCase,
  modCaseEmbed: modCaseEmbed,
  paginator: paginator,
  broadcast: broadcast,
  broadcastTo: broadcastTo,
  addXP: addXP,
}