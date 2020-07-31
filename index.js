/* --- ALL PACKAGES --- */

require('dotenv').config({ debug: true })
require('es6-shim')

const Discord = require('discord.js'),
      fs = require("fs"),
      moment = require('moment'),
      fetch = require('node-fetch'),
      db = require("quick.db"),
      os = require('os'),
      cron = require('cron'),
      cmd = require("node-cmd")


const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames,
      temp = new db.table("temp"),
      logs = new db.table("Logs")

const roles = require("/home/utopium/wwou/util/roles.js"),
      tags = require("/home/utopium/wwou/util/tags.js")

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */
const client = new Discord.Client(),
      CronJob = cron.CronJob,
      config = require('/home/utopium/wwou/util/config.js'),
      fn = require('/home/utopium/wwou/util/fn.js')

client.on("debug", x => console.log(x))

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token).then(() => {
  console.log(`Werewolf Utopium bot has logged in.`)
  fn.addLog(`MAIN`, `Werewolf Utopium bot has logged in.`)
})

client.once('ready', async () => {
  client.guilds.cache
        .get("522638136635817986")
        .members.cache.get("600088200828026957").roles.add("669856493688061972")
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
  fn.addLog(`MAIN`, `Werewolf Utopium bot is now ready.`)
  
  client.user.setPresence({ activity: { name: 'Werewolf Online' , type: "PLAYING"}, status: 'online' })

  require('/home/utopium/wwou/process/game.js')(client)
  
  //alert players in game if w!restart or auto-restart was used
  let gamealert = temp.get("gamealert")
  if (gamealert) {
    let Games = games.get("quick")
    let activeGames = Games.filter(game => game.currentPhase < 999)
    if (!activeGames.length) return
    activeGames.forEach(game => {
      // console.log(game.players)
      if (!game.players.length) return;
      game.players.forEach(p =>
        client.users.cache
          .get(p.id)
          .send(
            "The bot has finished rebooting. Enjoy your game!"
          )
      )
      fn.addLog(game, "Restart complete")
      fn.addLog(game, "-divider-")
    })
    temp.delete("gamealert")
  }
  //respond to w!restart command
  let rebootchan = temp.get("rebootchan")
  if(rebootchan){
    temp.delete("rebootchan")
    client.channels.cache.get(rebootchan).send("Bot has successfully been restarted!").catch(() => temp.delete("rebootchan"))
  }
  
  //Setup auto-restart job
  const autoRestart = new CronJob("0 */6 * * *", async function() {
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    let activeGames = Games.filter(game => game.currentPhase < 999)
    if (!activeGames.length) {
      temp.set("gamealert", false)
    } else {
      activeGames.forEach(game => {
        if (!game.players.length) return
        game.players.forEach(p =>
          client.users.cache
            .get(p.id)
            .send(
              "The bot is currently rebooting. It will not respond until it has finished. Don't worry, your game will pick back up right where it left off!"
            )
        )
        fn.addLog(game, "-divider-")
        fn.addLog(game, `Automatic bot restart in progress.`)
      })
      temp.set("gamealert", true)
    }
    fn.addLog("MAIN", `Automatic bot restart in progress.`)
    await fn.sleep(5000)
    client.user.setStatus("offline")
    cmd.run("pm2 restart WWOU")
  })
  
  //start auto-restart job
  autoRestart.start();
  
  //Check if there are logs that need to be written
  setInterval(() => {
    let alllogs = logs.all()
    if (alllogs.length) {
      alllogs.forEach(log => {
        fn.writeLogs(log.ID)
      })
      fn.addLog(`MAIN`, `Logs have been written for ${alllogs.map(log => log.ID)}`)
    }
  }, 120000) //2 minutes
  
  // UPDATE PROGRESS CHANNEL
  let prog = client.channels.cache.get("658942985853206531")
  
  let wwoRoles = Object.values(roles).filter(r => r.tag & tags.ROLE.WWO_ROLE || r.name.includes("Random"))
  let wwoRoleProg = await prog.messages.fetch("704516854655352842")
  let newWWORoleEmbed =
    new Discord.MessageEmbed()
      .setColor(0x7289da)
      .setTitle("Roles")
      .setFooter("Last Updated")
      .setTimestamp()
  if (wwoRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).slice(0, 25))
    newWWORoleEmbed
      .addField(
        `**${fn.getEmoji(client, "green tick")} Available**`,
        wwoRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).slice(0, 25).join(" "),
        true
      )
  if (wwoRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).slice(25))
    newWWORoleEmbed
      .addField(
        `\u200B`,
        wwoRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).slice(25).join(" "),
        true
      )
  if (wwoRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).length)
    newWWORoleEmbed
      .addField(
        `**${fn.getEmoji(client, "gray tick")} To Be Tested**`,
        wwoRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  if (wwoRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).length)
    newWWORoleEmbed
      .addField(
        `**${fn.getEmoji(client, "red tick")} Unavailable**`,
        wwoRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  wwoRoleProg.edit(newWWORoleEmbed)
  
  let wwcRoles = Object.values(roles).filter(r => r.tag & tags.ROLE.WWC_ROLE)
  let wwcRoleProg = await prog.messages.fetch("704516933445353495")
  let newWWCRoleEmbed =
    new Discord.MessageEmbed()
      .setColor(0x7289da)
      .setTitle("Classic Roles")
      .setFooter("Last Updated")
      .setTimestamp()
  if (wwcRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).length)
    newWWCRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "green tick")} Available**`,
        wwcRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).join(" "),
      )
  if (wwcRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).length)
    newWWCRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "gray tick")} To Be Tested**`,
        wwcRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  if (wwcRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).length)
    newWWCRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "red tick")} Unavailable**`,
        wwcRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  wwcRoleProg.edit(newWWCRoleEmbed)
  
  let otherRoles = Object.values(roles).filter(r => r.tag & (tags.ROLE.WWOWC_ROLE | tags.ROLE.OTHER_ROLE))
  let otherRoleProg = await prog.messages.fetch("704516981918924850")
  let newOtherRoleEmbed =
    new Discord.MessageEmbed()
      .setColor(0x7289da)
      .setTitle("Other Roles")
      .setFooter("Last Updated")
      .setTimestamp()
  if (otherRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).length)
    newOtherRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "green tick")} Available**`,
        otherRoles.filter(r => r.tag & tags.ROLE.AVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).join(" "),
      )
  if (otherRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).length)
    newOtherRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "gray tick")} To Be Tested**`,
        otherRoles.filter(r => r.tag & tags.ROLE.TO_BE_TESTED).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  if (otherRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).length)
    newOtherRoleEmbed
      .addField(
        `**${fn.getEmoji(client, "red tick")} Unavailable**`,
        otherRoles.filter(r => r.tag & tags.ROLE.UNAVAILABLE).map(r => `${fn.getEmoji(client, r.name)}`).join(" ")
      )
  otherRoleProg.edit(newOtherRoleEmbed)
  
  setInterval(async () => {
    let serverStats = await client.channels.cache.get("640533861154947082").messages.fetch("705294118733086781")
    let serverStatsEmbed = new Discord.MessageEmbed()
      .setColor(0x7289da)
      .setTitle("Statistics")
      .setDescription(
        `**Player Count**: ${players.all().length}\n` +
        `**Games Count**: ${games.get("quick").length} (${games.get("quick").filter(g => g.currentPhase < 999 && g.currentPhase >= 0).length} Active)\n` +
        `> ${games.get("quick").filter(g => g.mode == "quick").length} Quick Games\n` +
        `> ${games.get("quick").filter(g => g.mode == "sandbox").length} Sandbox Games\n` +
        `> ${games.get("quick").filter(g => g.mode == "ranked").length} Ranked Games\n` +
        `> ${games.get("quick").filter(g => g.mode == "custom" && !g.gameID.match(/^(dev|beta)test_/i)).length} Custom Games\n` +
        `> ${games.get("quick").filter(g => g.mode == "custom" && g.gameID.match(/^betatest_/i)).length} Test Games\n` +
        `**Roles Count**: ${Object.values(roles).length}\n` +
        `> ${Object.values(roles).filter(r => r.tag & tags.ROLE.AVAILABLE).length} Available\n` +
        `> ${Object.values(roles).filter(r => r.tag & tags.ROLE.TO_BE_TESTED).length} To Be Tested\n` +
        `> ${Object.values(roles).filter(r => r.tag & tags.ROLE.UNAVAILABLE).length} Unavailable\n` +
        `**Member Count**: ${prog.guild.members.cache.size}\n` +
        `> ${prog.guild.members.cache.filter(m => !m.user.bot).size} Humans (${prog.guild.members.cache.filter(m => !m.user.bot && m.user.presence.status !== "offline").size} Online)\n` +
        `> ${prog.guild.members.cache.filter(m => m.user.bot).size} Bots\n` +
        `\n\n[Jump to Top](https://discordapp.com/channels/522638136635817986/640533861154947082/680260825952288782)`
      )
      //.addField
      .setFooter("Updated")
      .setTimestamp()
    serverStats.edit(serverStatsEmbed)
  }, 1000*60*1)
  
 // setInterval(() => {
    // let cpu = process.cpuUsage().system + process.cpuUsage().user
    // let cpupercent = cpu / parseInt(fs.readFileSync('/sys/fs/cgroup/cpu/cpu.cfs_period_us').toString(),10)
    // console.log(cpupercent)
 // }, 10000)
})

