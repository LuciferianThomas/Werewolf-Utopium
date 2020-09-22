const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "frenzy",
  aliases: ["berserk", "crazy"],
  gameroles: ["Werewolf Berserk"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Werewolf Berserk")
      return await message.author.send("You do not have the abilities to activate frenzy.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer activate frenzy.")
    if (!gamePlayer.abil1)
      return await message.author.send("You have activated frenzy already.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 == 0)
      return await message.author.send("You can only activate frenzy at day!")
        
    game.frenzy = true
    
    message.author.send(
      "You have activated frenzy for tonight!"
    )
    
    gamePlayer.abil1 -= 1
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} activated frenzy night.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}
