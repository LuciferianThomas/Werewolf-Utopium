const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "create",
  aliases: ["cc"],
  run: async (client, message, args, shared) => {
    // if (!players.get(`${message.author.id}.custom`))
    if (!client.guilds.get('522638136635817986').members.get(message.author.id).roles.find(r => r.name == 'ww cc'))
      return await message.author.send("You cannot create custom games!")
    
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    // if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    let currentGame = {
      mode: "custom",
      nextPhase: null,
      currentPhase: -1,
      originalRoles: [],
      players: [{
        id: message.author.id,
        lastAction: moment()
      }],
      spectators: [],
      config: {
        deathReveal: true,
        nightTime: 45,
        dayTime: 60,
        votingTime: 45
      }
    }
    
    let rolePrompt = await message.author.send(
      new Discord.RichEmbed()
        .setTitle("Custom Game Setup")
        .setDescription(
          `Select roles for your custom game by inputting their names or aliases.\n` +
          "You have 30 seconds for each role. Type `end` to end your selection."
        )
    )
    
    for (var i = 0; i < 16; i++) {
      let inputRole = await rolePrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
        .catch(() => {})
      
      if (i < 4 && !inputRole)
        return await message.author.send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
        )
      else if (!inputRole || (inputRole.first().content.toLowerCase() == "end" && i >= 4))
        break;
      else if (inputRole.first().content.toLowerCase() == "end" && i < 4) {
        return await message.author.send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("You cannot create a game with less than 4 roles!")
        )
      }
      inputRole = inputRole.first().content.replace(/(_|\s+)/g, " ")
      
      let role = Object.values(roles).find((data) => data.name.toLowerCase().startsWith(inputRole.toLowerCase()) || (data.abbr && data.abbr.includes(inputRole.toLowerCase())))
      console.log(role)
      if (!role) {
        await message.author.send("Unknown role.")
        i--; continue;
      }
      currentGame.originalRoles.push(role.name)
    }
    await message.author.send(
      new Discord.RichEmbed()
        .setTitle("Custom Game Setup")
        .setDescription(
          currentGame.originalRoles.map(r => `${fn.getEmoji(client, r)} ${r}`).join('\n')
        )
    )
    
    while (!currentGame.gameID) {
      let gcPrompt = await message.author.send(
        new Discord.RichEmbed()
          .setTitle("Custom Game Setup")
          .setDescription(
            `Select a join code for your game.`
          )
      )
      
      let gcInput = await gcPrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
        .catch(() => {})
      if (!gcInput)
        return await message.author.send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
        )
      gcInput = gcInput.first().content
      
      let usedGCs = games.all().map(x => JSON.parse(x.data).gameID)
      
      if (parseInt(gcInput) != gcInput && gcInput.match(/^[a-z0-9\_]{3-10}$/i) && !usedGCs.includes(gcInput))
        currentGame.gameID = gcInput
      else if (parseInt(gcInput) == gcInput)
        await gcPrompt.channel.send("You cannot have an integral number as your game code.")
      else if (gcInput.length < 3)
        await gcPrompt.channel.send("Your game code must be at least 3 characters long.")
      else if (gcInput.length > 10)
        await gcPrompt.channel.send("Your game code must be at most 10 characters long.")
      else if (!gcInput.match(/^[a-z0-9\_]{3-10}$/i))
        await gcPrompt.channel.send("Your game code must only include alphanumerical characters and underscores.")
      else if (usedGCs.includes(gcInput))
        await gcPrompt.channel.send("Your game code has been taken.")
    }
    
    while (!currentGame.name) {
      let namePrompt = await message.author.send(
        new Discord.RichEmbed()
          .setTitle("Custom Game Setup")
          .setDescription(
            `Select a name for your game.`
          )
      )
      
      let nameInput = await namePrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
        .catch(() => {})
      if (!nameInput)
        return await message.author.send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
        )
      nameInput = nameInput.first().content
      
      if (nameInput.match(/^[a-z0-9\s\-!\?@#\&\_]{3-30}$/i))
        currentGame.name = nameInput
      else if (nameInput.length < 3)
        await namePrompt.channel.send("Your game name must be at least 3 characters long.")
      else if (nameInput.length > 30)
        await namePrompt.channel.send("Your game name must be at most 30 characters long.")
      else if (!nameInput.match(/^[a-z0-9\s\-!\?@#\&\_]{3-30}$/i))
        await namePrompt.channel.send("Your game name must only include alphanumerical characters and underscores.")
    }
    
    let settingsPrompt = await message.author.send(
      new Discord.RichEmbed()
        .setTitle("Custom Game Setup")
        .setDescription(
          `Use default settings?`
        )
    )
    await settingsPrompt.react(fn.getEmoji(client, 'green tick'))
    await settingsPrompt.react(fn.getEmoji(client, 'red tick'))
    let reactions = settingsPrompt.awaitReaction(
      (r, u) =>
        (r.emoji.id == fn.getEmoji(client, "green_tick").id ||
          r.emoji.id == fn.getEmoji(client, "red_tick").id) &&
        u.id == message.author.id,
      { time: 30*1000, max: 1, errors: ['time'] }
    ).catch(() => {})
    if (!reactions)
      return await message.author.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Prompt timed out.")
      )
    let reaction = reactions.first().emoji
    if (reaction.id == fn.getEmoji(client, "red_tick").id) {
      // SETUP TIME
      let timeSuccess = false
      while (!timeSuccess) {
        let timePrompt = await message.author.send(
          new Discord.RichEmbed()
            .setTitle("Custom Game Setup")
            .setDescription(
              `Select the length of night, day and voting periods.\n` +
              `Maxiumum of each period is 120 seconds and minimum is 1 second.\n` +
              `Input as \`night day voting\` in seconds. (default: \`45 60 45\`)`
            )
        )

        let timeInput = await timePrompt.channel
          .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
          .catch(() => {})
        if (!timeInput)
          return await message.author.send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("Prompt timed out.")
          )
        timeInput = timeInput.first().content.split()
        if (isNaN(parseInt(timeInput[0])) || isNaN(parseInt(timeInput[1])) || isNaN(parseInt(timeInput[2])) ||
            timeInput[0] > 120 || timeInput[1] > 120 || timeInput[2] > 120 ||
            timeInput[0] < 1 || timeInput[1] < 1 || timeInput[2] < 1) {
          await message.author.send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("Invalid input.")
          )
          continue;
        }
        [currentGame.config.nightTime, currentGame.config.dayTime, currentGame.config.votingTime] = timeInput
        timeSuccess = true
      }
      
      // SETUP TIME
      let revealSuccess = false
      while (!revealSuccess) {
        let revealPrompt = await message.author.send(
          new Discord.RichEmbed()
            .setTitle("Custom Game Setup")
            .setDescription(
              `Select the length of night, day and voting periods.\n` +
              `Maxiumum of each period is 120 seconds and minimum is 1 second.\n` +
              `Input as \`night day voting\` in seconds. (default: \`45 60 45\`)`
            )
        )
        
        await revealPrompt.react(fn.getEmoji(client, 'green tick'))
        await revealPrompt.react(fn.getEmoji(client, 'red tick'))
        let rReactions = revealPrompt.awaitReaction(
          (r, u) =>
            (r.emoji.id == fn.getEmoji(client, "green_tick").id ||
              r.emoji.id == fn.getEmoji(client, "red_tick").id) &&
            u.id == message.author.id,
          { time: 30*1000, max: 1, errors: ['time'] }
        ).catch(() => {})
        if (!rReactions)
          return await message.author.send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("Prompt timed out.")
          )
        let rReaction = rReactions.first().emoji
        if (rReaction.emoji.id == fn.getEmoji(client, "green_tick").id) currentGame.config.deathReveal = true
        else currentGame.config.deathReveal = false
      }
    }
    
    await message.author.send(
      new Discord.RichEmbed()
        .setTitle('Created new Custom Game!')
        .setDescription(
          `**Lobby Name:** ${currentGame.name}\n` +
          `**Game Code:** ${currentGame.gameID.replace(/_/g, "\\_")}\n` +
          `**Game Roles:** ${currentGame.originalRoles.map(x => fn.getEmoji(client, x)).join('')}`
        )
        .addField(
          'Configuration',
          `**Time:** Night ${currentGame.config.nightTime}s / Day ${currentGame.config.dayTime}s / Day ${currentGame.config.dayTime}s\n` +
          `**Death Reveal:** ${currentGame.config.deathReveal}`
        )
    )
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.RichEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    )
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}