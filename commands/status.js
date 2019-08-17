const Discord = require('discord.js'),
      db = require('quick.db')

const userData = new db.table("USERDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = {
  name: "status",
  usage: "status",
  description: "Bot information.",
  aliases: ["botstatus", "botinfo", "links", "invite"],
  category: "Utility",
  run: async (client, message, args, shared) => {

    let botStaff = userData.all().filter(i => typeof i.data == "string" ? JSON.parse(i.data).botStaff : i.data.botStaff).map(i => client.users.get(i.ID).tag)
    
    let m = await message.channel.send("Pinging...")
    
    let botLatency = Math.abs(m.createdTimestamp - message.createdTimestamp),
        ping = client.ping,
        memory = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)
    
    let embed = new Discord.RichEmbed()
      .setColor(shared.embedColor)
      .setTitle(`${client.user.username} | Information`)
      .setThumbnail(client.user.avatarURL)
      .addField("Name", client.user.username, true)
      .addField("Prefix", `Default: \`${shared.defaultPrefix}\`\nMention: ${client.user}\nServer: \`${shared.guild.prefix}\``, true)
      .addField(`Developer${botStaff.length > 1 ? "s" : ""}`, botStaff.join('\n'), true)
      .addField("Created", `${fn.date(client.user.createdAt)}\n${fn.ago(client.user.createdAt)}`, true)
      .addField("Servers", client.guilds.size, true)
      .addField("Users", client.users.size, true)
      .addField("Bot Latency", `${botLatency}ms`, true)
      .addField("Ping", `${Math.round(ping)}ms`, true)
      .addField("Memory Used", `${memory}MB`, true)
      .addField("Library", "discord.js", true)
      .addField("ID", client.user.id)
      .addField("Links", "[Invite](https://discordapp.com/api/oauth2/authorize?client_id=562910620664463365&permissions=2146958847&scope=bot)", true)
      .setFooter(client.user.username, client.user.avatarURL)
    
    m.delete()
    message.channel.send(embed)
  }
}