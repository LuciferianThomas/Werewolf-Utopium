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
      config = require('/app/util/config'),
      fn = require('/app/util/fn'),
      userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      botData = new db.table("BOTDATA")

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
  }, 225000)
});

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

const tempmute = require('/app/util/tempmute.js')(client)
const logs = require('/app/util/logging.js')(client)

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token)

client.on('ready', () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
	if (!botData.get('maintenance')) client.user.setPresence({
		status: 'online',
		game: {
			name: `for ${config.defaultPrefix}help`,
      type: "WATCHING"
		}
	})
  else client.user.setPresence({
		status: 'dnd',
		game: {
			name: `maintenance work`,
      type: "WATCHING"
		}
	})
})

client.on('guildCreate', async guild => {
  if (!guildData.has(guild.id)) {
    let newGuildData = {
      prefix: config.defaultPrefix,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    guildData.set(guild.id, newGuildData)
  }
})

client.on('guildMemberAdd', async member => {
  if (member.guild.id != "522638136635817986") return;
  
  member.guild.channels.get("640530363587887104").send(`${member} has entered Utopia!`)
})

client.on('guildMemberRemove', async member => {
  if (member.guild.id != "522638136635817986") return;
  
  member.guild.channels.get("640530363587887104").send(`**${member.user.username}** has sadly returned to`)
})

// for guilds
client.on('message', async message => {
  
  if (message.author.bot || message.channel.type != 'text') return;
  
  console.log(`${fn.time()} | ${message.guild.name} #${message.channel.name} | ${message.author.tag} > ${message.cleanContent}`)
  
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
      prefix: config.defaultPrefix,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    guildData.set(message.guild.id, newGuildData)
  }
  let guild = guildData.get(message.guild.id)
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = guild.prefix || config.defaultPrefix,
        mention = `<@${client.user.id}> `,
        mention1 = `<@!${client.user.id}> `
  
  let shared = {}
  
  if (message.content.startsWith(prefix) || message.content.startsWith(mention) || message.content.startsWith(mention1)) {
    
    var args
    
    if (msg.startsWith(prefix)) {
      args = message.content.trim().slice(prefix.length).split(/\s+/u)
      shared.prefix = prefix
    } else if (msg.startsWith(mention)) {
      args = message.content.trim().slice(mention.length).split(/\s+/u)
      shared.prefix = mention
    } else if (msg.startsWith(mention1)) {
      args = message.content.trim().slice(mention1.length).split(/\s+/u)
      shared.prefix = mention1
    }
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
    if (command.botStaffOnly && !user.botStaff) return message.channel.send(fn.embed(client, "You do not have permissions to use this command!"))
    if (command.guildPerms && !message.member.hasPermission(command.guildPerms)) return message.channel.send(fn.embed(client, "You do not have permissions to use this command!"))
		
    shared.user = user
    shared.guild = guild
    shared.defaultPrefix = config.defaultPrefix
    shared.embedColor = config.embedColor
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch(error => {})
	}
})

// for DMs
client.on('message', async message => {
  
  if (message.author.bot || message.channel.type != 'dm') return;
  
  console.log(`${fn.time()} | ${message.author.tag} > ${message.cleanContent}`)
  
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
  shared.defaultPrefix = config.defaultPrefix
  shared.embedColor = config.embedColor

  try {
    await command.run(client, message, args, shared)
  } catch (error) {
    console.log(error)
  }

  message.delete().catch()
	
})


/*


const 
			https = require('https');
var op = {
	host: 'namemc.com',
	path: '/profile/TCCGPlayz'
};
	
var req = https.request(op, res => {
		var data = '';
		res.on('data', chunk => {
			data += chunk;
		});

		res.on('end', () => {
			console.log(data);
		});
	})

	req.on('error', e => {
		console.log(e.message);
	});

	req.end();*/