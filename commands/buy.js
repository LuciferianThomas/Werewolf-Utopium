const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

module.exports = {
  name: "buy",
  aliases: ["purchase"],
  run: async (client, message, args) => {
    // let m = await message.channel.send("** **")
    let am = parseInt(args[args.length - 1], 10)
    if (!Number.isNaN(am)) args.pop()
    else am = 1
    
    let item = shop[args.join(" ").toLowerCase()],
        player = players.get(message.author.id)
    if (!item)
      return await message.channel.send(new Discord.MessageEmbed().setDescription(`${fn.getEmoji(client, "red_tick")} Invalid item`))
    
    if (item.unavailable && ![ "336389636878368770", "439223656200273932" ].includes(message.author.id))
      return await message.channel.send(new Discord.MessageEmbed().setDescription(`${fn.getEmoji(client, "red_tick")} That item is currently unavailable to purchase`))
    
    if (item.name === "Custom Maker" && players.get(`${message.author.id}.inventory.${item.itemid}`))
      return await message.channel.send(new Discord.MessageEmbed().setDescription(`${fn.getEmoji(client, "red_tick")} You already have the Custom Maker item!`))
    if (item.name === "Private Channel" && players.get(`${message.author.id}.inventory.${item.itemid}`))
      return await message.channel.send(new Discord.MessageEmbed().setDescription(`${fn.getEmoji(client, "red_tick")} You already have a private channel!`))
    if (item.name === "Custom Maker" && am > 1)
      am = 1
    if (item.name === "Clue") am = 1
    
    let role = null
    if(item.name === "Talisman"){
      let m = await message.channel.send(
        new Discord.MessageEmbed()
          .setTitle("Choose a role")
          .setDescription("What role do you want your talisman to be?")
          .setThumbnail(fn.getEmoji(client, "Talisman").url)
      )
      //message.channel.send("What role do you want your talisman to be?")
      let inputRole = await message.channel
        .awaitMessages(msg => msg.author.id == message.author.id, {
          time: 30 * 1000,
          max: 1,
          errors: ["time"]
        })
        .catch(() => {})

      if (!inputRole) return await m.edit(new Discord.MessageEmbed().setDescription("Timed out, please try again."))
      //inputRole.first().delete()
      inputRole = inputRole.first().content.replace(/(_|\s+)/g, " ")

      role = Object.values(roles).find(
        data =>
          data.name.toLowerCase().startsWith(inputRole.toLowerCase()) ||
          (data.abbr && data.abbr.includes(inputRole.toLowerCase()))
      )
      
      if (!role) 
        return await m.edit(
          new Discord.MessageEmbed().setDescription("Unknown role.")
        )
      if (role.name == "Accomplice")
        return await message.react(fn.getEmoji(client, "harold"))
    }

    let price = item.price * am
    let attachment = role ? (await fn.createTalisman(client, role.name)) : null
    
    let currency = item.currency
    let curremoji = currency == "coins" ? "Coin" : "Rose"
    if (player[currency] < price) {
      let embed = new Discord.MessageEmbed()
        .setTitle("Uh oh!")
        .setDescription(
          `You have insufficent coins to purchase ${am} ${item.name}${
            am > 1 ? "'s" : ""
          }. You have ${player[currency]} ${fn.getEmoji(
            client,
            curremoji
          )}, but you need ${price} ${fn.getEmoji(client, curremoji)}.`
        )
        .setThumbnail(
          item.name === "Talisman"
            ? "attachment://" + attachment.name
            : fn.getEmoji(client, item.emoji ? item.emoji : item.name).url
        )
      if (currency == "roses")
        embed.setFooter(
          "Only received roses count when purchasing items! You can check your balance in `w!profile`!"
        )
      return await message.channel.send(embed)
    }
    
    
    // await m.delete()
    let e2 = attachment ? new Discord.MessageEmbed().attachFiles([attachment]) : new Discord.MessageEmbed()
    let m = await message.channel.send(
      e2.setTitle("Confirmation")
        .setDescription(
          `Are you sure you want to purchase ${am} ${
            role ? role.name + " " : ""
          }${item.name}${am > 1 ? item.plural : ""} for ${price} ${fn.getEmoji(
            client,
            curremoji
          )}?\nYou currently have ${player[currency]} ${fn.getEmoji(
            client,
            curremoji
          )}`
        )
        .setThumbnail(
          item.name === "Talisman"
            ? "attachment://" + attachment.name
          : fn.getEmoji(client, item.emoji ? item.emoji : item.name).url+"?size=64"
        )
    )
    await m.react(fn.getEmoji(client, 'green tick'))
    await m.react(fn.getEmoji(client, 'red tick'))
    let reactions = await m.awaitReactions(
      (r, u) =>
      (r.emoji.id == fn.getEmoji(client, "green_tick").id ||
       r.emoji.id == fn.getEmoji(client, "red_tick").id) &&
      u.id == message.author.id,
      { time: 30*1000, max: 1, errors: ['time'] }
    ).catch(() => {})
    await m.reactions.removeAll().catch(()=>{})
    if (!reactions)
      return await m.edit(new Discord.MessageEmbed().setDescription("Timed out, please try again."))
    let reaction = reactions.first().emoji
    if (reaction.id == fn.getEmoji(client, "red_tick").id) return await m.edit(new Discord.MessageEmbed().setDescription("Purchase cancelled."))
    
    
    if(!["clue", "talisman", "private channel"].includes(item.itemid)) players.add(message.author.id+".inventory."+item.itemid, am)
    
    if (item.itemid == "custom maker")
      players.set(
        `${message.author.id}.custom`,
        ["Villager","Gunner","Doctor","Bodyguard","Seer","Jailer","Priest","Aura Seer","Medium",
         "Werewolf","Alpha Werewolf","Wolf Seer","Wolf Shaman","Fool","Headhunter","Serial Killer"]
      )

    if(item.itemid === "clue")
      message.author.send(fn.event())
    
    if(item.itemid === "talisman") players.add(message.author.id+".inventory."+item.itemid+"."+role.name, am)
    
    if(item.itemid === "private channel"){
      players.add(message.author.id+".inventory."+item.itemid, 1)
      let namePrompt = await message.channel.send(
        new Discord.MessageEmbed()
        .setTitle("Private Channel Setup")
        .setDescription(
          `Select a name for your new channel.`
        )
      )
      let nameInput = await namePrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
        .catch(() => {})
        if (!nameInput)
          return await message.channel.send(
            new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
          )
      name = nameInput.first().content
      nameInput.first().delete().catch(()=>{})
      let newchan = await client.guilds.cache.get("522638136635817986").channels.create(name.toLowerCase().replace(/[^a-z0-9-]/g, ''), {
        type: 'text',
        parent: "664378730503995402",
        topic: "Owner: " + message.author.tag,
        permissionOverwrites: [
          {
            id: message.author.id,
            allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES'],
            deny: ['MENTION_EVERYONE']
          },
          {id: message.guild.id, deny: ['VIEW_CHANNEL']}
        ],
      })
      await newchan.send(`${message.author}, welcome to your private channel! If you want to add any friends here, just edit the channel permissions!`)
      namePrompt.delete().catch(()=>{})
    }
    
    //players.subtract(message.author.id+".coins", price) 
    players.subtract(message.author.id+"."+currency, price)
    fn.addLog("items", `${nicknames.get(message.author.id)} purchased ${am} ${role ? role.name + " " : ""}${
            item.name
          }${am > 1 ? item.plural : ""}.`)
    // message.channel.send(`Success! You have purchased ${am} ${role ? role.name + " " : ""}${item.name}${am > 1 ? "s" : ""}`)
    let e3 = attachment ? new Discord.MessageEmbed().attachFiles([attachment]) : new Discord.MessageEmbed()
    e3.setTitle("Success!")
        .setDescription(
          `You have purchased ${am} ${role ? role.name + " " : ""}${
            item.name
          }${am > 1 ? item.plural : ""}.`
        )
        .setThumbnail(
          item.name === "Talisman"
            ? "attachment://" + attachment.name
            : fn.getEmoji(client, item.emoji ? item.emoji : item.name).url + "?size=64"
        )
    await message.channel.send(e3)
    
    
  }
}
