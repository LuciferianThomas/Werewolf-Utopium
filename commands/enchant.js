const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "enchant",
  gameroles: ["Wolf Shaman"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place votes.")
    
    if (game.currentPhase % 3 == 0) 
      return await message.author.send("You can only enchant a player at day!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")

    
    if (gamePlayer.dazzled)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    
    if (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length == 1)
      return await message.author.send("You cannot enchant a player when you are the last werewolf!")

    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive) 
      return await message.author.send("You cannot enchant a dead player.")
    if (target == gamePlayer.number) 
      return await message.react(fn.getEmoji(client, "harold"))

    gamePlayer.enchant = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(
        client,
        "Wolf Shaman Select"
      )} You selected **${target} ${nicknames.get(
        game.players[target - 1].id
      )}** to be enchanted at night.`
    )
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${target} ${nicknames.get(
        targetPlayer.id
      )} (${targetPlayer.role}) to be enchanted at night.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}