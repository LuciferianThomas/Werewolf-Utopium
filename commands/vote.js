const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "vote",
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
    
    if (gamePlayer.jailed && game.currentPhase % 3 == 0)
      return await message.author.send("You cannot vote while in jail!")
    
    if (game.currentPhase % 3 == 0) {
      if (roles[gamePlayer.role].team == "Werewolves" || 
          (gamePlayer.role == "Wolf Seer" && game.players.filter(player => player.alive && player.role.includes("Werewolf")).length == 0)) {
        let vote = parseInt(args[0])
        if (isNaN(vote) || vote > game.players.length || vote < 1)
          return await message.author.send("Invalid vote.")
        if (game.players[vote-1].role.toLowerCase().includes("wolf")) 
          return await message.author.send("You cannot vote a fellow werewolf.")
        if (!game.players[vote-1].alive) 
          return await message.author.send("You cannot vote a dead player.")
        game.players[gamePlayer.number-1].vote = vote
        
        let wolves = game.players.filter(p => p.role.toLowerCase().includes("wolf") && !p.jailed).map(p => p.id)
        for (var i = 0; i < wolves.length; i++) 
          client.users.get(wolves[i]).send(
            `${gamePlayer.number} ${message.author.username}${gamePlayer.roleRevealed ? ` ${client.emojis.find(e => e.name == gamePlayer.role.replace(/ /g, "_"))}` : ""
             } voted to kill ${vote} ${client.users.get(game.players[vote-1].id).username}${game.players[vote-1].roleRevealed ? ` ${client.emojis.find(e => e.name == game.players[vote-1].role.replace(/ /g, "_"))}` : ""}.`
          )
      } else 
        return await message.author.send("You cannot vote at night!")
    }
    
    if (game.currentPhase % 3 == 1) {
      message.author.send("There is currently nothing to vote for!")
    }
    
    if (game.currentPhase % 3 == 2) {
      if (game.players.find(p => p.mute == gamePlayer.number))
        return await message.author.send("You cannot vote today!")
      
      let vote = parseInt(args[0])
      if (isNaN(vote) || vote > game.players.length || vote < 1)
        return await message.author.send("Invalid vote.")
      if (!game.players[vote-1].alive) 
        return await message.author.send("You cannot vote a dead player.")
      if (vote == gamePlayer.number) 
        return await message.author.send("You cannot vote yourself.")
      game.players[gamePlayer.number-1].vote = vote
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `**${gamePlayer.number} ${message.author.username}${
          gamePlayer.roleRevealed
            ? ` ${client.emojis.find(
                e => e.name == gamePlayer.role.replace(/ /g, "_")
              )}`
            : ""
        }** voted to lynch **${vote} ${
          client.users.get(game.players[vote - 1].id).username
        }${
          game.players[vote - 1].roleRevealed
            ? ` ${client.emojis.find(
                e => e.name == game.players[vote - 1].role.replace(/ /g, "_")
              )}`
            : ""
        }**.`
      )
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}