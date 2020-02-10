const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "poison",
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
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only poison on a player at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot poison an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot poison yourself.")
    
    if (!gamePlayer.sect && targetPlayer.role == "President")
      return await message.author.send("You cannot poison the President!")

    targetPlayer.alive = false
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left).map(p => p.id), 
      `<:Witch_Poison:660667541185626112> Witch poisoned **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""})**.`)
    
    if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
    gamePlayer.poisonUsed = true
    game.lastDeath = game.currentPhase
    gamePlayer.killedTonight = true
    
    game = fn.death(client, game, targetPlayer.number)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}