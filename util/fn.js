const Discord = require("discord.js")
const moment = require("moment")

const db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const { defaultPrefix, embedColor } = require('./config'),
      roles = require('./roles')

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
  // throw Error('Cannot find user.')
}

let getMember = (guild, data) => {
  if (data instanceof Discord.User) return guild.members.get(data.id)
  if (data instanceof Discord.GuildMember) return data
  if (data instanceof Discord.Message) return data.member
  if (typeof data == "string") return guild.members.find(member => member.user.id == data || member.user.tag.toLowerCase() == data.toLowerCase())
  // throw Error('Cannot find member.')
}

let getRole = (guild, data) => {
  if (data instanceof Discord.Role) return data
  if (typeof data == "string") return guild.roles.find(role => role.name.toLowerCase() == data.toLowerCase() || role.id == data || role.name.toLowerCase().startsWith(data.toLowerCase()))
  // throw Error('Cannot find role.')
}

let getEmoji = (client, name) => {
  return client.emojis.find(emoji => emoji.name == name.replace(/ /g, "_"))
}

let paginator = async (author, msg, embeds, pageNow, addReactions = true) => {
  if (addReactions) {
    await msg.react("⏪")
    await msg.react("◀")
    await msg.react("▶")
    await msg.react("⏩")
  }
  let reaction = await msg.awaitReactions((reaction, user) => user.id == author && ["◀","▶","⏪","⏩"].includes(reaction.emoji.name), {time: 30*1000, max:1, errors: ['time']}).catch(() => {})
  if (!reaction) return msg.clearReactions().catch(() => {})
  reaction = reaction.first()
  
  if (msg.channel.type == 'dm' || !msg.member.hasPermissions("MANAGE_MESSAGES")) {
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
  else {
    if (reaction.emoji.name == "◀") {
      await reaction.remove(author)
      let m = await msg.edit(embeds[Math.max(pageNow-1, 0)])
      paginator(author, m, embeds, Math.max(pageNow-1, 0), false)
    } else if (reaction.emoji.name == "▶") {
      await reaction.remove(author)
      let m = await msg.edit(embeds[Math.min(pageNow+1, embeds.length-1)])
      paginator(author, m, embeds, Math.min(pageNow+1, embeds.length-1), false)
    } else if (reaction.emoji.name == "⏪") {
      await reaction.remove(author)
      let m = await msg.edit(embeds[0])
      paginator(author, m, embeds, 0, false)
    } else if (reaction.emoji.name == "⏩") {
      await reaction.remove(author)
      let m = await msg.edit(embeds[embeds.length-1])
      paginator(author, m, embeds, embeds.length-1, false)
    }
  }
}

const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object))
}





const broadcast = async (client, game, content, ignore = []) => {
  for (var i = 0; i < game.players.length; i++) 
    if (!ignore.includes(game.players[i].id)) await client.users.get(game.players[i].id).send(content)
}

const broadcastTo = (client, users, content) => {
  if (typeof users[0] !== "string") users = users.map(x => x.id)
  
  let game = games.get("quick").find(g => g.gameID == players.get(`${users[0]}.currentGame`))
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
  if (game.mode == 'custom') return undefined
  
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].suicide) continue;
    if (winners.includes(game.players[i].number))
      players.push(`${game.players[i].id}.wins`, {
        role: game.players[i].role,
        team: team ? team : 
              game.players[i].sect ? "Sect" : roles[game.players[i].role].team
      })
    else 
      players.push(`${game.players[i].id}.loses`, {
        role: game.players[i].role,
        team:
          game.players[i].role == "Headhunter" &&
          game.players.find(
            p => p.alive && p.headhunter == game.players[i].number
          )
            ? "Solo"
            : game.players[i].sect
            ? "Sect"
            : roles[game.players[i].role].team
      })
  }
}

