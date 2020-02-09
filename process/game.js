const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = (client) => {
  setInterval( () => {
    let QuickGames = games.get("quick")

    for (let i = 0; i < QuickGames.length; i++) {
      let game = QuickGames[i]

      if (game.currentPhase < 999)
        game = require('./inactivity')(client, game)

      if (game.currentPhase === 999) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          new Discord.RichEmbed()
            .setTitle(game.mode == 'custom' ? game.name : `Game #${game.gameID}`)
            .addField(
              `Players`, 
              game.players.map(p => 
                `${p.number} ${nicknames.get(p.id)}${p.alive ? "" : " <:Death:668750728650555402>"} ${
                fn.getEmoji(client, p.role)}`
              ).join('\n')
            )
        )

        game.currentPhase++
        for (var j = 0; j < game.players.length; j++)
          players.set(`${game.players[j].id}.currentGame`, 0)
      }
      if (game.currentPhase == -1 || game.currentPhase >= 999) continue;

      if (moment(game.nextPhase) <= moment()) try { 
        if (game.currentPhase % 3 == 2 && !game.noVoting)  {
          let lynchVotes = game.players.filter(player => player.alive).map(player => player.vote),
              lynchCount = []
          for (var j = 0; j < lynchVotes.length; j++) {
            if (!lynchCount[lynchVotes[j]]) lynchCount[lynchVotes[j]] = 0
            lynchCount[lynchVotes[j]] += game.players.filter(player => player.alive)[j].role == "Mayor" ? 2 : 1
          }
          if (lynchCount.length) {
            let max = lynchCount.reduce((m, n) => Math.max(m, n))
            let lynched = [...lynchCount.keys()].filter(i => lynchCount[i] === max)
            if (lynched.length > 1 || lynchCount[lynched[0]] < Math.floor(game.players.filter(player => player.alive).length/2)) {
              fn.broadcastTo(
                client, game.players.filter(p => !p.left), 
                "The village cannot decide on who to lynch."
              )
            }
            else {
              lynched = lynched[0]
              let lynchedPlayer = game.players[lynched-1]

              lynchedPlayer.alive = false
              if (game.config.deathReveal) lynchedPlayer.roleRevealed = lynchedPlayer.role

              game.lastDeath = game.currentPhase
              fn.broadcastTo(
                client, game.players.filter(p => !p.left), 
                `**${lynched} ${nicknames.get(lynchedPlayer.id)}${
                  game.config.deathReveal ? ` ${fn.getEmoji(client, lynchedPlayer.role)}` : ""}** was lynched by the village.`
              )

              game = fn.death(client, game, lynchedPlayer.number)

              if (lynchedPlayer.role == "Fool") {
                game.currentPhase = 999
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  new Discord.RichEmbed()
                    .setTitle("Game has ended.")
                    .setThumbnail(fn.getEmoji(client, "Fool").url)
                    .setDescription(`Fool ${lynched} ${nicknames.get(lynchedPlayer.id)} wins!`)
                )
                fn.addXP(game.players.filter(p => p.number == lynched), 100)
                fn.addXP(game.players.filter(p => !p.left), 15)
                fn.addWin(game, [lynched], "Solo")
                continue;
              }
              if (lynchedPlayer.headhunter) {
                let headhunter = game.players[lynchedPlayer.headhunter-1]

                if (headhunter.alive) {
                game.currentPhase = 999
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  new Discord.RichEmbed()
                    .setTitle("Game has ended.")
                    .setThumbnail(fn.getEmoji(client, "Headhunter").url)
                    .setDescription(`Headhunter **${headhunter.number} ${nicknames.get(headhunter.id)}** wins!`)
                )
                fn.addXP(game.players.filter(p => p.number == headhunter.number), 100)
                fn.addXP(game.players.filter(p => !p.left), 15)
                fn.addWin(game, [headhunter.number], "Solo")
                continue;
                }
              }
            }
          } else
            fn.broadcastTo(
              client, game.players.filter(p => !p.left), 
              "The village cannot decide on who to lynch."
            )
        }
        else if (game.currentPhase % 3 == 2) game.noVoting = false

        game.currentPhase += 1
        game.nextPhase = moment().add(
          game.currentPhase % 3 == 0
            ? game.config.nightTime || 45
            : game.currentPhase % 3 == 1
            ? game.config.dayTime || 60
            : game.config.votingTime || 45,
          's'
        )

        if (game.currentPhase % 3 == 1)  {
          let revivedPlayers = game.players.filter(p => p.revive && p.revive.length)
          for (var x = 0; x < revivedPlayers.length; x++){
            fn.broadcastTo(
              client, game.players.filter(p => !p.left).map(p => p.id),
              `<:Medium_Revive:660667751253278730> Medium has revived **${revivedPlayers[x].number} ${nicknames.get(revivedPlayers[x].id)}**.`
            )

            game.players[revivedPlayers[x].number-1].alive = true
            for (var y of game.players[revivedPlayers[x].number-1].revive)
              game.players[y-1].revUsed = true
            game.players[revivedPlayers[x].number-1].revive = undefined
          }
          
          // RED LADY KILL
          let rls = game.players.filter(p => p.alive && p.role == "Red Lady" && p.usedAbilityTonight)
          for (var rl of rls) {
            if (roles[game.players[rl.usedAbilityTonight-1].role].team !== "Village") {
              rl.alive = false
              rl.roleRevealed = "Red Lady"
              game.lastDeath = game.currentPhase - 1
              
              fn.broadcastTo(
                client, game.players.filter(p => !p.left),
                `<:Red_Lady_LoveLetter:674854554369785857> **${rl.number} ${nicknames.get(rl.id)} ${fn.getEmoji(client, "Red Lady")
                }** visited an evil player and died!`
              )
            }
          }
          let sks = game.players.filter(p => p.alive && p.role == "Serial Killer" && p.usedAbilityTonight)
          let wwVotes = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.vote),
              wwRoles = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.role),
              wwVotesCount = []
          for (var j = 0; j < wwVotes.length; j++) {
            if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
            wwVotesCount[wwVotes[j]] += wwRoles[j] == "Alpha Werewolf" ? 2 : 1
          }
          let ggs = game.players.filter(p => p.alive && p.role == "Grumpy Grandma" && p.usedAbilityTonight)

          // SERIAL KILLER KILL
          for (var sk of sks) {
            let attacked = sk.usedAbilityTonight,
                attackedPlayer = game.players[attacked-1]

            if (attackedPlayer.protectors.length) {
              fn.getUser(client, sk.id).send(
                `**${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** cannot be killed!`
              )
              for (var x of attackedPlayer.protectors) {
                let protector = game.players[x-1]

                if (protector.role == "Bodyguard") {
                  protector.health -= 1
                  if (protector.health) {
                    fn.getUser(client, protector.id).send(
                      new Discord.RichEmbed()
                        .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                        .setDescription(
                          "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                        )
                    )
                  }
                  else {
                    game.lastDeath = game.currentPhase - 1
                    protector.alive = false
                    protector.killedBy = sk
                    if (game.config.deathReveal) protector.roleRevealed = protector.role
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )

                    game = fn.death(client, game, protector.number)
                  }
                }
                else if (protector.role == "Tough Guy") {
                  protector.health = 0

                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Attacked!",
                        fn.getEmoji(client, "Bodyguard Protect").url
                      )
                      .setDescription(
                        `You protected **${attackedPlayer.number} ${
                          nicknames.get(attackedPlayer.id)
                        }** who was attacked by **${sk.number} ${
                          nicknames.get(sk.id)
                        } ${fn.getEmoji(client, sk.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                      )
                  )

                  fn.getUser(client, sk.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Attacked!",
                        fn.getEmoji(client, "Bodyguard Protect").url
                      )
                      .setDescription(
                        `You protected **${attackedPlayer.number} ${
                          nicknames.get(attackedPlayer.id)
                        }** who was attacked by **${sk.number} ${
                          nicknames.get(sk.id)
                        } ${fn.getEmoji(client, sk.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                      )
                  )
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Protection", fn.getEmoji("Doctor_Protection").url)
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  protector.elixirUsed = true

                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Elixir", fn.getEmoji("Witch Elixir").url)
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                  protector.trapStatus = -1

                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Trap Triggered!",
                        fn.getEmoji(client, "Beast Hunter TrapInactive").url
                      )
                      .setDescription(
                        "Your target was too string to be killed!"
                      )
                  )
                }
              }
            }
            else if (attackedPlayer.role == "Bodyguard") {
              attackedPlayer.health -= 1
              if (attackedPlayer.health) {
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.RichEmbed()
                    .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                    .setDescription(
                      "You fought off an attack last night and survived.\n" +
                      "Next time you are attacked you will die."
                    )
                )
              }
              else {
                game.lastDeath = game.currentPhase - 1
                attackedPlayer.alive = false
                attackedPlayer.killedBy = sk
                if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The serial killer stabbed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
                game = fn.death(client, game, attackedPlayer.number)
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              attackedPlayer.health = 0

              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setAuthor(
                    "Attacked!",
                    fn.getEmoji(client, "Bodyguard Protect").url
                  )
                  .setDescription(
                    `You were attacked by **${sk.number} ${
                      nicknames.get(sk.id)
                    } ${fn.getEmoji(client, sk.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )
            }
            else {
              game.lastDeath = game.currentPhase - 1
              attackedPlayer.alive = false
              attackedPlayer.killedBy = sk
              if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The serial killer stabbed **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}${
                  game.config.deathReveal
                    ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                    : ""
                }**.`
              )
              game = fn.death(client, game, attackedPlayer.number)
            }
          }

          // WEREWOLVES KILL
          if (wwVotesCount.length) {
            let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
            let attacked = [...wwVotesCount.keys()].filter(i => wwVotesCount[i] === max)[0]
            let attackedPlayer = game.players[attacked-1]

            let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && !p.left)

            let wwStrength = ["Werewolf", "Junior Werewolf", "Nightmare Werewolf", "Wolf Shaman", "Guardian Wolf", "Werewolf Berserk", "Alpha Werewolf", "Wolf Seer"]

            let wwByStrength = game.players
              .filter(p => p.alive && roles[p.role].team == "Werewolves")
            wwByStrength.sort((a,b) => {
              if (wwStrength.indexOf(a.role) > wwStrength.indexOf(b.role))
                return 1
              if (wwStrength.indexOf(a.role) < wwStrength.indexOf(b.role))
                return -1
              return 0
            })

            let weakestWW = game.players[wwByStrength[0].number-1]

            if (["Arsonist","Bomber","Cannibal","Illusionist","Serial Killer"].includes(attackedPlayer.role)) {
              fn.broadcastTo(
                client, wolves,
                `**${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** cannot be killed!`
              )
            }
            else if (attackedPlayer.protectors.length) {
              if (!game.frenzy) {
                fn.broadcastTo(
                  client, wolves,
                  `**${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** cannot be killed!`
                )
              }
              else {
                game.lastDeath = game.currentPhase - 1
                attackedPlayer.alive = false
                if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left).map(p => p.id),
                  `The werewolves killed **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )

                game = fn.death(client, game, attackedPlayer.number)
              }

              for (var x of attackedPlayer.protectors) {
                let protector = game.players[x-1]

                if (game.frenzy) {
                  protector.alive = false
                  protector.killedBy = wolves.filter(p => !p.alive)[Math.floor(Math.random()*wolves.filter(p => !p.alive).length)]
                  if (game.config.deathReveal) protector.roleRevealed = protector.role

                  fn.broadcastTo(
                    client,
                    game.players.filter(p => !p.left),
                    `The Wolf Frenzy killed **${protector.number} ${
                      nicknames.get(protector.id)
                    }${
                      game.config.deathReveal
                        ? ` ${fn.getEmoji(client, protector.role)}`
                        : ""
                    }**.`
                  )

                  game = fn.death(client, game, protector.number)
                  continue;
                }

                if (protector.role == "Bodyguard") {
                  protector.health -= 1
                  if (protector.health) {
                    fn.getUser(client, protector.id).send(
                      new Discord.RichEmbed()
                        .setAuthor("Attacked!", fn.getEmoji(client, "Bodyguard Protect").url)
                        .setDescription(
                          "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                        )
                    )
                  }
                  else {
                    game.lastDeath = game.currentPhase - 1
                    protector.alive = false
                    protector.killedBy = wolves.filter(p => !p.alive)[Math.floor(Math.random()*wolves.filter(p => !p.alive).length)]
                    if (game.config.deathReveal) protector.roleRevealed = protector.role
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )

                    game = fn.death(client, game, protector.number)
                  }
                }
                else if (protector.role == "Tough Guy") {
                  protector.health = 0

                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Attacked!",
                        fn.getEmoji(client, "Bodyguard Protect").url
                      )
                      .setDescription(
                        `You protected **${attackedPlayer.number} ${
                          nicknames.get(attackedPlayer.id)
                        }** who was attacked by **${weakestWW.number} ${
                          nicknames.get(weakestWW.id)
                        } ${fn.getEmoji(client, weakestWW.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                      )
                  )
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Protection", fn.getEmoji(client, "Doctor Protect").url)
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  protector.elixirUsed = true

                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Elixir", fn.getEmoji(client, "Witch Elixir").url)
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                  weakestWW.alive = false
                  if (game.config.deathReveal) weakestWW.roleRevealed = weakestWW.role
                  else weakestWW.roleRevealed = "Fellow Werewolf"

                  fn.broadcastTo(
                    client, game.players.filter(p => !p.left),
                    `The beast hunter's trap killed **${weakestWW.number} ${
                      nicknames.get(weakestWW.id)
                    } ${
                      game.config.deathReveal
                        ? fn.getEmoji(client, weakestWW.role)
                        : fn.getEmoji(client, "Fellow Werewolf")
                    }**.`
                  )

                  game = fn.death(client, game, weakestWW.number)
                }
              }
            }
            else if (attackedPlayer.role == "Cursed") {
              attackedPlayer.role = "Werewolf"
              game.lastDeath = game.currentPhase - 1
              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setTitle("<:Fellow_Werewolf:660825937109057587> Converted!")
                  .setDescription("You have been bitten! You are a <:Werewolf:658633322439639050> Werewolf now!")
              )
              fn.broadcastTo(
                client, wolves,
                `**${attackedPlayer.number} ${
                  nicknames.get(attackedPlayer.id)
                }** is the <:Cursed:659724101258313768> Cursed and is turned into a <:Werewolf:658633322439639050> Werewolf!`
              )
            }
            else if (attackedPlayer.role == "Bodyguard") {
              attackedPlayer.health -= 1
              if (attackedPlayer.health) {
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.RichEmbed()
                    .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                    .setDescription(
                      "You fought off an attack last night and survived.\n" +
                      "Next time you are attacked you will die."
                    )
                )
              }
              else {
                game.lastDeath = game.currentPhase - 1
                attackedPlayer.alive = false
                attackedPlayer.killedBy = wolves.filter(p => !p.alive)[Math.floor(Math.random()*wolves.filter(p => !p.alive).length)]
                if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )

                game = fn.death(client, game, attackedPlayer.number)
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              attackedPlayer.health = 0

              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setAuthor(
                    "Attacked!",
                    fn.getEmoji(client, "Bodyguard Protect").url
                  )
                  .setDescription(
                    `You were attacked by **${weakestWW.number} ${
                      nicknames.get(weakestWW.id)
                    } ${fn.getEmoji(client, weakestWW.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )

              // fn.getUser(client, weakestWW.id).send(`Your target was a tough guy**.`)
            }
            else {
              game.lastDeath = game.currentPhase - 1
              attackedPlayer.alive = false
              attackedPlayer.killedBy = wolves.filter(p => !p.alive)[Math.floor(Math.random()*wolves.filter(p => !p.alive).length)]
              if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The werewolves killed **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}${
                  game.config.deathReveal
                    ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                    : ""
                }**.`
              )

              game = fn.death(client, game, attackedPlayer.number)
            }
          }

          // SECT CONVERSION
          let sl = game.players.find(p => p.role == "Sect Leader" && p.alive)
          if (sl && sl.usedAbilityTonight) {
            let sectTarget = game.players[sl.usedAbilityTonight-1]

            if (roles[sectTarget.role] == "Village" || ["Fool","Headhunter"].includes(sectTarget.role)) {
              sectTarget.sect = true
              game.lastDeath = game.currentPhase - 1
              fn.getUser(client, sectTarget.id).send(
                new Discord.RichEmbed()
                  .setTitle("Welcome to the Gang")
                  .setThumbnail(fn.getEmoji(client, "Sect Member").url)
                  .setDescription(
                    `You have been turned into **${sl.number} ${nicknames.get(
                      sl.id
                    )}**'s sect!'`
                  )
                  .addField(
                    "Sect Members",
                    game.players
                      .filter(p => p.sect)
                      .map(
                        p =>
                          `${p.number} ${nicknames.get(p.id)} ${fn.getEmoji(
                            client, p.role
                          )}${
                            !p.alive ? ` ${fn.getEmoji(client, "Death")}` : ""
                          }`
                      )
                  )
              )
          
              // RED LADY KILL
              let rls = game.players.filter(p => p.alive && p.role == "Red Lady" && p.usedAbilityTonight)
              for (var rl of rls) {
                if (game.players[rl.usedAbilityTonight-1].killedBy) {
                  rl.alive = false
                  rl.roleRevealed = "Red Lady"
                  game.lastDeath = game.currentPhase - 1

                  fn.broadcastTo(
                    client, game.players.filter(p => !p.left),
                    `<:Red_Lady_LoveLetter:674854554369785857> **${rl.number} ${nicknames.get(rl.id)} ${fn.getEmoji(client, "Red Lady")
                    }** visited an evil player and died!`
                  )
                }
              }
              
              fn.broadcastTo(
                client, game.players.filter(p => p.sect),
                new Discord.RichEmbed()
                  .setTitle("Welcome to the Gang")
                  .setThumbnail(fn.getEmoji(client, "Sect Member").url)
                  .setDescription(
                    `**${sectTarget.number} ${nicknames.get(sectTarget.id)} ${fn.getEmoji(client, sectTarget.role)}** is turned into the sect!`
                  )
                  .addField(
                    "Sect Members",
                    game.players
                      .filter(p => p.sect)
                      .map(
                        p =>
                          `${p.number} ${nicknames.get(p.id)} ${fn.getEmoji(
                            client, p.role
                          )}${
                            !p.alive ? ` ${fn.getEmoji(client, "Death")}` : ""
                          }`
                      )
                  )
              )
            }
            else fn.getUser(client, sl.id).send(`**${sectTarget.number} ${nicknames.get(sectTarget.id)}** cannot be sected!`)
          }
          
          // SPIRIT SEER RESULTS
          let spzs = game.players.filter(p => p.alive && p.role == "Spirit Seer" && p.usedAbilityTonight)
          for (var spz of spzs) {
            let targets = spz.usedAbilityTonight.map(p => game.players[p.number-1])
            
            if (targets[0].killedTonight || targets[1].killedTonight) 
              fn.getUser(client, spz.id).send(
                new Discord.RichEmbed()
                  .setTitle("There was blood...")
                  .setThumbnail(fn.getEmoji(client, "Spirit Seer Killed").url)
                  .setDescription(
                    `**${targets[0].number} ${nicknames.get(targets[0].id)
                    }** and/or **${targets[1].number} ${nicknames.get(targets[1].id)}** killed last night!`
                  )
              )
            else 
              fn.getUser(client, spz.id).send(
                new Discord.RichEmbed()
                  .setTitle("Good for tonight")
                  .setThumbnail(fn.getEmoji(client, "Spirit Seer NotKilled").url)
                  .setDescription(
                    `Neither of **${targets[0].number} ${nicknames.get(targets[0].id)
                    }** or **${targets[1].number} ${nicknames.get(targets[1].id)}** killed last night.`
                  )
              )
          }
          
          // SHERIFF RESULTS
          let sheriffs = game.players.filter(p => p.alive && p.role == "Sheriff" && p.usedAbilityTonight)
          for (var sheriff of sheriffs) {
            let target = game.players[spz.usedAbilityTonight-1]
            if (!target.killedBy) continue;
            
            let one = Math.floor(Math.random()*2) == 1
            let other = game.players.filter(p => p.alive && p.number !== target.killedBy.number && p.number !== sheriff.number)
            if (other.length) {
              let random = other[Math.floor(Math.random()*other.length)]

              fn.getUser(client, sheriff.id).send(
                new Discord.RichEmbed()
                  .setTitle("You guys were up for something...")
                  .setThumbnail(fn.getEmoji(client, "Sheriff Suspect").url)
                  .setDescription(
                    one ? `**${target.killedBy.number} ${nicknames.get(target.killedBy.id)
                    }** or **${random.number} ${nicknames.get(random.id)}** killed **${target.number} ${nicknames.get(target.id)}** last night.` 
                    : `**${random.number} ${nicknames.get(random.id)}** or **${target.killedBy.number} ${nicknames.get(target.killedBy.id)
                    }** killed **${target.number} ${nicknames.get(target.id)}** last night.` 
                  )
              )
            }
            else {
              fn.getUser(client, sheriff.id).send(
                new Discord.RichEmbed()
                  .setTitle("You were up for something...")
                  .setThumbnail(fn.getEmoji(client, "Sheriff Suspect").url)
                  .setDescription(
                    `**${target.killedBy.number} ${nicknames.get(target.killedBy.id)
                    }** killed **${target.number} ${nicknames.get(target.id)}** last night.`
                  )
              )
            }
          }

          // GRUMPY GRANDMA MUTE
          console.log(ggs)
          for (var gg of ggs) {
            let muted = game.players[gg.usedAbilityTonight-1]
            if (!muted.alive) continue;

            muted.mute = true
            
            fn.getUser(client, muted.id).send(
              new Discord.RichEmbed()
                .setAuthor("Muted!", fn.getEmoji(client, "Grumpy Grandma Mute").url)
                .setThumbnail(fn.getEmoji(client, "Grumpy Grandma").url)
                .setDescription("You cannot speak or vote today!")
            )
            fn.broadcastTo(
              client, game.players.filter(p => !p.left),
              `<:Grumpy_Grandma_Mute:660495619483238410> Grumpy Grandma muted **${muted.number} ${fn.getUser(client, muted.id)}**!` +
              `They cannot speak or vote today.`
            )
          }

          // CLEAR NIGHT SELECTIONS
          for (var x = 0; x < game.players.length; x++)
            Object.assign(game.players[x], {
              usedAbilityTonight: false,
              enchanted: game.players.find(p => p.role == "Wolf Shaman") ? [] : undefined,
              jailed: false,
              protectors: [],
              protected: undefined,
              frenzy: undefined,
              killedBy: undefined,
            })
        }

        for (var j = 0; j < game.players.length; j++) {
          game.players[j].vote = null
          if (game.currentPhase % 3 == 0) game.players[j].mute = false
          if (game.currentPhase % 3 == 0 && game.players[j].role == "Tough Guy" && !game.players[j].health) {
            Object.assign(game.players[j], {
              health: 1,
              alive: false,
              roleRevealed: game.players[j].role
            })

            fn.broadcastTo(
              client, game.players.filter(p => !p.left),
              `The tough guy **${game.players[j].number} ${nicknames.get(game.players[j].id)}** was wounded last night and has died now.`
            )
          }
        }

        if (game.players.find(p => p.role == "President" && !p.alive && !p.suicide)) {
          let president = game.players.find(p => p.role == "President")
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "President").url) 
              .setDescription(`The President **${president.number} ${nicknames.get(president.id)}** <:President:660497498430767104> was killed! All but the villagers have won!`)
          )
          fn.addXP(game.players.filter(p => p.sect && !p.suicide), 50)
          fn.addXP(game.players.filter(p => (roles[p.role].team == "Werewolves" || p.role == "Zombie") && !p.suicide), 75)
          fn.addXP(game.players.filter(p => ["Headhunter","Fool","Bomber","Arsonist","Corruptor"].includes(p.role) && !p.suicide), 100)
          fn.addXP(game.players.filter(p => p.role == "Sect Leader" && !p.suicide), 70)
          fn.addXP(game.players.filter(p => p.sect && !p.suicide), 50)
          fn.addXP(game.players.filter(p => p.role == "Serial Killer" && !p.suicide), 250)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(p => !p.suicide && roles[p.role].team != "Village").map(p => p.number))
        }

        let alive = game.players.filter(p => p.alive),
            aliveRoles = alive.map(p => p.role)

        if (alive.filter(p => p.role != "Zombie").length == 0) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "Zombie").url)
              .setDescription(
                `The zombies wins!`
              )
          )
          fn.addXP(game.players.filter(p => p.role == "Zombie" && !p.suicide), 75)
          fn.addWin(game, alive.filter(p => p.sect).map(p => p.number))
          continue;
        }

        if (aliveRoles.includes("Sect Leader") && alive.filter(p => !p.sect).length == 0) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "Sect Leader").url)
              .setDescription(
                `The sect wins!`
              )
          )
          fn.addXP(game.players.filter(p => p.sect && !p.suicide), 50)
          fn.addXP(game.players.filter(p => p.role == "Sect Leader" && !p.suicide), 70)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, alive.filter(p => p.sect).map(p => p.number))
          continue;
        }

        if ((alive.length == 1 && ['Arsonist','Bomber','Cannibal','Corruptor','Illusionist','Serial Killer'].includes(aliveRoles[0])) ||
            (alive.length == 2 && aliveRoles.includes("Jailer") && aliveRoles.some(r => ['Arsonist','Bomber','Cannibal','Corruptor','Illusionist','Serial Killer'].indexOf(r) >= 0))) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, alive.find(p => roles[p.role].team == "Solo")).url)
              .setDescription(
                `${alive.find(p => roles[p.role].team == "Solo")} **${alive.find(p => roles[p.role].team == "Solo").number} ` +
                `${fn.getUser(client, alive.find(p => roles[p.role].team == "Solo").id)}** wins!`
              )
          )
          fn.addXP(alive.find(p => roles[p.role].team == "Solo"), 250)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, [alive.find(p => roles[p.role].team == "Solo").number], "Solo")
          continue;
        }

        if (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length >=
            game.players.filter(p => p.alive && (roles[p.role].team == "Village" || ['Headhunter','Fool'].includes(p.role))).length &&
            !game.players.filter(p => p.alive && roles[p.role].team == "Solo" && !['Headhunter','Fool'].includes(p.role)).length) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left).map(p => p.id),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "Werewolf").url)
              .setDescription(
                `The werewolves win!`
              )
          )
          fn.addXP(game.players.filter(p => !p.suicide && roles[p.role].team == "Werewolves"), 50)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(p => !p.suicide && roles[p.role].team == "Werewolves").map(p => p.number), "Werewolves")
          continue;
        }

        if (game.players.filter(p => p.alive && !(roles[p.role].team == "Village" || ['Headhunter','Fool'].includes(p.role))).length == 0) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left).map(p => p.id),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "Villager").url)
              .setDescription(
                `The village wins!`
              )
          )
          fn.addXP(
            game.players.filter(
              p =>
                !p.suicide &&
                !p.sect && 
                (roles[p.role].team == "Village" ||
                  (p.role == "Headhunter" &&
                    !game.players.find(pl => pl.headhunter == p.number).alive))
            ), 50
          )
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(
            p =>
              !p.suicide &&
              !p.sect &&
              (roles[p.role].team == "Village" ||
                (p.role == "Headhunter" &&
                  !game.players.find(pl => pl.headhunter == p.number).alive))
          ).map(p => p.number), "Village")
          continue;
        }

        if (game.lastDeath + 6 == game.currentPhase) {
          fn.broadcastTo(
            client, game.players.filter(p => !p.left), 
            "There has been no deaths for two days. Three consecutive days without deaths will result in a tie."
          )
        }

        if (game.lastDeath + 9 == game.currentPhase || !game.players.filter(p => p.alive).length) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(fn.getEmoji(client, "Death").url)
              .setDescription(`It was a tie. There are no winners.`)
          )
          fn.addXP(game.players.filter(p => !p.suicide), 15)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, [])
          continue;
        }

        fn.broadcastTo(
          client, game.players.filter(p => !p.left && !p.alive),
          game.currentPhase % 3 == 0
            ? `Night ${Math.floor(game.currentPhase / 3) + 1} has started!`
            : game.currentPhase % 3 == 1
            ? new Discord.RichEmbed()
                .setTitle(`Day ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                .setThumbnail(fn.getEmoji(client, "Day").url)
                .setDescription("Start discussing!")
            : !game.noVoting
            ? `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length / 2)
              } votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
            : "There will be no voting today!"
        )
        
        switch (game.currentPhase % 3) {
          case 0:
            for (var player of game.players.filter(
              p =>
                p.alive &&
                p.role !== "Jailer" &&
                (!game.players.find(p => p.role == "Jailer") || (!p.jailed &&
                  game.players.find(p => p.role == "Jailer") &&
                  game.players.find(p => p.role == "Jailer").alive))
            )) {
              fn.getUser(client, player.id).send(
                new Discord.RichEmbed()
                  .setTitle(`Night ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                  .setThumbnail(fn.getEmoji(client, "Night").url)
                  .setDescription(roles[player.role].nite || "Nothing to do. Go back to sleep!")
              )
            }
            break;
          case 1:
            for (var player of game.players.filter(p => p.alive)) {
              fn.getUser(client, player.id).send(
                new Discord.RichEmbed()
                  .setTitle(`Day ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                  .setThumbnail(fn.getEmoji(client, "Day").url)
                  .setDescription(`Start discussing!\n${roles[player.role].day || ""}`)
              )
            }
            break;
          case 2:
            for (var player of game.players.filter(p => p.alive)) {
              fn.getUser(client, player.id).send(
                new Discord.RichEmbed()
                  .setTitle(`Voting time has started!`)
                  .setThumbnail(fn.getEmoji(client, "Voting").url)
                  .setDescription(
                    `${Math.floor(game.players.filter(player => player.alive).length / 2)
                    } votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
                  )
              )
            }
            break;
        }

        if (game.currentPhase % 3 == 0) {
          if (game.players.find(p => p.role == "Jailer")) {
            let jailer = game.players.find(p => p.role == "Jailer")

            if (game.players.find(p => p.jailed && p.alive)) {
              let jailed = game.players.find(p => p.jailed && p.alive)

              if (jailer.alive) {
                if (roles[jailed.role].team == "Werewolves" && jailed.role !== "Sorcerer")
                  fn.broadcastTo(
                    client,
                    game.players
                      .filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role !== "Sorcerer" && p.id !== jailed.id)
                      .map(p => p.id),
                    new Discord.RichEmbed()
                      .setTitle(`Jailed!`)
                      .setThumbnail(fn.getEmoji(client, "Jail").url)
                      .setDescription(`Fellow Werewolf **${jailed.number} ${nicknames.get(jailed.id)}** is jailed!`)
                  )

                fn.getUser(client, jailer.id).send(
                  new Discord.RichEmbed()
                    .setTitle(`Night ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                    .setThumbnail(fn.getEmoji(client, "Jail Night").url)
                    .setDescription(`**${jailed.number} ${nicknames.get(jailed.id)}** is now jailed!\nYou can talk to them or shoot them (\`w!execute\`).`)
                )

                fn.getUser(client, jailed.id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`Night ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                      .setThumbnail(fn.getEmoji(client, "Jail Night").url)
                      .setDescription(`You are now jailed.\nYou can talk to the jailer to prove your innocence.`)
                  )
              } else 
                game.players[jailed.number-1].jailed = false
            }
            else if (jailer.alive) {
              fn.getUser(client, jailer.id).send(
                new Discord.RichEmbed()
                  .setTitle(`Night ${Math.floor(game.currentPhase / 3) + 1} has started!`)
                  .setThumbnail(fn.getEmoji(client, "Night").url)
                  .setDescription("You did not select a player last day or your target could not be jailed.\n" +
                                  " Go back to sleep!")
              )
            }
          }
          
          if (game.frenzy) fn.broadcastTo(
            client, game.players.filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role != "Sorcerer" && !p.jailed),
            new Discord.RichEmbed()
              .setTitle("Frenzy")
              .setThumbnail(fn.getEmoji(client, "Werewolf Berserk Frenzy").url)
              .setDescription("The werewolf berserk activated frenzy!")
          )
          
          for (var gunner of game.players.filter(p => p.role == "Gunner")) 
            gunner.shotToday = false
        }
      }
      catch (error) {
        client.channels.get("664285087839420416")
          .send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("<:red_tick:597374220267290624> Game Terminated")
              .setDescription(`${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} has been terminated due to the following reason: \`\`\`${error.stack}\`\`\``)
          )

        game.currentPhase = 999
        // fn.addXP(game.players, 15)
        fn.addXP(game.players.filter(p => !p.left), 15)
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          "<:red_tick:597374220267290624> There is an error causing this game to be terminated." +
          " Please contact staff members."
        )
      }
    }
    games.set('quick', QuickGames)
  }, 500)
}