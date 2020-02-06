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
        for (let pl = 0; pl < game.players.length; pl++) {
          if (game.currentPhase == -1) {
            if (!fn.getUser(client, game.players[pl].id) || moment(game.players[pl].lastAction).add(3, 'm') <= moment()) {
              if (fn.getUser(client, game.players[pl].id))
                fn.getUser(client, game.players[pl].id).send(`You are removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)

              players.set(`${game.players[pl].id}.currentGame`, 0)

              let leftPlayer = game.players[pl].id
              game.players.splice(pl--, 1)

              if (game.players.length)
                fn.broadcastTo(
                  client, game.players,
                  new Discord.RichEmbed()
                    .setAuthor(
                      `${nicknames.get(leftPlayer)} left the game.`,
                      fn.getUser(client, leftPlayer).displayAvatarURL
                    )
                    .addField(
                      `Players [${game.players.length}]`,
                      game.players
                        .map(p => nicknames.get(p.id))
                        .join("\n")
                    )
              )
            } else if (moment(game.players[pl].lastAction).add(2.5, 'm') <= moment() && !game.players[pl].prompted) {
              game.players[pl].prompted = true
              fn.getUser(client, game.players[pl].id).send(
                new Discord.RichEmbed()
                  .setTitle("❗ You have been inactive for 2.5 minutes.")
                  .setDescription(
                    "Please respond `w!` within 30 seconds to show your activity.\n" +
                    "You will be kicked from the game if you fail to do so."
                  )
              )
            }
          }
          else {
            if (!game.players[pl].alive || game.players[pl].left) continue;

            // AFK SUICIDE
            if (!fn.getUser(client, game.players[pl].id) && moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
              game.players[pl].alive = false
              game.players[pl].left = true
              game.players[pl].suicide = true
              if (game.config.deathReveal) game.players[pl].roleRevealed = game.players[pl].role
              players.add(`${game.players[pl].id}.suicides`, 1)
              players.set(`${game.players[pl].id}.currentGame`, 0)

              if (fn.getUser(client, game.players[pl].id))
                fn.getUser(client, game.players[pl].id).send(`You were removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
              fn.broadcastTo(
                client, game.players.filter(p => !p.left),
                `**${game.players[pl].number} ${fn.getUser(
                  client,
                  game.players[pl].id
                )}${
                  game.config.deathReveal
                    ? ` ${fn.getEmoji(client, game.players[pl].role)}`
                    : ""
                }** suicided.`
              )

              game = fn.death(client, game, game.players[pl].number, true)
            } else if (moment(game.players[pl].lastAction).add(1.5, 'm') <= moment() && !game.players[pl].prompted) {
              game.players[pl].prompted = true
              new Discord.RichEmbed()
                .setTitle("❗ You have been inactive for 1.5 minutes.")
                .setDescription(
                  "Please respond `w!` within 30 seconds to show your activity.\n" +
                  "You will be considered as suicided if you fail to do so."
                )
          }
        }  
      }

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

          // SERIAL KILLER KILL
          let skKills = game.players.filter(player => player.alive && player.role == "Serial Killer").map(player => player.vote),
              sks = game.players.filter(player => player.alive && player.role == "Serial Killer")
          for (var x = 0; x < skKills.length; x++) {
            if (!skKills[x]) continue;
            let attacked = skKills[x],
                attackedPlayer = game.players[attacked-1],
                sk = game.players[sks[x].number-1]

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
                        } ${client.getEmoji(client, sk.role)}**.\n` +
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
                        } ${client.getEmoji(client, sk.role)}**.\n` +
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
                    } ${client.getEmoji(client, sk.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )
            }
            else {
              game.lastDeath = game.currentPhase - 1
              attackedPlayer.alive = false
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
          let wwVotes = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.vote),
              wwRoles = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.role),
              wwVotesCount = []
          for (var j = 0; j < wwVotes.length; j++) {
            if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
            wwVotesCount[wwVotes[j]] += wwRoles[j] == "Alpha Werewolf" ? 2 : 1
          }
          if (wwVotesCount.length) {
            let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
            let attacked = [...wwVotesCount.keys()].filter(i => wwVotesCount[i] === max)[0]
            let attackedPlayer = game.players[attacked-1]

            let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && !p.left).map(p => p.id)

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
                        } ${client.getEmoji(client, weakestWW.role)}**.\n` +
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
                        ? client.getEmoji(client, weakestWW.role)
                        : client.getEmoji(client, "Fellow Werewolf")
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
                    } ${client.getEmoji(client, weakestWW.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )

              // fn.getUser(client, weakestWW.id).send(`Your target was a tough guy**.`)
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
          }

          // SECT CONVERSION
          let sl = game.players.find(p => p.role == "Sect Leader" && p.alive)
          if (sl && sl.usedAbilityTonight) {
            let sectTarget = game.players[sl.usedAbilityTonight-1]

            if (roles[sectTarget.role] == "Village" || ["Fool","Headhunter"].includes(sectTarget.role)) {
              fn.getUser(client, sectTarget.id).send(
                new Discord.RichEmbed()
                  .setTitle("Welcome to the Gang")
                  .setThumbnail(fn.getEmoji(client, "Sect Member").url)
                  .setDescription(`You have been turned into **${sl.number} ${nicknames.get(sl.id)}**'s sect!'`)
                  .addField(
                    "Sect Members",
                    game.players.filter(p => p.sect)
                  )
              )
              
              fn.broadcastTo(
                client, game.players.filter(p => p.sect),
                
              )
            }
            else fn.getUser(client, sl.id).send(`**${sectTarget.number} ${nicknames.get(sectTarget.id)}** cannot be sected!`)
          }

          // GRUMPY GRANDMA MUTE
          let ggs = game.players.filter(p => p.role == "Grumpy Grandma")
          for (var x = 0; x < ggs.length; x++) {
            let muted = game.players[ggs[x].usedAbilityTonight-1]
            if (!muted || !muted.alive) continue;

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

          for (var x = 0; x < game.players.length; x++)
            Object.assign(game.players[x], {
              usedAbilityTonight: false,
              enchanted: game.players.find(p => p.role == "Wolf Shaman") ? [] : undefined
            })
        }

        for (var j = 0; j < game.players.length; j++) {
          game.players[j].jailed = false
          game.players[j].protectors = []
          if (game.players[j].protected) game.players[j].protected = undefined
        }

        for (var j = 0; j < game.players.length; j++) {
          game.players[j].vote = null
          if (game.currentPhase % 3 == 0 && game.players[j].role == "Tough Guy" && !game.players[j].health) {
            Object.assign(game.players[j], {
              health: 1,
              alive: false,
              roleRevealed: game.players[j].role
            })

            fn.broadcastTo(
              client, game.players.filter(p => !p.left),
              `The tough guy **${game.players[j].number} ${fn.getUser(client, game.players[j].id)}** was wounded last night and has died now.`
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
          fn.addXP(game.players.filter(p => p.role == "Sect Leader" && !p.suicide), 120)
          fn.addXP(game.players.filter(p => p.role == "Serial Killer" && !p.suicide), 250)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(p => !p.suicide && roles[p.role].team != "Village").map(p => p.number))
        }

        let alive = game.players.filter(p => p.alive)

        if ((alive.length == 1 && roles[alive[0].role].team == "Solo" && alive[0].role != "Headhunter") ||
            (alive.length == 2 && alive.map(p => roles[p.role].team).includes("Solo") && !alive.map(p => p.role).includes("Headhunter") && alive.map(p => p.role).includes("Jailer"))) {
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
                (roles[p.role].team == "Village" ||
                  (p.role == "Headhunter" &&
                    !game.players.find(pl => pl.headhunter == p.number).alive))
            ), 50
          )
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(
            p =>
              !p.suicide &&
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
          client, game.players.filter(p => !p.left),
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

        if (game.currentPhase % 3 == 0) {
          if (game.frenzy) fn.broadcastTo(
            client, game.players.filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role != "Sorcerer"),
            new Discord.RichEmbed()
              .setTitle("Frenzy")
              .setThumbnail(fn.getEmoji(client, "Werewolf Berserk Frenzy").url)
              .setDescription("The werewolf berserk activated frenzy!")
          )

          if (game.roles.includes("Gunner")) {
            let gunners = game.players.filter(p => p.role == "Gunner").map(p => p.number)
            for (var x = 0; x < gunners.length; x++) 
              game.players[gunners[i]-1].shotToday = false
          }

          fn.broadcastTo(
            client,
            game.players.filter(
              p => p.alive &&
                  !["Doctor","Bodyguard","Tough Guy","Jailer","Red Lady","Marksman","Seer","Aura Seer","Spirit Seer",
                    "Detective","Medium","Witch","Avenger","Beast Hunter","Grumpy Grandma",
                    game.currentPhase == 0 ? "Cupid" : "",
                    "Werewolf","Alpha Werewolf","Wolf Shaman","Wolf Seer","Junior Werewolf","Nightmare Werewolf",
                    "Werewolf Berserk","Sorcerer",
                    "Serial Killer","Arsonist","Bomber","Sect Leader","Zombie","Corruptor","Cannibal"].includes(p.role)).map(p => p.id), 
            new Discord.RichEmbed()
              .setAuthor(`Night`, fn.getEmoji(client, "Night").url)
              .setDescription("Nothing to do right now.\n" +
                              " Go back to sleep!"),
          )

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
                    .setTitle(`Jail`)
                    .setThumbnail(fn.getEmoji(client, "Jail").url)
                    .setDescription(`**${jailed.number} ${nicknames.get(jailed.id)}** is now jailed!\nYou can talk to them or shoot them (\`w!execute\`).`)
                )

                fn.getUser(client, jailed.id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`Jailed`)
                      .setThumbnail(fn.getEmoji(client, "Jail").url)
                      .setDescription(`You are now jailed.\nYou can talk to the jailer to prove your innocence.`)
                  )
              } else 
                game.players[jailed.number-1].jailed = false
            }
            else if (jailer.alive) {
              fn.getUser(client, jailer.id).send(
                new Discord.RichEmbed()
                    .setTitle(`Jail`)
                    .setThumbnail(fn.getEmoji(client, "Jail").url)
                  .setDescription("You did not select a player last day or your target could not be jailed.\n" +
                                  " Go back to sleep!")
              )
            }
          }
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
       // fn.addXP(game.players.filter(p => !p.left), 15)
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