const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "shoot",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Witch")
      return await message.author.send("You do not have the abilities to poison a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer use your potions.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (gamePlayer.poisonUsed)
      return await message.author.send("You have used your poison potion.")
    
    if (gamePlayer.role == "Witch" && game.currentPhase % 3 != 0)
      return await message.author.send("You can only shoot on a player in jail at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot shoot an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot shoot yourself.")
    
    game.players[target-1].alive = false
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left).map(p => p.id), 
      `<:Witch_Poison:660667541185626112> Witch poisoned **${target} ${fn.getUser(client, game.players[target-1].id).username}${game.config.deathReveal ? ` ${fn.getEmoji(client, game.players[target-1].role)}` : ""})**.`)
    
    if (game.config.deathReveal) game.players[target-1].roleRevealed = true
    gamePlayer.poisonUsed = true
    game.lastDeath = game.currentPhase
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}