const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "check",
  aliases: ["see"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!["Seer", "Aura Seer", "Sorcerer", "Wolf Seer"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    
    if (gamePlayer.role == "Wolf Seer" && game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length == 1)
      return await message.author.send("You cannot check on a player if you are the last werewolf.")
      
    if (gamePlayer.usedAbilityTonight)
      return await message.author.send("You have already checked on a player tonight.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot check on a dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot check on yourself.")
    
    let targetPlayer = game.players[target-1]
    
    if (gamePlayer.role == "Aura Seer") {
      message.author.send(
        new Discord.RichEmbed()
          .setAuthor(`Seeing Results`, fn.getEmoji(client, "Aura Seer").url)
          .setThumbnail(fn.getEmoji(client, `${targetPlayer.enchanted.length ? "Evil" : roles[targetPlayer.role].aura} Aura`).url)
          .setDescription(
            `**${target} ${nicknames.get(targetPlayer.id)}** has a${
            (targetPlayer.enchanted.length ? "Evil" : roles[targetPlayer.role].aura) == "Good" ? "" : "n"
            } ${targetPlayer.enchanted.length ? "Evil" : roles[targetPlayer.role].aura} aura.`
          )
      )
    }
    else {
      message.author.send(
        new Discord.RichEmbed()
          .setAuthor(`Seeing Results`, fn.getEmoji(client, gamePlayer.role).url)
          .setThumbnail(fn.getEmoji(client, (targetPlayer.enchanted.length ? "Wolf Shaman" : targetPlayer.role)).url)
          .setDescription(
            `**${target} ${nicknames.get(targetPlayer.id)}** is a${
              ["A", "E", "I", "O", "U"].includes(!["Wolf Seer", "Sorcerer"].includes(gamePlayer.role) && targetPlayer.enchanted && targetPlayer.enchanted.length ? "W" : targetPlayer.role[0]) ? "n" : ""
            } ${!["Wolf Seer", "Sorcerer"].includes(gamePlayer.role) && targetPlayer.enchanted.length ? "Wolf Shaman" : targetPlayer.role}.`
          )
      )
      
      if (gamePlayer.role == "Wolf Seer")
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role != "Sorcerer"),
          `The wolf seer checked **${target} ${nicknames.get(targetPlayer.id)} ${fn.getEmoji(client, targetPlayer.role)}**.`
        )
    }
    gamePlayer.usedAbilityTonight = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}