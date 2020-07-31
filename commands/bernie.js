const Discord = require("discord.js"),
  moment = require("moment-timezone"),
  fn = require("/home/utopium/wwou-staff/util/fn"),
  Canvas = require("canvas")

module.exports = {
  name: "bernie",
  run: async (client, message, args, shared) => {
    const canvas = Canvas.createCanvas(500, 500)
    const ctx = canvas.getContext("2d")
    const background = await Canvas.loadImage(
      "https://cdn.glitch.com/982524cd-c5d8-43be-9bdc-9decfa8ff79b%2Fbernie.png?v=1591165513291"
    )
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    // const icon = await Canvas.loadImage(
    //   message.author.displayAvatarURL({ format: "png", size: 128 })
    // )
    // ctx.translate(canvas.width / 3, canvas.height / 3)
    // ctx.drawImage(icon, -icon.width / 3, -icon.height / 3)
    // ctx.translate(-canvas.width / 3, -canvas.height / 3)
    const result = await canvas.toBuffer()
    const attachment = await new Discord.MessageAttachment(result, "bernie.png")
    await message.channel.send(attachment)
  }
}
