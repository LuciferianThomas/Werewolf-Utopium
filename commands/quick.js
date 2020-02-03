const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

const quickGameRoles = [
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Aura Seer", "Serial Killer", "Cursed", "Wolf Seer", "Priest"],
  ["Cursed", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Junior Werewolf", "Detective", "Arsonist", "Priest", "Wolf Seer", "Aura Seer"],
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Cursed", "Serial Killer", "Mayor", "Wolf Seer", "Avenger"],
  // ["Aura Seer", "Medium", "Witch", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
  //  "Beast Hunter", "Gunner", "Wolf Shaman", "Aura Seer", "Bomber", "Priest", "Wolf Seer", "Mayor"]
]

module.exports = {
  name: "quick",
  aliases: ["q"],
  run: async (client, message, args, shared) => {
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let QuickGames = games.get("quick")
    
    let currentGame = QuickGames.find(game => game.players.length <= 16 && game.currentPhase < 0 && game.mode == "quick")
    if (currentGame) {
      QuickGames[QuickGames.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
      currentGame = QuickGames.find(game => game.gameID == currentGame.gameID)
    } else {
      currentGame = {
        mode: "quick",
        gameID: games.add("count", 1),
        nextPhase: null,
        currentPhase: -1,
        originalRoles: quickGameRoles[Math.floor(Math.random()*quickGameRoles.length)],
        players: [{
          id: message.author.id,
          lastAction: moment()
        }],
        spectators: [],
        config: {
          deathReveal: true
        }
      }
      QuickGames.push(currentGame)
    }
    
    let m = message.author.send(
      new Discord.RichEmbed()
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL)
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.RichEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    )
      
    if (currentGame.players.length == 16) require('/app/process/start')(client, currentGame)
    
    games.set("quick", QuickGames)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}