client.on('inviteCreate', async invite => {
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
})
client.on('inviteDelete', async invite => {
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
})

client.on('guildMemberAdd', async member => {
  let guildInvites = await member.guild.fetchInvites()
  const oldinv = client.allinvites
  client.allinvites = guildInvites
  const invite = guildInvites.find(inv => inv.uses > oldinv.get(inv.code).uses)
  const inviter = client.users.cache.get(invite.inviter.id)
  if(!inviter) return
  if(!players.get(member.user.id)) players.set(member.user.id, {
    xp: 0,
    coins: 0,
    roses: 0,
    gems: 0,
    currentGame: null,
    wins: [],
    loses: [],
    suicides: 0,
    inventory: {},
    invBy: inviter.id
  })
  if(players.get(member.user.id+".invite")) return //already joined and has invite
  players.set(member.user.id+".invite", invite)
  await member.guild.channels.cache
    .get("700150278413877309")
    .send(
      `${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`
    )
})


client.on('message', async message => {
  
  if (message.author.bot) return;
  
  let me = players.get(message.author.id)
  if (me && me.afk) {
    players.delete(`${message.author.id}.afk`)
    message.channel.send("You are no longer AFK.")
  }
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = "w!"
  
  let shared = {}
    
  if (message.content.toLowerCase().startsWith(prefix)) {
    
    let args = message.content.trim().slice(prefix.length).split(/\s+/u)
    shared.prefix = prefix
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
    if (!players.get(message.author.id) || !nicknames.get(message.author.id)) {
      let player = players.get(message.author.id) || {
        xp: 0,
        coins: 0,
        roses: 0,
        gems: 0,
        currentGame: null,
        wins: [],
        loses: [],
        suicides: 0,
        inventory: {},
        invite: null
      }
      
      await message.channel.send("Please check your DMs!")
       
      let m = await message.author.send(
        new Discord.MessageEmbed()
          .setTitle("Please choose a username to proceed.")
          .setDescription("You have 1 minute to respond.")
      ).catch(() => {})
      if (!m) return await message.channel.send("I cannot DM you!")
      
      let input
      while (!input) {
        let response = await m.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 60*1000, errors: ["time"] }).catch(() => {})
        if (!response) return await m.channel.send("Question timed out.")
        response = response.first().content
        
        let usedNicknames = nicknames.all().map(x => x.data.toLowerCase())
        
        if (response.match(/^[a-z0-9\_]{3,14}$/i) && !usedNicknames.includes(response.toLowerCase()))
          input = response.replace(/_/g, "\\_")
        else if (response.length > 14)
          await m.channel.send("This username is too long!")
        else if (response.length < 3)
          await m.channel.send("This username is too short!")
        else if (!response.match(/^[a-z0-9\_]{3,14}$/i))
          await m.channel.send("This username contains invalid characters! Only alphanumerical characters or underscores are accepted.")
        else if (usedNicknames.includes(response.toLowerCase()))
          await m.channel.send("This username has been taken!")
        else
          await m.channel.send("Invalid username. Please try again.")
      }
      
      nicknames.set(message.author.id, input)
      player.lastNick = moment()
      
      players.set(message.author.id, player)
      message.author.send("Nickname set! I am now running the original command")
    }
    
    if (players.get(`${message.author.id}.banned`) && !['help','role'].includes(commandName)) {
      let {reason, until} = players.get(`${message.author.id}.banned`)
      return await message.author.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("You have been blacklisted from Werewolf Utopium!")
          .setDescription(
            `**Reason**: ${reason}\n` +
            `**Ban expires**: ${fn.utcTime(until)}`
          )
          .setFooter(`If you think you are incorrectly blacklisted, please contact Werewolf Utopium moderators.`)
      )
    }
    message.delete().catch(error => {})
		try {
			await command.run(client, message, args, shared)
      if (players.get(`${message.author.id}.prompting`))
        players.delete(`${message.author.id}.prompting`)
		} catch (error) {
                        console.error(error)
			await client.channels.cache.get("664285087839420416").send(
        new Discord.MessageEmbed()
          .setDescription(
            `An error occured when ${message.author} attempted the following command: \`${
              message.content.replace(/(`)/g, "\$1")
            }\``
          )
          .addField( //this literally looks like a headdesk on a keyboard to me 😂 ~shadow
            "Error Description",
            `\`\`\`${error.stack.replace(/(?:(?!\n.*?\(\/home\/utopium\/wwou.*?)\n.*?\(\/.*?\))+/g, "\n\t...")}\`\`\``
          )
      )
      
      await message.channel.send(`${fn.getEmoji(client, "red_tick")} An error occurred when trying to execute this command. Please contact staff members.`)
		}
    
	}
})

