const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

const quickGameRoles = [
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Aura Seer", "Serial Killer", "Cursed", "Wolf Seer", "Priest"],
  // ["Cursed", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
  //  "Bodyguard", "Gunner", "Junior Werewolf", "Detective", "Arsonist", "Priest", "Wolf Seer", "Aura Seer"],
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Cursed", "Serial Killer", "Mayor", "Wolf Seer", "Avenger"],
  ["Aura Seer", "Medium", "Witch", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Beast Hunter", "Gunner", "Wolf Shaman", "Aura Seer", "Arsonist", "Priest", "Wolf Seer", "Mayor"]
]

module.exports = {
  name: "quick",
  aliases: ["q"],
  run: async (client, message, args, shared) => {
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    if (Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`))) {
      let prevGame = Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`)),
          prevGamePlayer = prevGame.players.find(p => p.id == message.author.id)
      if (prevGame.currentPhase < 999 && !prevGamePlayer.left)
        return await message.author.send("You are already in a game!")
      else prevGamePlayer.left = true
    }
    
    let currentGame = Games.find(game => game.players.length <= 16 && game.currentPhase < -0.5 && game.mode == "quick")
    if (currentGame) {
      Games[Games.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
      currentGame = Games.find(game => game.gameID == currentGame.gameID)
    } else {
      let count = games.add("count", 1)
      let roles = quickGameRoles[Math.floor(Math.random()*quickGameRoles.length)]
      currentGame = {
        mode: "quick",
        gameID: count,
        nextPhase: null,
        currentPhase: -1,
        originalRoles: roles,
        players: [{
          id: message.author.id,
          lastAction: moment()
        }],
        logs: "",
        logMsgs: [],
        spectators: [],
        config: {
          deathReveal: true,
          talismans: true
        }
      }
      await fn.addLog(count, `New game: ${count}`)
      await fn.addLog(count, `Mode: ${currentGame.mode}`)
      await fn.addLog(count, `Game roles: ${roles.join(", ")}`)
      Games.push(currentGame)
    }
    
    let m = message.author.send(
      new Discord.MessageEmbed()
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    let m2 = message.author.send(
      new Discord.MessageEmbed().setTitle("Welcome to the game! Here are some useful commands to get started:")
      .setDescription(`\`w!start\` - Vote to start the game (4 people required)\n\`w!game\` - See the player list and the list of roles in the game\n\`w!leave\` - Leave the game. **Warning: Doing this after the game starts is considered suiciding**`)
    )
    
    let embed = new Discord.MessageEmbed()
      .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))         
      .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    if (currentGame.spectators.length) embed.addField(`Current Spectators [${currentGame.spectators.length}]`, currentGame.spectators.map(id => nicknames.get(id)).join("\n"))
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      embed
    )
    let alt = false
    if (client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name == "Verified Alts")) alt = true
    fn.addLog(currentGame, `${nicknames.get(message.author.id)} joined the game.${alt ? " (Verified Alt)" : ""}`)
    
    
    if (message.guild) message.channel.send(`**${nicknames.get(message.author.id)}** has now joined **Quick Game #${currentGame.gameID}**.`)
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
      
    if (currentGame.players.length == 16) require('/home/utopium/wwou/process/start')(client, currentGame)
  }
}