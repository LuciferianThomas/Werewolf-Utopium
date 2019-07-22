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
      config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js'),
      userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  console.log(fn.date() + " Ping Received");
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

const tempmutes = require('/app/bot/tempmute.js')(client)
const botlog = require('/app/bot/botlog.js')(client)

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token)

const logs = require('./util/logging.js')

client.on('ready', () => {
  console.log(`[INFO] ${client.user.username} is up!`)
	client.user.setPresence({
		status: 'online',
		game: {
			name: `for ${config.defaultPrefix}help`,
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
      prefix: config.defaultPrefix,
      blacklisted: false,
      commandsUsed: 0,
      createdTimestamp: moment()
    }
    guildData.set(message.guild.id, newGuildData)
  }
  let guild = guildData.get(message.guild.id)
  
  const msg = message.content.toLowerCase()
  
  const prefix = guild.prefix || config.defaultPrefix,
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
  shared.defaultPrefix = config.defaultPrefix
  shared.embedColor = config.embedColor

  try {
    await command.run(client, message, args, shared)
  } catch (error) {
    console.log(error)
  }

  message.delete().catch()
	
})






// UNRELATED

const https = require('https'),
      striptags = require("striptags")

let csvstring = ""

function calcPolygonArea(X, Y, numPoints) { 
  let area = 0         // Accumulates area in the loop
  let j = numPoints-1  // The last vertex is the 'previous' one to the first

  for (let i=0; i<numPoints; i++)
    { area = area +  (X[j]+X[i]) * (Y[j]-Y[i]) 
      j = i  //j is previous vertex to i
    }
  return Math.abs(area/2)
}

var req = https.request({
    host: 'earthmc.net',
    path: '/map/tiles/_markers_/marker_earth.json'
}, res => {
  var data = ''
  res.on('data', chunk => {
    data += chunk
  })

  res.on('end', () => {
    data = JSON.parse(data);
    
    let townData = data.sets['towny.markerset'].areas
    let townNames = Object.keys(townData)
    
    let towns = {}
    for (let i = 0; i < townNames.length; i++) {
      let town = townData[townNames[i]]
      let rawinfo = town.desc.split("<br />")
      let info = []
      rawinfo.forEach(x => {
        info.push(striptags(x))
      })
      towns[info[0].split(" (")[0]] = {
        area: calcPolygonArea(town.x, town.z, town.x.length)/16/16,
        x: town.x[0],
        z: town.z[0],
        name: info[0].split(" (")[0],
        nation: info[0].split(" (")[1].slice(0, -1),
        mayor: info[1].slice(7),
        residents: info[2].slice(12).split(', '),
        flags: {
          hasUpkeep: info[4].slice('hasUpkeep: '.length),
          pvp: info[5].slice('pvp: '.length),
          mobs: info[6].slice('mobs: '.length),
          public: info[7].slice('public: '.length),
          explosion: info[8].slice('explosion: '.length),
          fire: info[9].slice('fire: '.length),
          capital: info[10].slice('capital: '.length),
        }
      }
      let thisTown = towns[info[0].split(" (")[0]]
      if (thisTown.name.endsWith("(Shop)")) continue;
      if ((thisTown.x >= 23700 && thisTown.z >= -800 && thisTown.z <= 2048) || (thisTown.x >= 20000 && thisTown.z >= 2048 && thisTown.z <= 10000)) csvstring += `${thisTown.name},${thisTown.residents.length},${thisTown.area},${thisTown.nation==''?'Independent':thisTown.nation}\n`
    }
    console.log(csvstring)
  })
})

req.on('error', e => {
  console.log(e.message)
});

req.end()