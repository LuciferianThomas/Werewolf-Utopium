const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    let logChannelID = guildData.get(`${newMember.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    // Check for given roles
    newMember.roles.forEach(role => {
      if (!oldMember.roles.find(r => r.id == role.id)) {
        return logChannel.send(
          new Discord.RichEmbed()
            .setColor(config.embedColor)
            .setAuthor("Role Given", newMember.guild.iconURL)
            .setIcon(newMember.user.displayAvatarURL)
            .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`, true)
            .addField("Role", `${role} (${role.name})`, true)
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp()
        )
      }
    })
    
    // Check for removed roles
    oldMember.roles.forEach(role => {
      if (!newMember.roles.find(r => r.id == role.id)) {
        return logChannel.send(
          new Discord.RichEmbed()
            .setColor(config.embedColor)
            .setAuthor("Role Removed", newMember.guild.iconURL)
            .setIcon(newMember.user.displayAvatarURL)
            .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`, true)
            .addField("Role", `${role} (${role.name})`, true)
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp()
        )
      }
    })
    
    if (oldMember.user.tag != newMember.user.tag) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Tag Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `${oldMember.user.tag}`, true)
        .addField("After", `${newMember.user.tag}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldMember.nickname != newMember.nickname) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Member Nickname Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `${oldMember.nickname ? oldMember.nickname : oldMember.user.username}`, true)
        .addField("After", `${newMember.nickname ? newMember.nickname : newMember.user.username}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldMember.user.avatarURL != newMember.user.avatarURL) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Avatar Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `[Link](${oldMember.user.avatarURL})`, true)
        .addField("After", `[Link](${newMember.user.avatarURL})`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldMember.deaf != newMember.deaf) {
      if (newMember.deaf) return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Deafened")
          .setIcon(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
      else return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Deafened")
          .setIcon(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Updated")
        .setDescription("Something changed, but I'm not sure...")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}

/*
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.user.bot) return;
    
    let guild = await guildData.fetch(newMember.guild.id)
    if (!guild) return;
    let botlog = newMember.guild.channels.find(r => r.id == guild.botlog)
    if (!botlog) return;
    //declare changes
    var Changes = {
        unknown: 0,
        addedRole: 1,
        removedRole: 2,
        username: 3,
        nickname: 4,
        avatar: 5,
    }
    var change = Changes.unknown;

    //check if roles were removed
    var removedRole = ''
    oldMember.roles.forEach(value => {
      if (!newMember.roles.find(r => r.id == value.id)) {
        change = Changes.removedRole;
        removedRole = value;
      }
    })

    //check if roles were added
    var addedRole = ''
    newMember.roles.forEach(function(value) {
      if (!oldMember.roles.find(r => r.id == value.id)) {
        change = Changes.addedRole;
        addedRole = value;
      }
    })

    //check if username changed
    if (newMember.user.username != oldMember.user.username)
      change = Changes.username

    //check if nickname changed
    if (newMember.nickname != oldMember.nickname)
      change = Changes.nickname;

    //check if avatar changed
    if (newMember.user.avatarURL != oldMember.user.avatarURL)
      change = Changes.avatar;

    switch (change) {
      case Changes.unknown:
			  embed = new Discord.RichEmbed()
			    .setTitle('User Updated')
			    .setColor(0xe86ae8)
			    .addField("Member", `${newMember}`)
          .setTimestamp()
        botlog.send(embed)
        break;
        
      case Changes.addedRole:
			  embed = new Discord.RichEmbed()
			    .setTitle('Given Role')
			    .setColor(0xe86ae8)
          .addField("Member", `${newMember}`, true)
          .addField("Role", `${addedRole}`, true)
    			.setTimestamp()
        botlog.send(embed);
				break;
        
      case Changes.removedRole:
			  embed = new Discord.RichEmbed()
		    	.setTitle('Removed Role')
		    	.setColor(0xe86ae8)
          .addField("Member", `${newMember}`, true)
          .addField("Role", `${removedRole}`, true)
	    		.setTimestamp()
        botlog.send(embed);
        break;
        
      case Changes.username:
			  embed = new Discord.RichEmbed()
			    .setTitle('Username Updated')
			    .setColor(0xe86ae8)
			    .setTimestamp()
			    .addField("User",`${newMember}`)
			    .addField('Before', oldMember.user.tag, true)
			    .addField('After', newMember.user.tag, true)
			  botlog.send(embed)
        break;
        
      case Changes.nickname:
			  embed = new Discord.RichEmbed()
			    .setTitle('Nickname Updated')
			    .setColor(0xe86ae8)
			    .setTimestamp()
			    .addField(`User`, `${newMember}`)
			    .addField('Before', oldMember.nickname, true)
			    .addField('After', newMember.nickname, true)
			  botlog.send(embed)
        break;
        
      case Changes.avatar:
			  embed = new Discord.RichEmbed()
			    .setTitle('Avatar Changed')
			    .setColor(0xe86ae8)
			    .setTimestamp()
			    .addField(`User`,`${newMember}`)
			    .addField('Before', `[link](${oldMember.user.avatarURL})`, true)
			    .addField('After', `[link](${newMember.user.avatarURL})`, true)
			  botlog.send(embed)
        break;
    } 
  })
*/