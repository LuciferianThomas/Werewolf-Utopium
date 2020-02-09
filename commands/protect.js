const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "protect",
  aliases: ["heal", "prot"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Doctor" && gamePlayer.role !== "Witch" && shared.commandName == "heal") 
      return await message.author.send("You do not have the abilities to heal a player.")
    
    if (["Flower Child","Guardian Wolf"].includes(gamePlayer.role)) {
      if (!gamePlayer.alive)
        return await message.author.send("You are dead. You can no longer protect a player.")
      
      if (game.currentPhase % 3 == 0)
        return await message.author.send("You can only protect a player from lynching at day.")
      
      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")

      let targetPlayer = game.players[target-1]
      if (!game.players[target-1].alive)
        return await message.author.send("You cannot protect an dead player.")
      
      targetPlayer.preventLynch = targetPlayer.number
    }
    else if (["Doctor","Witch","Bodyguard","Tough Guy"].includes(gamePlayer.role)) {
      if (!gamePlayer.alive)
        return await message.author.send("You are dead. You can no longer protect a player.")
      
      if (gamePlayer.jailed)
        return await message.author.send("You are currently jailed and cannot use your abilities.")

      if (gamePlayer.role == "Witch" && gamePlayer.elixirUsed)
        return await message.author.send("You have already used your elixir!")

      if (game.currentPhase % 3 != 0)
        return await message.author.send("You can only protect a player at night.")

      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")

      let targetPlayer = game.players[target-1]
      if (!game.players[target-1].alive)
        return await message.author.send("You cannot protect an dead player.")
      if (target == gamePlayer.number)
        return await message.author.send("You cannot protect yourself.")
      
      gamePlayer.usedAbilityTonight = targetPlayer.number
    
      message.author.send(
        `${
          gamePlayer.role == "Doctor"
            ? fn.getEmoji(client, "Doctor Protect")
            : gamePlayer.role == "Witch"
            ? fn.getEmoji(client, "Witch Elixir")
            : fn.getEmoji(client, "Bodyguard Protect")
        } You selected **${target} ${
          nicknames.get(game.players[target - 1].id)
        }** to be protected.`
      )
    }
    else 
      return await message.author.send("You do not have the abilities to protect a player.")
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}