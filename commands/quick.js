const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

const quickGameRoles = [
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Aura Seer", "Serial Killer", "Cursed", "Wolf Seer", "Priest"],
/*
  ["Cursed", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Junior Werewolf", "Detective", "Arsonist", "Priest", "Wolf Seer", "Aura Seer"],
  ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Bodyguard", "Gunner", "Wolf Shaman", "Cursed", "Serial Killer", "Mayor", "Wolf Seer", "Avenger"],
  ["Aura Seer", "Medium", "Witch", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
   "Beast Hunter", "Gunner", "Wolf Shaman", "Aura Seer", "Bomber", "Priest", "Wolf Seer", "Mayor"]
*/
]

module.exports = {
  name: "quick",
  aliases: ["joingame", "q"],
  run: async (client, message, args, shared) => {
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let QuickGames = games.get("quick")
    
    let currentGame = QuickGames.find(game => game.players.length <= 16 && game.currentPhase < 0)
    if (currentGame) {
      QuickGames[QuickGames.indexOf(currentGame)].players.push({ id: message.author.id })
      currentGame = QuickGames.find(game => game.gameID == currentGame.gameID)
    } else {
      currentGame = {
        mode: "quick",
        gameID: games.add("count", 1),
        nextPhase: null,
        currentPhase: -1,
        roles: quickGameRoles[Math.floor(Math.random()*quickGameRoles.length)],
               // ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", /*Math.random() < 0.5 ? */"Fool" /*: "Headhunter"*/,
               //  "Bodyguard", "Gunner", "Wolf Shaman", "Serial Killer", "Cursed", "Priest", "Wolf Seer", "Aura Seer"],
        players: [{
          id: message.author.id
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
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => client.users.get(player.id).username).join("\n"))
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    fn.broadcast( client, currentGame,
      new Discord.RichEmbed()
        .setAuthor(`${message.author.username} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => client.users.get(player.id).username).join("\n"))
    )
      
    if (currentGame.players.length == 16) require('/app/process/start')(client, currentGame)
    
    games.set("quick", QuickGames)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}