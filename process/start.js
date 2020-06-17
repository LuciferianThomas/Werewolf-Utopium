const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      wrg = require('weighted-random')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames"),
      logs = new db.table("Logs")

const fn = require("/home/sd/wwou/util/fn.js"),
      roles = require('/home/sd/wwou/util/roles.js'),
      tags = require('/home/sd/wwou/util/tags.js')

module.exports = async (client, game) => { try {
  let Games = games.get("quick")
  
  fn.broadcast(client, game, "Game is starting...")
  fn.addLog(game, "-divider-")
  fn.addLog(game, "Game is starting...")
  game.currentPhase = -.5

  let thisGame1 = Games.find(g => g.gameID == game.gameID)
  Games[Games.indexOf(thisGame1)] = game
  
  games.set("quick", Games)
    
  game.originalRoles.splice(game.players.length)
  let gameRoles = fn.clone(game.originalRoles)
  
  for (var i = 0; i < game.players.length; i++) {
    game.players[i].number = i+1
    let thisPlayer = game.players[i]
    let roleWeight = gameRoles.map(r =>
      ((game.mode == "custom" && game.config.talismans) ||
        game.mode != "custom") &&
      players.get(`${thisPlayer.id}.talEq`) == r
        ? 11
        : 1
    )
          
    let role = thisPlayer.role = thisPlayer.initialRole = gameRoles.splice(wrg(roleWeight), 1)[0]
    if (role == players.get(`${thisPlayer.id}.talEq`)){
      players.delete(`${thisPlayer.id}.talEq`)
      players.subtract(`${thisPlayer.id}.inventory.talisman.${role}`, 1)
      let talisman = await fn.createTalisman(client, role)
      fn.getUser(client, thisPlayer.id).send(
        new Discord.MessageEmbed()
          .attachFiles([talisman])
          .setThumbnail(`attachment://${talisman.name}`)
          .setTitle("Talisman Used")
          .setDescription(`You used a ${role} Talisman.`)
      )
      fn.addLog(game, `${nicknames.get(thisPlayer.id)} used a ${role} Talisman.`)
    }
    Object.assign(game.players[i], {alive: true, protectors: []})
    
    if (thisPlayer.role.startsWith("Random")) {
      let rdmRoles = Object.values(roles).filter(
        role =>
          ((thisPlayer.role == "Random" && role.cat !== "Random") || thisPlayer.role == `Random ${role.cat}`) && 
            !(game.originalRoles.includes(role.name) && role.oneOnly) && role.tag & tags.ROLE.AVAILABLE
      )
      console.log(rdmRoles.map(x => x.name))
      
      role = rdmRoles[Math.floor(Math.random()*rdmRoles.length)].name
      console.log(role)
      thisPlayer.initialRole = role
      thisPlayer.role = role
    }
      
    switch (thisPlayer.role) {
      case "Bodyguard":
        thisPlayer.health = 2; break;
      case "Tough Guy":
        thisPlayer.health = 1; break;
      case "Medium": case "Jailer": case "Priest": case "Flower Child": 
      case "Werewolf Berserk": case "Kitten Wolf": case "Guardian Wolf":
      case "Pacifist": case "Wolf Pacifist": case "Shadow Wolf": case "Cannibal":
        thisPlayer.abil1 = 1; break;
      case "Gunner": case "Marksman":
      case "Nightmare Werewolf":
        thisPlayer.abil1 = 2; break;
      case "Fortune Teller":
        thisPlayer.cards = []; break;
      case "Sect Leader":
        thisPlayer.sect = true; break;
      case "Illusionist":
        thisPlayer.deluded = []; break;
      case "Soul Collector":
        thisPlayer.box = []; break;
      case "Witch":
        thisPlayer.abil1 = 1; thisPlayer.abil2 = 1; break;
    }
    
    await fn.getUser(client, thisPlayer.id).send(
      new Discord.MessageEmbed()
        .setTitle(
          `You are Player #${thisPlayer.number}.`
        )
    )
    
    fn.addLog(game, `${thisPlayer.number} ${nicknames.get(thisPlayer.id)} is ${roles[role].oneOnly ? "the" : /^([aeiou])/i.test(role) ? "an" : "a"} ${role}. Aura: ${roles[role].aura}, Team: ${roles[role].team}`)
    
    await fn.getUser(client, thisPlayer.id).send(
      new Discord.MessageEmbed()
        .setThumbnail(fn.getEmoji(client, thisPlayer.role).url)
        .setTitle(
          `You are ${
            roles[role].oneOnly
              ? "the"
              : /^([aeiou])/i.test(role)
              ? "an"
              : "a"
          } ${role}.`
        )
        .setDescription(
          `${roles[role].desc}\n\nAura: ${roles[role].aura}\nTeam: ${roles[role].team}`
        )
    )
  }
  
  
  
  let headhunters = game.players.filter(p => p.role == "Headhunter")
  for (var i = 0; i < headhunters.length; i++) {
    let possibleTargets = game.players
      .filter(p => 
        roles[p.role].team.includes("Village") && 
        !["Gunner", "Priest", "Mayor", "Cursed"].includes(p.role) && 
        p.number !== headhunters[i].number &&
        !p.headhunter
      ).map(p => p.number)
    if (!possibleTargets.length) 
      possibleTargets = game.players.filter(p => !p.headhunter).map(p => p.number)
    let target = possibleTargets[Math.floor(Math.random()*possibleTargets.length)]
    game.players[target-1].headhunter = headhunters[i].number
    await fn.getUser(client, headhunters[i].id)
      .send(
        new Discord.MessageEmbed()
          .setAuthor(`Target`, fn.getEmoji(client, "Headhunter Target").url)
          .setDescription(`Your target is ${target} ${nicknames.get(game.players[target-1].id)}.`)
      )
    fn.addLog(game, `The target for ${headhunters[i].number} ${nicknames.get(headhunters[i].id)} is ${target} ${nicknames.get(game.players[target-1].id)}.`)
  }
  
  for (var i = 0; i < game.players.length; i++) {
    let thisPlayer = game.players[i]
    
    fn.getUser(client, thisPlayer.id).send(
      new Discord.MessageEmbed()
        .setTitle(game.mode == 'custom' ? game.name : `Game #${game.gameID}`)
        .addField(
          `Players [${game.players.length}]`,
          game.currentPhase == -1
            ? game.players.map(p => nicknames.get(p.id)).join("\n")
            : game.players.map(
                p =>
                  `${p.id == thisPlayer.id ? "**" : ""}${
                    p.number
                  } ${nicknames.get(p.id)}${
                    p.alive ? "" : ` ${fn.getEmoji(client, "Death")}`
                  }${
                    p.id == thisPlayer.id ||
                    p.roleRevealed
                      ? ` ${fn.getEmoji(client, p.roleRevealed || p.role)}`
                      : (roles[thisPlayer.role].team == "Werewolves" &&
                        roles[p.role].team == "Werewolves") && thisPlayer.role !== "Sorcerer" ||
                        (thisPlayer.role == "Sorcerer" && p.role == "Sorcerer") ||
                        (thisPlayer.role == "Mason" && p.role == "Mason")
                      ? ` ${fn.getEmoji(client, p.role)}`
                      : ""
                  }${p.left ? " *off*" : ""}${
                    p.id == thisPlayer.id ? "**" : ""
                  }`
              ).join("\n")
        )
        .addField(
          `Roles`,
          game.originalRoles
            .sort((a, b) => {
              if (a > b) return 1
              if (a < b) return -1
            })
            .map(r => `${fn.getEmoji(client, r)} ${r}`)
            .join("\n")
        )
    )
    
    fn.getUser(client, thisPlayer.id).send(
      new Discord.MessageEmbed()
        .setTitle("Night 1 has started.")
        .setThumbnail(fn.getEmoji(client, "Night").url)
        .setDescription(
          roles[thisPlayer.role].nit1 || roles[thisPlayer.role].nite || "Nothing to do. Go back to sleep!"
        )
    )
  }
  
  // await fn.broadcastTo(
  //   client, game.players.filter(p => !p.left),
  //   new Discord.MessageEmbed()
  //     .setTitle("Night 1 has started.")
  //     .setThumbnail(fn.getEmoji(client, "Night").url)
  // )
  
  fn.addLog(game, "-divider-")
  fn.addLog(game, "Night 1 has started.")
  
  game.roles = game.players.map(p => p.role)
  game.currentPhase = 0
  
  if (game.roles.includes("President")) {
    let president = game.players.find(p => p.role == "President")
    
    await fn.broadcastTo(
      client, game.players.filter(p => !p.left),
      new Discord.MessageEmbed()
        .setTitle("President")
        .setThumbnail(fn.getEmoji(client, "President"))
        .setDescription(`**${president.number} ${nicknames.get(president.id)}** is the President!`), true
    )
    fn.addLog(game, `${president.number} ${nicknames.get(president.id)} is the President!`)
    
    president.roleRevealed = "President"
  }
  
  if (`${game.gameID}`.match(/^(dev|beta)test_/gi))
    await fn.broadcastTo(
      client, game.players,
      fn.gameEmbed(client, game)
    )
  
  if(game.instructions){
    await fn.broadcastTo(
      client, game.players.filter(p => !p.left),
      new Discord.MessageEmbed()
        .setColor("WHITE")
        .setTitle("📋 Instructions")
        .setDescription(game.instructions)
    )
    fn.addLog(game, "-divider2-")
    fn.addLog(game, "Instructions:\n"+game.instructions)
    fn.addLog(game, "-divider2-")
  }
  
  game.lastDeath = 0
  game.nextPhase = moment().add(30, "s")
  
  game.startTime = moment()
  
  let newGames = games.get("quick")
  let thisGame = Games.find(g => g.gameID == game.gameID)
  newGames[Games.indexOf(thisGame)] = game
  
  games.set("quick", newGames)
} catch (error) {
  client.channels.cache.get("664285087839420416").send(
    new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle(`${fn.getEmoji(client, "red_tick")} Game Terminated`)
      .setDescription(
        `${
          game.mode == "custom"
            ? `${game.name} [\`${game.gameID}\`]`
            : `Game #${game.gameID}`
        } has been terminated when trying to \`start the game\` due to the following reason: \`\`\`${
          error.stack.replace(/(?:(?!\n.*?\(\/app.*?)\n.*?\(\/.*?\))+/g, "\n\t...")
        }\`\`\``
      )
  )
  fn.addLog(game, `[ERROR] Game was terminated at \`start the game\`.`)
  fn.addLog(game, `[ERROR] ${error.stack.replace(/ {4}/g, "            ")}`)
  
  game.currentPhase = 999
  // fn.addXP(game.players, 15)
  fn.addXP(game.players.filter(p => !p.left), 15)
  fn.broadcastTo(
    client, game.players.filter(p => !p.left),
    `${fn.getEmoji(client, "red_tick")} There is an error causing this game to be terminated.` +
    " Please contact staff members."
  )
}}