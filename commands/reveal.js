const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "reveal",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role == "Pacifist" && args.length) {
      if (!gamePlayer.alive)
        return await message.author.send("You are dead. You can no longer reveal a player's role!")
      if (gamePlayer.revealed)
        return await message.author.send("You have already revealed a player!")
      
      if (game.currentPhase % 3 == 0)
        return await message.author.send("You can only reveal players at day!")
      
      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")
      
      let targetPlayer = game.players[target-1]
      if (!targetPlayer.alive)
        return await message.author.send("You cannot reveal a dead player's role!")
    //  if (targetPlayer.paciReveal)
    //    return await message.author.send("This player is already revealed by another Pacifist!")
      
      fn.broadcastTo(
        client, game.players.filter(p => !p.left),
        new Discord.RichEmbed()
          .setAuthor("Peace For Today", fn.getEmoji(client, "Pacifist Reveal").url)
          .setThumbnail(fn.getEmoji(client, targetPlayer.role).url)
          .setDescription(
            `Pacifist revealed **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}**. They are ${
              roles[targetPlayer.role].oneOnly
                ? "the"
                : /^([aeiou])/i.test(targetPlayer.role)
                ? "an"
                : "a"
            } ${targetPlayer.role}!\n` +
            "There will be no voting today!"
          )
      )
      
      gamePlayer.revealed = true
      targetPlayer.roleRevealed = targetPlayer.role
      targetPlayer.paciRevealed = true
      game.noVoting = true
    }
    else if (gamePlayer.role == "Mayor" && args[0].toLowerCase() == "mayor") {
      if (!gamePlayer.alive)
        return await message.author.send("You are dead. You can no longer reveal yourself.")
    
      if (gamePlayer.roleRevealed == "Mayor")
        return await message.author.send("Your mayorship has already been revealed!")
    
      if (game.currentPhase % 3 == 0)
        return await message.author.send("You cannot reveal yourself at night.")
    
      fn.broadcastTo(
        client, game.players.filter(p => !p.left), 
        new Discord.RichEmbed()
          .setTitle(`The Honorable ${nicknames.get(message.author.id)}`)
          .setThumbnail(fn.getEmoji(client, "Mayor Reveal").url)
          .setDescription(`**${gamePlayer.number} ${nicknames.get(message.author.id)}** revealed themselves as Mayor!`)
      )
    
      gamePlayer.roleRevealed = "Mayor"
    }
    else if (game.players.find(p => p.cards && p.cards.includes(gamePlayer.number)) && args[0].toLowerCase() == "card") {
      if (!gamePlayer.alive)
        return await message.author.send("You are dead. You can no longer reveal yourself.")
      
      fn.broadcastTo(
        client, game.players.filter(p => !p.left),
        new Discord.RichEmbed()
          .setAuthor(
            "Fortune Teller's Card",
            fn.getEmoji(client, `Fortune Teller Card1`).url
          )
          .setThumbnail(fn.getEmoji(client, gamePlayer.role).url)
          .setDescription(
            `**${gamePlayer.number} ${nicknames.get(message.author.id)}** used the Fortune Teller's card. They are ${
              roles[gamePlayer.role].oneOnly
                ? "the"
                : /^([aeiou])/i.test(gamePlayer.role)
                ? "an"
                : "a"
            } ${gamePlayer.role}!`
          )
      )
      
      gamePlayer.roleRevealed = gamePlayer.role
      gamePlayer.ftCard = 1
    }
    else return await message.author.send("Missing arguments.")
      
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}