const gameEmbed = (client, game) => {
  return new Discord.RichEmbed()
    .setTitle(game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`)
    .addField(
      `Players [${game.players.length}]`,
      !game.players.length
        ? "-"
        : game.currentPhase == -1
        ? game.players.map(p => nicknames.get(p.id)).join("\n")
        : game.players.map(
            p =>
              `${
                p.number
              } ${nicknames.get(p.id)}${
                p.alive ? "" : " <:Death:668750728650555402>"
              } ${getEmoji(client, p.role)}${
                p.couple
                  ? ` ${getEmoji(client, "Cupid Lovers")}`
                  : ""
              }${
                p.sect
                  ? ` ${getEmoji(client, "Sect Member")}`
                  : ""
              }${
                p.boxed && game.players.find(pl => pl.role == "Soul Collector" && pl.alive)
                  ? ` ${getEmoji(client, "Soul")}` : ""
              }${p.left ? " *off*" : ""}`
          ).join("\n")
    )
    .addField("Roles", game.originalRoles.map(r => `${getEmoji(client, r)}`).join(' '))
}

const death = (client, game, number, suicide = false) => {
  let deadPlayer = game.players.find(p => p.number == number)
  
  if (!suicide) {
    if (game.currentPhase % 3 == 1) {
      // RED LADY VISITING ATTACKED PLAYER
      let rls = game.players.filter(p => p.alive && p.role == "Red Lady" && p.usedAbilityTonight == deadPlayer.number)
      for (var rl of rls) {
        rl.alive = false
        rl.roleRevealed = "Red Lady"
        rl.killedBy = game.players[rl.usedAbilityTonight-1].number
        game.lastDeath = game.currentPhase - 1
        game = death(client, game, rl.number)

        broadcastTo(
          client, game.players.filter(p => !p.left),
          `<:Red_Lady_LoveLetter:674854554369785857> **${rl.number} ${nicknames.get(rl.id)} ${getEmoji(client, "Red Lady")
          }** visited an evil player and died!`
        )
      }
    }
    
    // AVENGING
    if (!deadPlayer.alive && ["Junior Werewolf","Avenger"].includes(deadPlayer.role)
        && !deadPlayer.avenged && !deadPlayer.suicide) {
      let avengingPlayer = deadPlayer
      let avengedPlayer = game.players[avengingPlayer.avenge-1]
      if (avengedPlayer && avengedPlayer.alive) {
        avengedPlayer.alive = false
        if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role
        avengedPlayer.killedBy = deadPlayer.number

        broadcastTo(
          client,
          game.players.filter(p => !p.left),
          `${getEmoji(
            client,
            `${avengingPlayer.role} Select`
          )} The ${avengingPlayer.role.toLowerCase()}'s death has been avenged, **${
            avengedPlayer.number
          } ${nicknames.get(avengedPlayer.id)}${
            game.config.deathReveal
              ? ` ${getEmoji(client, avengedPlayer.role)}`
              : ""
          }** is dead!`
        )

        game = death(client, game, avengedPlayer.number)
      }
    }

    // LOVE COUPLE SUICIDE
    if (!deadPlayer.alive && !deadPlayer.suicide && deadPlayer.lover) {
      let otherLover = game.players.find(p => p.number !== deadPlayer.number && p.lover)
      
      if (otherLover.alive) {
        otherLover.alive = false
        if (game.config.deathReveal) otherLover.roleRevealed = otherLover.role

        broadcastTo(
          client,
          game.players.filter(p => !p.left),
          `${getEmoji(
            client, `Cupid Lovers`
          )} **${
            otherLover.number
          } ${nicknames.get(otherLover.id)}${
            game.config.deathReveal
              ? ` ${getEmoji(client, otherLover.role)}`
              : ""
          }** lost the love of their life and has suicided!`
        )

        game = death(client, game, otherLover.number)
      }
    }

    // SECT SUICIDE
    if (!deadPlayer.alive && !deadPlayer.suicide && deadPlayer.role == "Sect Leader" && deadPlayer.sectSuicided) {
      let sectLeader = game.players.find(p => p.role == "Sect Leader")
      let sectMembers = game.players.filter(p => p.alive & p.sect)

      for (var sectMember of sectMembers) {
        sectMember.alive = false
        if (game.config.deathReveal) sectMember.roleRevealed = sectMember.role

        broadcastTo(
          client,
          game.players.filter(p => !p.left),
          `${getEmoji(
            client, `Sect Member`
          )} Sect Member **${
            sectMember.number
          } ${nicknames.get(sectMember.id)}${
            game.config.deathReveal
              ? ` ${getEmoji(client, sectMember.role)}`
              : ""
          }** committed suicide!`
        )

        game = death(client, game, sectMember.number)
      }
    }
  }
  
  if (deadPlayer.role == "Seer" && game.players.find(p => p.alive && p.role == "Seer Apprentice")) {
    let seerApps = game.players.filter(p => p.alive && p.role == "Seer Apprentice")
    let chosenOne = seerApps[Math.floor(Math.random()*seerApps.length)]
    
    chosenOne.role = "Seer"
    getUser(client, chosenOne.id).send(
      new Discord.RichEmbed()
        .setTitle("Master")
        .setThumbnail(getEmoji(client, "Seer").url)
        .setDescription("The Seer was killed. You are now a Seer!")
    )
  }
  
  if (roles[deadPlayer.role].team == "Village" && !deadPlayer.sect &&
      ["Village","Werewolves"].includes(roles[game.players[deadPlayer.killedBy-1].role].team) &&
      game.players.find(p => p.role == "Soul Collector" && p.alive && p.box)) {
    broadcastTo(
      client, game.players.filter(p => !p.left),
      new Discord.RichEmbed()
        .setTitle("Your soul is mine")
        .setThumbnail(getEmoji(client, "Soul"))
        .setDescription(
          `The Soul Collector took **${deadPlayer.number} ${nicknames.get(deadPlayer.id)}**'s soul!` +
          " They cannot talk to the Medium or the dead, and cannot be revived until the Soul Collector is dead!"
        )
    )
  }

  return game
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
  paginator: paginator,
  deepClone: deepClone,
  clone: deepClone,
  broadcast: broadcast,
  broadcastTo: broadcastTo,
  addXP: addXP,
  addWin: addWin,
  death: death,
  gameEmbed: gameEmbed
}