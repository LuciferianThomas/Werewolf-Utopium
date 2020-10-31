const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

// let fields = {
//   author: "Please input the Discord tags of the author(s) of the role.",
//   name: "What is the name of the role?",
//   iconURL: "What is the "
// }

module.exports = {
  name: "rt",
  run: async (client, message, args, shared) => {
    let [
      author,
      name,
      iconURL,
      aura,
      team,
      replaces,
      wincond,
      igd,
      ability,
      interactions,
      pros,
      cons,
      addInfo
    ] = message.content.slice(shared.commandName.length + 3).split(/ *?\| *?/g)
    
    let m = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(author)
        .setTitle(name)
        .setThumbnail(iconURL)
        .addField("Aura", `${fn.getEmoji(client, aura)} ${aura}`, true)
        .addField("Team", team, true)
        .addField("Replaces", replaces.replace(/\[(.*?)\]/gi, (m, g1) => {return `${fn.getEmoji(client, g1)} ${g1}`}))
        .addField("Win Condition", wincond)
        .addField("Game Description", igd)
        .addField("Abilties", ability.replace(/\[(.*?)\]/gi, (m, g1) => {return `${fn.getEmoji(client, g1)} ${g1}`}))
        .addField("Interactions", interactions.replace(/\[(.*?)\]/gi, (m, g1) => {return `${fn.getEmoji(client, g1)} ${g1}`}))
        .addField("Pros", pros)
        .addField("Cons", cons)
        .addField("Additional Information", addInfo ? addInfo.replace(/\[(.*?)\]/gi, (m, g1) => {return `${fn.getEmoji(client, g1)} ${g1}`}) : "*none*")
        // .setFooter("")
    )
    
    // await m.react(fn.getEmoji(client, "upvote"))
    // await m.react(fn.getEmoji(client, "downvote"))
  }
}