client.on('message', async message => {  
  if (message.author.bot || message.channel.type !== 'dm') return;
  console.log(message.author.tag + ' | ' + message.cleanContent)
  if(client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id) && client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.has("724915871583305788")) return message.author.send("Please complete verification before using the bot!")
  
  let player = players.get(message.author.id)
  if (!player || !player.currentGame) return;
  
  let QG = games.get("quick")
  let game = QG.find(game => game.gameID == player.currentGame)
  if (!game) return undefined;
  let gamePlayer = game.players.find(player => player.id == message.author.id)

  if (gamePlayer) {
    gamePlayer.lastAction = moment()
    gamePlayer.prompted = false
  }
  games.set("quick", QG)
  
  if (message.channel.type !== "dm" || message.author.bot) return;
  if (message.content.toLowerCase().startsWith('w!') || message.content.toLowerCase() == "w!") return;
  if (player.prompting) return;
  
  let pastMessages = (await message.channel.messages.fetch({ limit: 30 })).filter(m => m.author.id == message.author.id).first(6)
  if (pastMessages.length == 6 && new Date(pastMessages[pastMessages.length-1].createdTimestamp + 5000) >= new Date()) {
    await message.channel.send("Your message is not sent for the following reason: **You are sending messages too fast.**")
    client.channels.cache.get("699144758525952000").send(
      new Discord.MessageEmbed()
        .setTitle(`**${nicknames.get(message.author.id)}** (${message.author.id}) was auto-warned in ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}.`)
        .addField("Reason", "Sending messages too fast")
    )
    fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was sending messages too fast!`)
    return undefined
  }

  let input = message.cleanContent
  let origInput = message.cleanContent
  
  input = input.replace(/\\?\|\\?\|(.|\s)*?\\?\|\\?\|/g, "$1")
      .replace(/\\?~\\?~(.|\s)*?\\?~\\?~/g, "$1")
      .replace(/\\?\*\\?\*\\?\*(.|\s)*?\\?\*\\?\*\\?\*/g, "$1")
      .replace(/\\?\*\\?\*(.|\s)*?\\?\*\\?\*/g, "$1")
      .replace(/\\?\*(.|\s)*?\\?\*/g, "$1")
      .replace(/\\?_\\?_(.|\s)*?\\?_\\?_/g, "$1")
      .replace(/\\?_(.|\s)*?\\?_/g, "$1")
      .replace(/\\?`\\?`\\?`(?:([^\s]*?\n)?(.+?)|((.|\s)*?))\\?`\\?`\\?`/g, "$1$2")
      .replace(/\\?`((?!w\!).*?)\\?`/gi, "$1")
      .replace(/^\\?>\s*/gm, "")
      .replace(/\\?<(?:#|@|@&)[^\s]*?>/g, "")
      .replace(/(https?:\/\/)?((([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+\.)+([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+|localhost)(:\d+)?(\/[^\s]*)*/gi, "")
  
  let bwlA = ["sex","s3x","horny","pussy","arse","penis","vagina","viagra",
              "dick","cock","dicc","cocc","nigg","niga","masterbate","anal","anus",
              "jerk off","jack off","jerkoff","jackoff","semen","a\\$\\$",
              "n1g","c0c","dumbass","asshole","butthole","nazi"]
             // ["fuck","fuk","fak","fck","shit","shat","sex","s3x","horny",
             //  "pussy","arse","penis","vagina","viagra","dick","cock","dicc","fucc",
             //  "cocc","nigg","niga","masterbate","anal","anus","jerk off","jack off",
             //  "jerkoff","jackoff","corona","piss","semen","a\\$\\$","n1g","c0c",
             //  "c0rona","cor0na"] // filter regardless
  let bwlB = ["nig","cum","ass"] // filter if individual word 
  let censor = "*************".split('').join("*******************************").replace(/\*/g, "\\*") // censor characters
  let beforePC = input
  input = input.replace(new RegExp(`(?<=[^\\s]*?(?:${bwlA.join('|')})[^\\s]*?)[^\\s]`,"gi"), "\\*")
    .replace(new RegExp(`(${bwlA.join('|')}|${bwlB.map(x => `\\b${x}\\b`).join('|')})`,"gi"), x => censor.substring(0, x.length*2))
  if (beforePC !== input) {
    await message.channel.send("You are auto-warned for the following reason: **Please refrain from using profanity!**")
    client.channels.cache.get("699144758525952000").send(
      new Discord.MessageEmbed()
        .setTitle(`**${nicknames.get(message.author.id)}** (${message.author.id}) was auto-warned in ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}.`)
        .setDescription(message.content)
        .addField("Reason", "Profanity")
    )
    fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was sending profanity!`)
  }
      
  input = input.split(/\n/g)
  origInput = origInput.split(/\n/g)
  
  if (input.length > 5) {
    await message.channel.send("Your message is not sent for the following reason: **Too many lines in one message.**")
    client.channels.cache.get("699144758525952000").send(
      new Discord.MessageEmbed()
        .setTitle(`**${nicknames.get(message.author.id)}** (${message.author.id}) was auto-warned in ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}.`)
        // .setDescription(message.content)
        .addField("Reason", "Too many lines in one message")
    )
    fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was sending too many lines in one message!`)
    return undefined
  }
  
  //console.log(input)
  for (var i = 0; i < input.length; i++) {
    var content = input[i]
  
    if (content.length > 250) {
      await message.channel.send("Your message is not sent for the following reason: **Your message is too long!** (Character limit: 250)")
      client.channels.cache.get("699144758525952000").send(
        new Discord.MessageEmbed()
          .setTitle(`**${nicknames.get(message.author.id)}** (${message.author.id}) was auto-warned in ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}.`)
          .setDescription(content)
          .addField("Reason", "Message too long")
      )
      fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was sending a message too long!`)
      continue;
    }
    
    if ((content.match(/[A-Z]/g)||[]).length.length >= (content.match(/[a-z]/g)||[]).length && content.length >= 10) {
      await message.channel.send("You are auto-warned for the following reason: **Please do not use too many capital letters!**")
      client.channels.cache.get("699144758525952000").send(
        new Discord.MessageEmbed()
          .setTitle(`**${nicknames.get(message.author.id)}** (${message.author.id}) was auto-warned in ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}.`)
          .setDescription(content)
          .addField("Reason","Too many caps")
      )
      fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was using too many caps!`)
      content = content.toLowerCase()
      // continue;
    }
    
    if (gamePlayer && gamePlayer.role == "Drunk" && game.currentPhase < 999) {
      content = content.split(/\s/g)
      for (var x = 0; x < Math.floor(Math.random()*content.length*2); x++) {
        let swapI1 = Math.floor(Math.random()*content.length)
        let swapI2 = Math.floor(Math.random()*content.length);
        [content[swapI1], content[swapI2]] = [content[swapI2], content[swapI1]]
      }
      content = content.join(" ")
    }
    
    if (content.trim().length == 0) continue;
    
    game = QG.find(game => game.gameID == player.currentGame)
    if (!game) return;
    
    if (i !== 0) await fn.wait(Math.ceil(content.length/10)*750)

    if (game.currentPhase == -1) {
      fn.broadcast(client, game, `${game.spectators.includes(message.author.id) ? "*" : ""}**${nicknames.get(message.author.id)}**${game.spectators.includes(message.author.id) ? "*: *" : ": "}${content}${game.spectators.includes(message.author.id) ? "*" : ""}`, [message.author.id], true)
      fn.addLog(game, `[PRE] ${nicknames.get(message.author.id)}${game.spectators.includes(message.author.id) ? " (Spectator)" : ""}: ${content}`)
      continue;
    }
    if (game.currentPhase == -.5){
      fn.addLog(game, `Message from ${nicknames.get(message.author.id)} was not sent as game was starting: ${content}`)
      return await message.author.send("Your message was not sent for the following reason: **The game is starting!**")
      // fn.addLog(game, `[WARN] ${nicknames.get(message.author.id)} was sending profanity!`)
    }
    
    if (game.currentPhase >= 999)
      if (gamePlayer.alive) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && p.id != message.author.id),
          `**${gamePlayer.number} ${nicknames.get(message.author.id)}** ${fn.getEmoji(client, gamePlayer.role)}: ${content}`, true
        )
        fn.addLog(game, `[POST] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer ? gamePlayer.role : ""}): ${content}`)
        continue;
      }
      else {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && p.id != message.author.id),
          `***${gamePlayer.number} ${nicknames.get(message.author.id)}*** ${game.spectators.includes(message.author.id) ? " (Spectator)" : ""} ${gamePlayer ? fn.getEmoji(client, gamePlayer.role) : ""}: *${content}*`, true
        )
        fn.addLog(game, `[POST][DEAD] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }

    if (gamePlayer && gamePlayer.mute && game.players[gamePlayer.mute-1].role == "Grumpy Grandma" && gamePlayer.alive) content = "..."
    if (gamePlayer && gamePlayer.mute && game.players[gamePlayer.mute-1].role == "Corruptor" && gamePlayer.alive) return;

    if (game.currentPhase % 3 != 0)
      if (gamePlayer.alive) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && p.id != message.author.id),
          `**${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`
        )
        fn.addLog(game, `[DAY] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }
      else if (!gamePlayer.alive && gamePlayer.boxed && game.players.find(p => p.role == "Soul Collector" && p.alive)) return undefined
      else if(game.spectators.includes(message.author.id)){
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && !p.alive && p.id != message.author.id),
          `***${gamePlayer.number} ${nicknames.get(message.author.id)} (Spectator)***: *${content}*`
        )
        fn.addLog(game, `[DEAD] ${gamePlayer.number} ${nicknames.get(message.author.id)} (Spectator): ${content}`)
        continue;
      } else {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && !p.alive && p.id != message.author.id),
          `***${gamePlayer.number} ${nicknames.get(message.author.id)}***${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: *${content}*`
        )
        fn.addLog(game, `[DEAD] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }
    if (game.currentPhase % 3 == 0) {
      if (!gamePlayer.alive && gamePlayer.boxed && game.players.find(p => p.role == "Soul Collector" && p.alive)) return undefined
      else if (!gamePlayer.alive) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && (!p.alive || (p.alive && !p.jailed && p.role == "Medium")) && p.id != message.author.id),
          `***${gamePlayer.number} ${nicknames.get(message.author.id)}***${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: *${content}*`
        )
        fn.addLog(game, `[MEDIUM] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }
      if (gamePlayer.role == "Medium" && gamePlayer.alive && !gamePlayer.jailed) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && (!p.alive || (p.alive && p.role == "Medium")) && p.id != message.author.id).map(p => p.id),
          `**Medium**: ${content}`
        )
        fn.addLog(game, `[MEDIUM] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }

      
      if (gamePlayer.jailed && gamePlayer.alive && game.players.find(p => p.role == "Jailer" && p.alive && !p.left)) {
        fn.getUser(client, game.players.find(p => p.role == "Jailer" && p.alive && !p.left).id).send(
          `${
            typeof content == "string" &&
            content.match(
              new RegExp(
                `\\b${game.players[game.originalRoles.indexOf("Jailer")].number}\\b`,
                "gi"
              )
            )
              ? `>`
              : ""
          }**${gamePlayer.number} ${nicknames.get(
            message.author.id
          )}**: ${content}`
        )
        fn.addLog(game, `[JAIL] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        continue;
      }

      if (gamePlayer.role == "Jailer" && gamePlayer.alive) { 
        if (game.players.find(p => p.jailed && p.alive)){
          fn.getUser(client, game.players.find(p => p.jailed && p.alive).id)
            .send(`**${fn.getEmoji(client, "Jailer")} Jailer**: ${content}`)
          fn.addLog(game, `[JAIL] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
        }
        else
          message.author.send("You did not jail anyone or your target cannot be jailed.")
        continue;
      }

      if (roles[gamePlayer.role].team == "Werewolves" && gamePlayer.role !== "Sorcerer" && !gamePlayer.jailed && gamePlayer.alive) {
        fn.broadcastTo(
          client,
          game.players
            .filter(p => roles[p.role].team == "Werewolves" &&
                    gamePlayer.role !== "Sorcerer" && !p.jailed && 
                    gamePlayer.id != p.id),
          `**${fn.getEmoji(client, "Fellow_Werewolf")} ${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`)
        fn.addLog(game, `[WOLF] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
      }

      if (roles[gamePlayer.role].team == "Zombies" && !gamePlayer.jailed && gamePlayer.alive) {
        fn.broadcastTo(
          client,
          game.players
            .filter(p => roles[p.role].team == "Zombies" &&
                    !p.jailed && 
                    gamePlayer.id != p.id),
          `**${fn.getEmoji(client, "Zombie")} ${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`)
        fn.addLog(game, `[ZOMB] ${gamePlayer.number} ${nicknames.get(message.author.id)} (${gamePlayer.role}): ${content}`)
      }
    }
  }
})

// AFK mentioning detector
client.on('message', async message => {
  if (message.author.bot) return;
  
  if(!message.mentions.members) return
  let mentions = message.mentions.members.map(x => x.id)
  let afkmentions = mentions.filter(x => {
    let player = players.get(`${x}`)
    if (player && player.afk) return true
    else return false
  })
  if (afkmentions.length)
  return await message.channel.send(
    new Discord.MessageEmbed()
      .setColor(0x888888)
      .setTitle("AFK Members")
      .setDescription(
        afkmentions.map(x => `**<@${x}> (${nicknames.get(x) ? nicknames.get(x) : client.users.cache.get(x).username})** | ${players.get(`${x}.afk`)}`).slice(0, 10).join('\n') +
        (afkmentions.length > 10 ? `\nand ${afkmentions.length-10} more...` : "")
      )
  )
})

client.on('message', async message => {
  if (message.channel.id !== "718418283312840814" && message.author.id !== "718413626079445082") return;
  let veri = message.content, [ _, code, check ] = veri.match(/(\d{6})\-(\d|A)/), checksum = 0
  for (var i = 0; i < code.length; i++) checksum += parseInt(code[i])
  if (check == "A") check = 10
  else check = parseInt(check)
  if (10-(checksum%11)!=check) return;
  // console.log("Received ping from Status bot")
  message.react("👍")
})

// SpyFall interaction
// client.on('message', async message => {
//   if (message.author.id !== "707402227005784074") return;
  
//   // if (message.content.startsWith(""))
// })

require("./server.js")(client)
