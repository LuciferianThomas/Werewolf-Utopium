/* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      db = require('quick.db')

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      defaultPrefix = "u!",
      embedColor = 0x708ad7,
      userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

let date = async (date = moment()) => {
  return moment(date).format("D MMM Y HH:mm [GMT]")
}

let send = async (content, config) => {
  let { client, message } = config
  if (content instanceof Discord.RichEmbed) {
    message.channel.send(content).catch(e => {
      message.author.send(content).then(message.author.send("*I need the `Embed Links` permission!*"))
        .catch(er => {
          message.channel.send("I need the `Embed Links` permission!").catch(console.error)
        })
    })
  } else if (content instanceof Object) {
    let { title, description } = content
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(description)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    message.channel.send(embed).catch(e => {
      message.channel.send(`**${title}**\n${description}\n\n*I need the \`Embed Links\` permission!`).catch(er => {
        message.author.send(embed).then(message.author.send("*I need the `Send Messages` and `Embed Links` permissions!*")).catch(console.error)
      })
    })
  } else if (typeof content == "string") {
    let embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(content)
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    message.channel.send(embed).catch(e => {
      message.channel.send(`${content}\n\n*I need the \`Embed Links\` permission!`).catch(er => {
        message.author.send(embed).then(message.author.send("*I need the `Send Messages` and `Embed Links` permissions!*")).catch(console.error)
      })
    })
  } else {
    // Error('Invalid output type.\nAccepts Discord.RichEmbed, Object or String.')
  }
  return undefined
}

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  console.log(date() + " Ping Received");
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  }, 225000);
});

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

client.login(token)

client.on('ready', () => {
  console.log(`[INFO] ${client.user.username} is up!`)
	client.user.setPresence({
		status: 'online',
		game: {
			name: `for ${defaultPrefix}help`,
      type: "WATCHING"
		}
	})
})

client.on('guildCreate', async guild => {
  if (!guildData.has(guild.id)) {
    let newGuildData = {
      prefix: defaultPrefix,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    guildData.set(guild.id, newGuildData)
  }
})

// for guilds
client.on('message', async message => {
  
  if (message.author.bot || message.channel.type != 'text') return;
  
  console.log(`${message.guild.name} #${message.channel.name} | ${message.author.tag} > ${message.cleanContent}`)
  
  if (!userData.has(message.author.id)) {
    let newUserData = {
      botStaff: false,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    userData.set(message.author.id, newUserData)
  }
  let user = userData.get(message.author.id)
  
  if (!guildData.has(message.guild.id)) {
    let newGuildData = {
      prefix: defaultPrefix,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    guildData.set(message.guild.id, newGuildData)
  }
  let guild = guildData.get(message.guild.id)
  
  const msg = message.content.toLowerCase()
  
  const prefix = guild.prefix || defaultPrefix,
        mention = `<@${client.user.id}> `,
        mention1 = `<@!${client.user.id}> `
  
  let shared = {}
  
  if (msg.startsWith(prefix) || msg.startsWith(mention) || msg.startsWith(mention1)) {
    
    var args
    
    if (msg.startsWith(prefix)) {
      args = message.content.slice(prefix.length).split(/\s+/u)
      shared.prefix = prefix
    } else if (msg.startsWith(mention)) {
      args = message.content.slice(mention.length).split(/\s+/u)
      shared.prefix = mention
    } else if (msg.startsWith(mention1)) {
      args = message.content.slice(mention1.length).split(/\s+/u)
      shared.prefix = mention1
    }
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
    if (command.botStaffOnly && !user.botStaff) return msg.reply("you do not have the permissions to use this command!")
    if (command.guildPerms && !message.member.hasPermission(command.guildPerms)) return msg.reply("you do not have the permissions to use this command!")
		
    shared.user = user
    shared.guild = guild
    shared.defaultPrefix = defaultPrefix
    shared.embedColor = embedColor
    shared.date = date
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch()
	}
})

// for DMs
client.on('message', async message => {
  
  if (message.author.bot || msg.channel.type != 'dm') return;
  
  console.log(`${message.author.tag} > ${message.cleanContent}`)
  
  if (!userData.has(message.author.id)) {
    let newUserData = {
      botStaff: false,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    userData.set(message.author.id, newUserData)
  }
  let user = userData.get(message.author.id)
  
  const msg = message.content.toLowerCase()
  
  let shared = {}
    
  var args = message.content.split(/\s+/u)
    
  const commandName = args.shift().toLowerCase()
  shared.commandName = commandName
  const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return;

  if (command.botStaffOnly && !user.botStaff) return msg.reply("you do not have the permissions to use this command!")
  if (command.guildPerms) return msg.reply("this command is only available on servers!")

  shared.user = user
  shared.defaultPrefix = defaultPrefix
  shared.embedColor = embedColor
  shared.date = date

  try {
    await command.run(client, message, args, shared)
  } catch (error) {
    console.log(error)
  }

  message.delete().catch()
	
})