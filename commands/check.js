const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const roles = require('/app/util/roles')

const fn = require('/app/util/fn')

module.exports = {
  name: "check",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.role.includes("Seer"))
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    
    if (gamePlayer.checkedTonight)
      return await message.author.send("You have already checked on a player tonight.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot check on a dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot check on yourself.")
    
    if (gamePlayer.role == "Aura Seer")
      message.author.send(`${client.emojis.find(e => e.name == roles[game.players[target-1].role].aura && e.guild.id == "658631194870677553")
                        } ${target} ${client.users.get(game.players[target-1].id).username} has a${
                          roles[game.players[target-1].role].aura == "Good" ? "" : "n"
                          } ${roles[game.players[target-1].role].aura} aura.`)
    else
      message.author.send(`${client.emojis.find(e => e.name == game.players[target-1].role[0].replace(/ /g, "_") && e.guild.id == "658631194870677553")
                        } ${target} ${client.users.get(game.players[target-1].id).username} is a${["A","E","I","O","U"].includes(game.players[target-1].role[0]) ? "n" : ""} ${game.players[target-1].role}`)
    
    game.players[gamePlayer.number-1].checkedTonight = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}