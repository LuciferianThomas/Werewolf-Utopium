const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "upgrade",
  aliases: [], 
  gameroles: ["Demon Wolf"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    let target = parseInt(args[0])
    
    if (gamePlayer.role !== "Demon Wolf")
      return await message.author.send("You do not have the abilities to nightmare a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer nightmare a player.")
    if (!gamePlayer.abil1)
      return await message.author.send("You have already upgraded a werewolf.")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.channel.send("Invalid target!")
    
    let targetPlayer = game.players[target-1]
    
    if (!game.players[target-1].alive) 
      return await message.channel.send("You cannot upgrade a dead player!");
    if (gamePlayer.number == target)
      return await message.channel.send("You cannot upgrade yourself!");
    if (roles[targetPlayer.role].team != "Werewolves")
      return await message.channel.send("You can only upgrade a fellow werewolf!")
    
    gamePlayer.abil1 -= 1

    if(targetPlayer.role == "Wolf Seer") 
      return await message.channel.send(`**${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** is a Wolf Seer, which is the strongest wolf in the game and unable to be upgraded! Congrats on wasting your ability!`)   

    let wolfstrength = ["Werewolf", "Junior Werewolf", "Nightmare Werewolf", "Kitten Wolf", "Wolf Shaman", "Wolf Pacifist", "Shadow Wolf", "Guardian Wolf", "Werewolf Berserk", "Alpha Werewolf", "Wolf Seer" ]
    targetPlayer.role = wolfstrength[wolfstrength.indexOf(wolfstrength.find(x => x == targetPlayer.initialRole)) + 1]

    switch (targetPlayer.role) {
      case "Werewolf Berserk": case "Kitten Wolf": case "Guardian Wolf": case "Wolf Pacifist": case "Shadow Wolf":
        targetPlayer.abil1 = 1; break;
      case "Nightmare Werewolf":
        targetPlayer.abil1 = 2; break;
    }

    await fn.getUser(client, targetPlayer.id).send(
      new Discord.MessageEmbed()
        .setThumbnail(fn.getEmoji(client, targetPlayer.role).url)
        .setTitle(
          `You have been upgraded by the ${fn.getEmoji(client, "Demon_Wolf")} Demon Wolf to ${
            roles[targetPlayer.role].oneOnly
              ? "the"
              : /^([aeiou])/i.test(targetPlayer.role)
              ? "an"
              : "a"
          } ${targetPlayer.role}.`
        )
        .setDescription(
          `${roles[targetPlayer.role].desc}\n\nAura: ${roles[targetPlayer.role].aura}\nTeam: ${roles[targetPlayer.role].team}`
        )
    )

    let actionEmbed = new Discord.MessageEmbed()
        .setTitle("New Actions")
        .setThumbnail(fn.getEmoji(client, (game.currentPhase % 3) ? "Night" : "Day").url)
    if(game.currentPhase % 3 == "0" && game.currentPhase != 0) actionEmbed.setDescription(
          (roles[targetPlayer.role].nite ||
            (targetPlayer.abil1 + (targetPlayer.abil2 || 0) != 0))
            ? roles[targetPlayer.role].nite
            : "Nothing to do. Go back to sleep!"
        )
    if(game.currentPhase == 0) actionEmbed.setDescription(
      roles[targetPlayer.role].nit1 || roles[targetPlayer.role].nite || "Nothing to do. Go back to sleep!"
    )
    if(game.currentPhase % 3 == 1) actionEmbed.setDescription(
      `Start discussing!\n${roles[targetPlayer.role].day || ""}`
    )
    if(game.currentPhase % 3 == 2) actionEmbed.setDescription(
      `${Math.floor(
        game.players.filter(player => player.alive).length / 2
      )} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.\n\n${roles[targetPlayer.role].day || ""}`
    )
    await fn.getUser(client, targetPlayer.id).send(actionEmbed)
    
    message.author.send(
      `${fn.getEmoji(client, "Demon_Wolf_Upgrade")} You have upgraded ${targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) from ${targetPlayer.initialRole} to ${targetPlayer.role}!`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} upgraded  (${targetPlayer.role})${targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) from ${targetPlayer.initialRole} to ${targetPlayer.role}.`
    )
    
    game.players[target-1] = targetPlayer
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}