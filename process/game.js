const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames"),
      logs = new db.table("Logs")

const fn = require("/home/sd/wwou/util/fn.js"),
      roles = require("/home/sd/wwou/util/roles.js"),
      tags = require("/home/sd/wwou/util/tags.js")

module.exports = client => {
  setInterval(async () => {
    let QuickGames = games.get("quick")
    
    for (var game of QuickGames) {
      game = require("./inactivity")(client, game)
    }
    
    let activeGames = QuickGames.filter(g => g.currentPhase <= 1000 && g.currentPhase >= 0)
    
    for (var game of activeGames) {
      if (game.currentPhase === 999) {
        fn.broadcastTo(
          client,
          game.players.filter(p => !p.left),
          fn.gameEmbed(client, game)
        )

        game.currentPhase++

        client.guilds.cache
          .get("522638136635817986")
          .members.cache.filter(
            m =>
              game.players.map(p => p.id).includes(m.id) &&
              !m.roles.cache.find(r => r.name == "Player")
          )
          .forEach(m =>
            m.roles.add(fn.getRole(m.guild, "Player")).catch(() => {})
          )
      
        // if (game.mode == "quick") for (var player of game.players.map(x => x.id)) {
        //   // if (!players.get(`${player}.wins`).find(g =>)) return;
        //   let rdm = Math.floor(Math.random()*25)
        //   if (rdm == 0) {
        //     players.add(`${player}.inventory.lootbox`, 1)
        //     fn.getUser(client, player).send(
        //       new Discord.MessageEmbed()
        //         .setTitle("Lootbox")
        //         .setThumbnail(fn.getEmoji(client, "Lootbox").url)
        //         .setDescription(`Congratulations, you earned a lootbox!`)
        //     )
        //   }
        // }
        for (var i = 0; i < game.players.length / 4; i++) fn.broadcastTo(client, game.players.filter(p => !p.left), fn.event())
      }
      if (game.currentPhase == -1 || game.currentPhase >= 999) continue;

      if (moment(game.nextPhase) <= moment())
        try {
          if (game.currentPhase % 3 == 2) {
            // LYNCHING
            game.running = "start lynch process"
            if (!game.noVoting) {
              game.running = "calculate lynch votes"
              let lynchVotes = game.players
                    .filter(player => player.alive)
                    .map(player => player.vote),
                  lynchCount = []
              for (var j = 0; j < lynchVotes.length; j++) {
                if (!lynchCount[lynchVotes[j]]) lynchCount[lynchVotes[j]] = 0
                lynchCount[lynchVotes[j]] +=
                  game.players.filter(player => player.alive)[j].roleRevealed == "Mayor" ||
                  (game.shade && roles[game.players.filter(player => player.alive)[j].role].team == "Werewolves")
                    ? 2
                    : 1
              }
              for (var j = 0; j < game.players.length; j++) {
                if (!game.players[j].alive) continue;
                fn.addLog(game, `${j+1} ${nicknames.get(game.players[j].id)} had ${lynchCount[j+1] || 0} votes.`)
              }
              if (lynchCount.length) {
                let max = lynchCount.reduce((m, n) => Math.max(m, n))
                let lynched = [...lynchCount.keys()].filter(
                  i => lynchCount[i] === max
                )
                if (
                  lynched.length > 1 ||
                  lynchCount[lynched[0]] <
                    Math.floor(
                      game.players.filter(player => player.alive).length / 2
                    )
                ) {
                  fn.broadcastTo(
                    client,
                    game.players.filter(p => !p.left),
                    "The village cannot decide on who to lynch.", true
                  )
                  fn.addLog(game, "The village cannot decide on who to lynch.")
                }
                else {
                  lynched = lynched[0]
                  let lynchedPlayer = game.players[lynched - 1]

                  game.running = "look for lynch protectors"
                  
                  let protector = game.players.find(
                    p =>
                      p.preventLynch == lynchedPlayer.number &&
                      p.alive &&
                      p.role == "Flower Child"
                  )
                  if (!protector)
                    protector = game.players.find(
                      p =>
                        p.preventLynch == lynchedPlayer.number &&
                        p.alive &&
                        p.role == "Guardian Wolf"
                    )
                  if (protector) {
                    game.running = "preventing lynch"
                    
                    protector.abil1 -= 1

                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left),
                      `**${lynchedPlayer.number} ${nicknames.get(
                        lynchedPlayer.id
                      )}** cannot be lynched.`, true
                    )
                    
                    fn.addLog(
                      game,
                      `${protector.number} ${nicknames.get(protector.id)} (${
                        protector.role
                      }) prevented ${lynchedPlayer.number} ${nicknames.get(
                        lynchedPlayer.id
                      )} from being lynched.`
                    )
                  }
                  else if (lynchedPlayer.role == "Handsome Prince") {
                    game.running = "no lynch prince"
                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left),
                      new Discord.MessageEmbed()
                        .setTitle("His Royal Highness")
                        .setThumbnail(
                          fn.getEmoji(client, "Handsome Prince").url
                        )
                        .setDescription(
                          `**${lynchedPlayer.number} ${nicknames.get(
                            lynchedPlayer.id
                          )}** is the Handsome Prince!`
                        ), true
                    )
                    lynchedPlayer.roleRevealed = lynchedPlayer.role
                    fn.addLog(
                      game,
                      `Handsome Prince ${lynchedPlayer.number} ${nicknames.get(lynchedPlayer.id)
                      } revealed themselves as the village tried to lynch him.`
                    )
                  } else {
                    game.running = "kill lynched player"
                    lynchedPlayer.alive = false
                    if (game.config.deathReveal)
                      lynchedPlayer.roleRevealed = lynchedPlayer.role

                    game.lastDeath = game.currentPhase
                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left),
                      `**${lynched} ${nicknames.get(lynchedPlayer.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, lynchedPlayer.role)}`
                          : ""
                      }** was lynched by the village.`, true
                    )
                    fn.addLog(
                      game,
                      `${lynchedPlayer.number} ${nicknames.get(
                        lynchedPlayer.id
                      )} was lynched by the village.`
                    )
                    // lynchedPlayer.killedBy = 17

                    game = fn.death(client, game, lynchedPlayer.number)
          
                    game.running = "test for tie after lynch"
                    let alive = game.players.filter(p => p.alive)
                    if (
                      !alive.length
                    ) {
                      game.running = "tie end"
                      game.currentPhase = 999
                      fn.broadcastTo(
                        client,
                        game.players.filter(p => !p.left),
                        new Discord.MessageEmbed()
                          .setTitle("Game has ended.")
                          .setThumbnail(fn.getEmoji(client, "Death").url)
                          .setDescription(`It was a tie. There are no winners.`), true
                      )
                      game.running = "give tie xp"
                      fn.addXP(game, game.players.filter(p => !p.suicide), 15)
                      fn.addXP(game, game.players.filter(p => !p.left), 15)
                      fn.addWin(game, [])
                      fn.addLog(
                        game,
                        `[RESULT] The game ended in a tie. No one won!`
                      )
                      continue
                    }

                    // FOOL WIN CONDITIONS
                    game.running = "test for fool win condition"
                    if (lynchedPlayer.role == "Fool") {
                      game.currentPhase = 999
                      fn.broadcastTo(
                        client,
                        game.players.filter(p => !p.left),
                        new Discord.MessageEmbed()
                          .setTitle("Game has ended.")
                          .setThumbnail(fn.getEmoji(client, "Fool").url)
                          .setDescription(
                            `Fool ${lynched} ${nicknames.get(
                              lynchedPlayer.id
                            )} wins!`, true
                          )
                      )
                      fn.addLog(
                        game,
                        `Fool ${lynchedPlayer.number} ${nicknames.get(
                          lynchedPlayer.id
                        )} wins!`
                      )
                      game.running = "add fool win and xp"
                      fn.addXP(game, 
                        game.players.filter(p => p.number == lynched),
                        100
                      )
                      fn.addXP(game, game.players.filter(p => !p.left), 15)
                      fn.addWin(game, [lynched], "Solo")
                      continue
                    }

                    // HEADHuNTER WIN CONDITIONS
                    game.running = "test for headhunter win condition"
                    if (lynchedPlayer.headhunter) {
                      let headhunter =
                        game.players[lynchedPlayer.headhunter - 1]

                      if (headhunter.alive && headhunter.role == "Headhunter") {
                        game.currentPhase = 999
                        fn.broadcastTo(
                          client,
                          game.players.filter(p => !p.left),
                          new Discord.MessageEmbed()
                            .setTitle("Game has ended.")
                            .setThumbnail(fn.getEmoji(client, "Headhunter").url)
                            .setDescription(
                              `Headhunter **${
                                headhunter.number
                              } ${nicknames.get(headhunter.id)}** wins!`, true
                            )
                        )
                        fn.addLog(
                          game,
                          `Headhunter ${
                            headhunter.number
                          } ${nicknames.get(headhunter.id)} wins!`
                        )
                        game.running = "add headhunter win and xp"
                        fn.addXP(game, 
                          game.players.filter(
                            p => p.number == headhunter.number
                          ),
                          100
                        )
                        fn.addXP(game, game.players.filter(p => !p.left), 15)
                        fn.addWin(game, [headhunter.number], "Solo")
                        continue
                      }
                    }
                  }
                }
              } else {
                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.left),
                  "The village cannot decide on who to lynch.", true
                )
                fn.addLog(
                  game,
                  `The village cannot decide won who to lynch.`
                )
              }
            } else {
              game.noVoting = false
            }

            // CLEAR LYNCH PREVENTION SELECTIONS
            game.running = "clear lynch prevention seletions"
            for (var lynchProtector of game.players.filter(p =>
              ["Flower Child", "Guardian Wolf"].includes(p.role)
            ))
              lynchProtector.preventLynch = undefined
          }

          // NIGHT END
          game.running = "start end night module"
          if (game.currentPhase % 3 == 0) {
            fn.addLog(game, '-divider2-')
            fn.addLog(game, "The sun is rising...")
            // fn.addLog(game, '-divider2-')
            if (game.currentPhase == 0) {
              // DOPPELGANGER AUTOSELECT
              game.running = "doppelganger check selection"
              let doppels = game.players.filter(p => p.role == "Doppelganger" && !p.selected)
              for (var doppel of doppels) {
                let otherPl = game.players.filter(p => p.number !== doppel.number)
                let rdmPl = otherPl[Math.floor(Math.random()*otherPl.length)]
                doppel.selected = rdmPl.number
                fn.getUser(client, doppel.id).send(
                  `${fn.getEmoji(client, "Doppelganger")} You will be inheriting **${rdmPl.number} ${
                  nicknames.get(rdmPl.id)}**'s role when they die!`
                )
                fn.addLog(
                  game,
                  `Doppelganger ${doppel.number} ${nicknames.get(doppel.id)} was assigned to inherit ${rdmPl.role} ${
                  rdmPl.number} ${nicknames.get(rdmPl.id)} when they die.`
                )
              }
            }
            
            // MEDIUM REVIVE
            game.running = "revive players for medium"
            let mediums = game.players.filter(
              p => p.role == "Medium" && p.usedAbilityTonight
            )
            for (var medium of mediums) {
              let revivedPlayer = game.players[medium.usedAbilityTonight - 1]
              fn.broadcastTo(
                client,
                game.players.filter(p => !p.left),
                `${fn.getEmoji(client, "Medium_Revive")} Medium has revived **${
                  revivedPlayer.number
                } ${nicknames.get(revivedPlayer.id)}**.`, true
              )

              revivedPlayer.alive = true
              medium.abil1 -= 1
              
              fn.addLog(
                game,
                `Medium ${medium.number} ${nicknames.get(medium.id)} revived ${
                  revivedPlayer.number
                } ${nicknames.get(revivedPlayer.id)}.`
              )
            }

            // RED LADY KILL
            let rls = game.players.filter(
                p =>
                  p.alive &&
                  p.role == "Red Lady" &&
                  p.usedAbilityTonight &&
                  game.players[p.usedAbilityTonight - 1].alive
              )
            for (var rl of rls) rl.visitedTonight = true

            // PROTECTORS
            game.running = "find all protectors and assigning protection"
            let protectors = game.players.filter(
              p =>
                (p.alive &&
                [
                  "Bodyguard",
                  "Doctor",
                  "Witch",
                  "Tough Guy",
                  "Jailer",
                  "Red Lady"
                ].includes(p.role)) || p.role == "Beast Hunter"
            )
            for (var protector of protectors) {
              if (["Bodyguard", "Tough Guy","Red Lady"].includes(protector.role))
                protector.protectors.push(protector.number)
              if (
                ["Bodyguard", "Doctor", "Witch", "Tough Guy"].includes(
                  protector.role
                ) &&
                protector.usedAbilityTonight
              )
                game.players[protector.usedAbilityTonight - 1].protectors.push(
                  protector.number
                )
              else if (
                protector.role == "Beast Hunter" &&
                protector.trap && (protector.trapAct || 999) <= game.currentPhase
              )
                game.players[protector.trap - 1].protectors.push(
                  protector.number
                )
              else if (
                protector.role == "Jailer" &&
                game.players.find(p => p.jailed && p.alive)
              )
                game.players[
                  game.players.find(p => p.jailed && p.alive).number - 1
                ].protectors.push(protector.number)
            }

            // ATTACKS
            game.running = "calculate attacks and mutes"
            let cannis = game.players.filter(p => p.role == "Cannibal" && p.alive)
            let sks = game.players.filter(
              p => p.alive && p.role == "Serial Killer" && p.usedAbilityTonight
            )
            let wwVotes = game.players
                .filter(
                  player =>
                    player.alive && (roles[player.role].tag & tags.ROLE.SEEN_AS_WEREWOLF)
                )
                .map(player => player.vote),
              wwRoles = game.players
                .filter(
                  player =>
                    player.alive && (roles[player.role].tag & tags.ROLE.SEEN_AS_WEREWOLF)
                )
                .map(player => player.role),
              wwVotesCount = []
            for (var j = 0; j < wwVotes.length; j++) {
              if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
              wwVotesCount[wwVotes[j]] += wwRoles[j] == "Alpha Werewolf" ? 2 : 1
            }
            let ggs = game.players.filter(
              p => p.alive && p.role == "Grumpy Grandma" && p.usedAbilityTonight
            )
            
            let wwStrength = [
              "Werewolf",
              "Junior Werewolf",
              "Nightmare Werewolf",
              "Kitten Wolf",
              "Wolf Shaman",
              "Wolf Pacifist",
              "Shadow Wolf",
              "Guardian Wolf",
              "Werewolf Berserk",
              "Alpha Werewolf",
              "Wolf Seer"
            ]
            let wwByStrength = game.players.filter(
              p => p.alive && wwStrength.includes(p.role)
            )
            wwByStrength.sort((a, b) => {
              if (wwStrength.indexOf(a.role) > wwStrength.indexOf(b.role))
                return 1
              if (wwStrength.indexOf(a.role) < wwStrength.indexOf(b.role))
                return -1
              return 0
            })
            let weakestWW = wwByStrength.length ? game.players[wwByStrength[0].number - 1] : {}
            let kwws = game.players.filter(
              p => p.role == "Kitten Wolf" && p.alive && p.usedAbilityTonight
            )

            // WEREWOLVES KILL
            game.running = "calculate werewolves votes"
            if (wwVotesCount.length) {
              let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
              let attacked = [...wwVotesCount.keys()].filter(
                i => wwVotesCount[i] === max
              )[0]
              let attackedPlayer = game.players[attacked - 1]

              game.running = "initiate werewolves kill"
              let wolves = game.players.filter(
                p => roles[p.role].team == "Werewolves" && !p.left
              )

              if (
                game.players.find(p => p.role == "Kitten Wolf" && p.alive && p.usedAbilityTonight == attackedPlayer.number)
              ) {
                game.running = "ignore ww kill for kww conversion"

                fn.addLog(
                  game,
                  `The Kitten Wolf thinks it's a better idea to let them scratch ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} instead of killing them.`
                )
              }
              else if (
                (roles[attackedPlayer.role].cat == "Killer" && !["Sect Leader","Zombie"].includes(attackedPlayer.role)) ||
                (attackedPlayer.role == "Red Lady" &&
                  attackedPlayer.visitedTonight && !game.frenzy)
              ) {
                game.running = "cannot kill solo or rl visiting others"
                fn.broadcastTo(
                  client,
                  wolves,
                  `**${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}** cannot be killed!`
                )

                fn.addLog(
                  game,
                  `The Werewolves couldn't kill ${attackedPlayer.role} ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}${attackedPlayer.role == "Red Lady" ? " who was not home." : ""}.`
                )
              }
              else if (attackedPlayer.protectors.length) {
                if (game.frenzy) {
                  game.running = "kill attacked player for frenzy"
                  game.lastDeath = game.currentPhase
                  if (attackedPlayer.role == "Cursed") {
                    game.running = "convert cursed from ww frenzy"
                    attackedPlayer.role = "Werewolf"
                    game.lastDeath = game.currentPhase
                    fn.getUser(client, attackedPlayer.id).send(
                      new Discord.MessageEmbed()
                        .setTitle(
                          `${fn.getEmoji(client, "Fellow Werewolf")} Converted`
                        )
                        .setDescription(
                          `You have been bitten! You are a ${fn.getEmoji(client, "Werewolf")} Werewolf now!`
                        )
                    )
                    fn.broadcastTo(
                      client,
                      wolves,
                      `**${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )}** is the ${fn.getEmoji(client, "Cursed")} Cursed and is turned into a ${fn.getEmoji(client, "Werewolf")} Werewolf!`
                    )
                    
                    fn.addLog(
                      game,
                      `Cursed ${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )} was converted into a werewolf during a frenzy.`
                    )
                  }
                  else {
                    attackedPlayer.alive = false
                    attackedPlayer.killedBy = wolves.filter(p => p.alive)[
                      Math.floor(
                        Math.random() * wolves.filter(p => p.alive).length
                      )
                    ].number
                    if (game.config.deathReveal)
                      attackedPlayer.roleRevealed = attackedPlayer.role
                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left).map(p => p.id),
                      `The werewolves killed **${
                        attackedPlayer.number
                      } ${nicknames.get(attackedPlayer.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                          : ""
                      }**.`, true
                    )

                    game = fn.death(client, game, attackedPlayer.number)
                    
                    fn.addLog(
                      game,
                      `${attackedPlayer.role} ${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )} was killed by the werewolves during a frenzy.`
                    )
                  }
                  
                  game.running = "kill protector for frenzy"
                  let protectors = game.players.filter(p => attackedPlayer.protectors.includes(p.number))
                  for (var protector of protectors) {
                    protector.alive = false
                    protector.killedBy = wolves.filter(p => p.alive)[
                      Math.floor(
                        Math.random() * wolves.filter(p => p.alive).length
                      )
                    ].number
                    if (game.config.deathReveal)
                      protector.roleRevealed = protector.role

                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left),
                      `The Wolf Frenzy killed **${
                        protector.number
                      } ${nicknames.get(protector.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`, true
                    )
                    
                    fn.addLog(
                      game,
                      `${protector.role} ${protector.number} ${nicknames.get(
                        protector.id
                      )} was killed by the werewolves for protecting ${
                        attackedPlayer.role
                      } ${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )} during a frenzy.`
                    )
                  }
                  fn.death(client, game, protectors.map(x => x.number))
                }
                else {
                  fn.broadcastTo(
                    client,
                    wolves,
                    `**${attackedPlayer.number} ${nicknames.get(
                      attackedPlayer.id
                    )}** cannot be killed!`
                  )
                  
                  game.running = "protect from ww attack"
                  for (var x of attackedPlayer.protectors) {
                    let protector = game.players[x - 1]

                    if (protector.role == "Doctor") {
                      game.running = "protect from ww attack for doc"
                      fn.getUser(client, protector.id).send(
                        new Discord.MessageEmbed()
                          .setAuthor(
                            "Protection",
                            fn.getEmoji(client, "Doctor Protect").url
                          )
                          .setDescription(
                            `Your protection saved **${
                              attackedPlayer.number
                            } ${nicknames.get(attackedPlayer.id)}** last night!`
                          )
                      )
                    
                      fn.addLog(
                        game,
                        `Doctor ${protector.number} ${nicknames.get(
                          protector.id
                        )} healed ${
                          attackedPlayer.role
                        } ${attackedPlayer.number} ${nicknames.get(
                          attackedPlayer.id
                        )} from a werewolf attack.`
                      )
                    }
                    else if (protector.role == "Beast Hunter") {
                      game.running = "kill weakest ww for bh"
                      weakestWW.alive = false
                      if (game.config.deathReveal)
                        weakestWW.roleRevealed = weakestWW.role
                      else weakestWW.roleRevealed = "Fellow Werewolf"

                      fn.broadcastTo(
                        client,
                        game.players.filter(p => !p.left),
                        `The beast hunter's trap killed **${
                          weakestWW.number
                        } ${nicknames.get(weakestWW.id)} ${
                          game.config.deathReveal
                            ? fn.getEmoji(client, weakestWW.role)
                            : fn.getEmoji(client, "Fellow Werewolf")
                        }**.`, true
                      )
                    
                      fn.addLog(
                        game,
                        `Beast Hunter ${protector.number} ${nicknames.get(
                          protector.id
                        )}'s trap killed ${weakestWW.role} ${
                          weakestWW.number
                        } ${nicknames.get(
                          weakestWW.id
                        )} when they were trying to attack ${
                          attackedPlayer.role
                        } ${attackedPlayer.number} ${nicknames.get(
                          attackedPlayer.id
                        )} with the other werewolves.`
                      )
                      
                      delete protector.trap
                      delete protector.trapAct

                      game = fn.death(client, game, weakestWW.number)
                    }
                    else if (protector.role == "Witch") {
                      game.running = "protect from ww attack for witch"
                      protector.abil1 = 0

                      fn.getUser(client, protector.id).send(
                        new Discord.MessageEmbed()
                          .setAuthor(
                            "Elixir",
                            fn.getEmoji(client, "Witch Elixir").url
                          )
                          .setDescription("Last night your potion saved a life!")
                      )
                    
                      fn.addLog(
                        game,
                        `Witch ${protector.number} ${nicknames.get(
                          protector.id
                        )} saved ${
                          attackedPlayer.role
                        } ${attackedPlayer.number} ${nicknames.get(
                          attackedPlayer.id
                        )} from a werewolf attack with their elixir potion.`
                      )
                    }
                    else if (protector.role == "Bodyguard") {
                      game.running = "protect from ww attack for bg"
                      protector.health -= 1
                      if (protector.health) {
                        fn.getUser(client, protector.id).send(
                          new Discord.MessageEmbed()
                            .setAuthor(
                              "Attacked!",
                              fn.getEmoji(client, "Bodyguard Protect").url
                            )
                            .setDescription(
                              "You fought off an attack last night and survived.\n" +
                                "Next time you are attacked you will die."
                            )
                        )
                    
                        fn.addLog(
                          game,
                          `Bodyguard ${protector.number} ${nicknames.get(
                            protector.id
                          )} fought off the werewolves for ${
                            attackedPlayer.role
                          } ${attackedPlayer.number} ${nicknames.get(
                            attackedPlayer.id
                          )}.`
                        )
                      } else {
                        game.running = "kill bg protector - attacker ww"
                        game.lastDeath = game.currentPhase
                        protector.alive = false
                        protector.killedBy = wolves.filter(p => p.alive)[
                          Math.floor(
                            Math.random() * wolves.filter(p => p.alive).length
                          )
                        ].number
                        if (game.config.deathReveal)
                          protector.roleRevealed = protector.role
                        fn.broadcastTo(
                          client,
                          game.players.filter(p => !p.left),
                          `The werewolves killed **${
                            protector.number
                          } ${nicknames.get(protector.id)}${
                            game.config.deathReveal
                              ? ` ${fn.getEmoji(client, protector.role)}`
                              : ""
                          }**.`, true
                        )
                    
                        fn.addLog(
                          game,
                          `Bodyguard ${protector.number} ${nicknames.get(
                            protector.id
                          )} died when trying to fight off the werewolves for ${
                            attackedPlayer.role
                          } ${attackedPlayer.number} ${nicknames.get(
                            attackedPlayer.id
                          )}.`
                        )

                        game = fn.death(client, game, protector.number)
                      }
                    }
                    else if (protector.role == "Tough Guy" && weakestWW.alive) {
                      game.running = "protect from ww attack for tg"
                      protector.health = 0

                      fn.getUser(client, protector.id).send(
                        new Discord.MessageEmbed()
                          .setAuthor(
                            "Attacked!",
                            fn.getEmoji(client, "Bodyguard Protect").url
                          )
                          .setDescription(
                            `You protected **${
                              attackedPlayer.number
                            } ${nicknames.get(
                              attackedPlayer.id
                            )}** who was attacked by **${
                              weakestWW.number
                            } ${nicknames.get(weakestWW.id)} ${fn.getEmoji(
                              client,
                              weakestWW.role
                            )}**.\n` +
                              "You have been wounded and will die at the end of the day."
                          )
                      )
                    
                      fn.addLog(
                        game,
                        `Tough Guy ${protector.number} ${nicknames.get(
                          protector.id
                        )} was wounded when fighting off the werewolves for ${
                          attackedPlayer.role
                        } ${attackedPlayer.number} ${nicknames.get(
                          attackedPlayer.id
                        )}. They saw ${weakestWW.role} ${
                          weakestWW.number
                        } ${nicknames.get(weakestWW.id)} ${fn.getEmoji(
                          client,
                          weakestWW.role
                        )} when they tried to run away.`
                      )
                    }
                  }
                }
              }
              else if (attackedPlayer.role == "Cursed") {
                game.running = "convert cursed from ww attack"
                attackedPlayer.role = "Werewolf"
                game.lastDeath = game.currentPhase
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `${fn.getEmoji(client, "Fello Werewolf")} Converted!`
                    )
                    .setDescription(
                      `You have been bitten! You are a ${fn.getEmoji(client, "Werewolf")} Werewolf now!`
                    )
                )
                fn.broadcastTo(
                  client,
                  wolves,
                  `**${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}** is the ${fn.getEmoji(client, "Cursed")} Cursed and is turned into a ${fn.getEmoji(client, "Werewolf")} Werewolf!`
                )
                
                fn.addLog(
                  game,
                  `Cursed ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} was converted into a werewolf.`
                )
              }
              else if (attackedPlayer.role == "Bodyguard") {
                game.running = "bg self-prot from ww attack"
                attackedPlayer.health -= 1
                if (attackedPlayer.health) {
                  fn.getUser(client, attackedPlayer.id).send(
                    new Discord.MessageEmbed()
                      .setTitle(
                        "<:Bodyguard_Protect:660497704526282786> Attacked!"
                      )
                      .setDescription(
                        "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                      )
                  )
                  
                  fn.addLog(
                    game,
                    `Bodyguard ${attackedPlayer.number} ${nicknames.get(
                      attackedPlayer.id
                    )} fought off a werewolf attack.`
                  )
                } else {
                  game.running = "kill bg self-prot - attacker ww"
                  game.lastDeath = game.currentPhase
                  attackedPlayer.alive = false
                  attackedPlayer.killedBy = wolves.filter(p => p.alive)[
                    Math.floor(
                      Math.random() * wolves.filter(p => p.alive).length
                    )
                  ].number
                  if (game.config.deathReveal)
                    attackedPlayer.roleRevealed = attackedPlayer.role
                  fn.broadcastTo(
                    client,
                    game.players.filter(p => !p.left),
                    `The werewolves killed **${
                      attackedPlayer.number
                    } ${nicknames.get(attackedPlayer.id)}${
                      game.config.deathReveal
                        ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                        : ""
                    }**.`
                  )
                  
                  fn.addLog(
                    game,
                    `Bodyguard ${attackedPlayer.number} ${nicknames.get(
                      attackedPlayer.id
                    )} was killed in a werewolf attack.`
                  )

                  game = fn.death(client, game, attackedPlayer.number)
                }
              }
              else if (attackedPlayer.role == "Amulet of Protection Holder" || attackedPlayer.role == "Wise Man") {
                game.running = "amulet/wise man protection from ww kill"
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.MessageEmbed()
                  .setAuthor(
                    "Attacked!",
                    fn.getEmoji(client, "Amulet of Protection Holder").url
                  )
                  .setDescription(
                    `You were attacked by the werewolves during the night, but your amulet saved you!`
                  )
                )
                fn.broadcastTo(
                  client,
                  wolves,
                  `**${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}** cannot be killed!`
                )
                fn.addLog(
                  game,
                  `Bodyguard ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} fought off a werewolf attack.`
                )
              }
              else if (attackedPlayer.role == "Tough Guy" && weakestWW.alive) {
                game.running = "tg self-prot from ww attack"
                attackedPlayer.health = 0

                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.MessageEmbed()
                    .setAuthor(
                      "Attacked!",
                      fn.getEmoji(client, "Bodyguard Protect").url
                    )
                    .setDescription(
                      `You were attacked by **${
                        weakestWW.number
                      } ${nicknames.get(weakestWW.id)} ${fn.getEmoji(
                        client,
                        weakestWW.role
                      )}**.\n` +
                        "You have been wounded and will die at the end of the day."
                    )
                )
                
                fn.addLog(
                  game,
                  `Tough Guy ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} was wounded when fighting off the werewolves and saw ${
                    weakestWW.role
                  } ${weakestWW.number} ${nicknames.get(
                    weakestWW.id
                  )} when they were running away.`
                )
              }
              else {
                game.running = "kill ww-attacked player"
                game.lastDeath = game.currentPhase
                attackedPlayer.alive = false
                attackedPlayer.killedBy = wolves.filter(p => p.alive)[
                  Math.floor(Math.random() * wolves.filter(p => p.alive).length)
                ].number
                if (game.config.deathReveal)
                  attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.left).map(p => p.id),
                  `The werewolves killed **${
                    attackedPlayer.number
                  } ${nicknames.get(attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`, true
                )
                
                fn.addLog(
                  game,
                  `The werewolves killed ${attackedPlayer.role} ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}.`
                )

                game = fn.death(client, game, attackedPlayer.number)
              }
            }
            
            // CANNIBAL EAT
            let canniKilled = []
            for (var canni of cannis) {
              if (canni.usedAbilityTonight) {
                let eatenPlayers = game.players.filter(p => p.alive && canni.usedAbilityTonight.includes(p.number))
                
                for (var attackedPlayer of eatenPlayers) {
                  canni.abil1--
                  if (
                    attackedPlayer.protectors.length ||
                    (attackedPlayer.role == "Red Lady" &&
                      attackedPlayer.visitedTonight)
                  ) {
                    fn.getUser(client, canni.id).send(
                      `**${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )}** cannot be killed!`
                    )

                    if (
                      attackedPlayer.role == "Red Lady" &&
                      attackedPlayer.visitedTonight
                    ) {
                      fn.addLog(
                        game,
                        `Cannibal ${canni.number} ${nicknames.get(canni.id)} couldn't kill Red Lady ${
                        attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} as they weren't home.`
                      )
                      continue;
                    }

                    for (var x of attackedPlayer.protectors) {
                      game.running = "protect from cannibal attack"

                      let protector = game.players[x - 1]

                      if (protector.role == "Jailer") {}
                      else if (protector.role == "Doctor") {
                        game.running = "protect from canni attack for doc"
                        fn.getUser(client, protector.id).send(
                          new Discord.MessageEmbed()
                            .setAuthor(
                              "Protection",
                              fn.getEmoji("Doctor_Protection").url
                            )
                            .setDescription(
                              `Your protection saved **${
                                attackedPlayer.number
                              } ${nicknames.get(attackedPlayer.id)}** last night!`
                            )
                        )
                        fn.addLog(
                          game,
                          `Doctor ${protector.number} ${nicknames.get(protector.id)} saved ${
                          attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Cannibal ${
                          canni.number} ${nicknames.get(canni.id)}'s attack.`
                        )
                      }
                      else if (protector.role == "Beast Hunter") {
                        game.running = "protect from canni attack for bh"
                      
                        delete protector.trap
                        delete protector.trapAct

                        fn.getUser(client, protector.id).send(
                          new Discord.MessageEmbed()
                            .setAuthor(
                              "Trap Triggered!",
                              fn.getEmoji(client, "Beast Hunter TrapInactive").url
                            )
                            .setDescription(
                              "Your target was protected by a trap!"
                            )
                        )
                        fn.addLog(
                          game,
                          `Beast Hunter ${protector.number} ${nicknames.get(protector.id)}'s trap saved ${
                          attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Cannibal ${
                          canni.number} ${nicknames.get(canni.id)}'s attack.`
                        )
                      }
                      else if (protector.role == "Witch") {
                        game.running = "protect from canni attack for witch"
                        protector.abil1 = 0

                        fn.getUser(client, protector.id).send(
                          new Discord.MessageEmbed()
                            .setAuthor("Elixir", fn.getEmoji("Witch Elixir").url)
                            .setDescription("Last night your potion saved a life!")
                        )

                        fn.addLog(
                          game,
                          `Witch ${protector.number} ${nicknames.get(protector.id)} saved ${
                          attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Cannibal ${
                          canni.number} ${nicknames.get(canni.id)}'s attack with their elixir potion.`
                        )
                      }
                      // FORGER'S SHIELD
                      else if (protector.role == "Bodyguard") {
                        game.running = "protect from canni attack for bg"
                        protector.health -= 1
                        if (protector.health) {
                          fn.getUser(client, protector.id).send(
                            new Discord.MessageEmbed()
                              .setTitle(
                                `fn.getEmoji(client, "Bodyguard_Protect") Attacked!`
                              )
                              .setDescription(
                                "You fought off an attack last night and survived.\n" +
                                  "Next time you are attacked you will die."
                              )
                          )

                          fn.addLog(
                            game,
                            `Bodyguard ${protector.number} ${nicknames.get(
                              protector.id
                            )} fought off from Cannibal ${
                              canni.number
                            } ${nicknames.get(canni.id)}'s attack on ${
                              attackedPlayer.number
                            } ${nicknames.get(attackedPlayer.id)}.`
                          )
                        } else {
                          game.running = "kill bg protector - attacker canni"
                          game.lastDeath = game.currentPhase
                          protector.alive = false
                          protector.killedBy = canni.number
                          if (game.config.deathReveal)
                            protector.roleRevealed = protector.role
                          fn.broadcastTo(
                            client,
                            game.players.filter(p => !p.left),
                            `The cannibal ate **${
                              protector.number
                            } ${nicknames.get(protector.id)}${
                              game.config.deathReveal
                                ? ` ${fn.getEmoji(client, protector.role)}`
                                : ""
                            }**.`
                          )

                          fn.addLog(
                            game,
                            `Bodyguard ${protector.number} ${nicknames.get(protector.id)} was stabbed to death when saving ${
                            attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Cannibal ${
                            canni.number} ${nicknames.get(canni.id)}'s attack.`
                          )

                          canniKilled.push(protector.number)

                          // game = fn.death(client, game, protector.number)
                        }
                      }
                      else if (protector.role == "Tough Guy") {
                        game.running = "protect from canni attack for tg"
                        protector.health = 0

                        fn.getUser(client, protector.id).send(
                          new Discord.MessageEmbed()
                            .setAuthor(
                              "Attacked!",
                              fn.getEmoji(client, "Bodyguard Protect").url
                            )
                            .setDescription(
                              `You protected **${
                                attackedPlayer.number
                              } ${nicknames.get(
                                attackedPlayer.id
                              )}** who was attacked by **${
                                canni.number
                              } ${nicknames.get(canni.id)} ${fn.getEmoji(
                                client,
                                canni.role
                              )}**.\n` +
                                "You have been wounded and will die at the end of the day."
                            )
                        )

                        fn.addLog(
                          game,
                          `Tough Guy ${protector.number} ${nicknames.get(protector.id)} was wounded when saving ${
                          attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Cannibal ${
                          canni.number} ${nicknames.get(canni.id)}'s attack.`
                        )
                      }
                    }
                  }
                  else {
                    game.running = "kill canni-attacked player"
                    game.lastDeath = game.currentPhase
                    attackedPlayer.alive = false
                    attackedPlayer.killedBy = canni.number
                    if (game.config.deathReveal)
                      attackedPlayer.roleRevealed = attackedPlayer.role
                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left).map(p => p.id),
                      `The cannibal ate **${
                        attackedPlayer.number
                      } ${nicknames.get(attackedPlayer.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                          : ""
                      }**.`
                    )

                    fn.addLog(
                      game,
                      `${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )} was eaten by Cannibal ${
                        canni.number
                      } ${nicknames.get(canni.id)}.`
                    )

                    canniKilled.push(attackedPlayer.number)
                    // game = fn.death(client, game, attackedPlayer.number)
                  }
                }
              }
              if (canni.abil1 < 5) canni.abil1++
            }
            fn.death(client, game, canniKilled)
            
            // BANDIT KILL

            // SERIAL KILLER KILL
            game.running = "kill for serial killer"
            let skKilled = []
            for (var sk of sks) {
              let attacked = sk.usedAbilityTonight,
                attackedPlayer = game.players[attacked - 1]

              if (
                attackedPlayer.protectors.length ||
                (attackedPlayer.role == "Red Lady" &&
                  attackedPlayer.visitedTonight)
              ) {
                fn.getUser(client, sk.id).send(
                  `**${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )}** cannot be killed!`
                )
                
                if (
                  attackedPlayer.role == "Red Lady" &&
                  attackedPlayer.visitedTonight
                ) {
                  fn.addLog(
                    game,
                    `Serial Killer ${sk.number} ${nicknames.get(sk.id)} couldn't kill Red Lady ${
                    attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} as they weren't home.`
                  )
                  continue;
                }

                for (var x of attackedPlayer.protectors) {
                  game.running = "protect from serial killer attack"

                  let protector = game.players[x - 1]

                  if (protector.role == "Jailer") {}
                  else if (protector.role == "Doctor") {
                    game.running = "protect from sk attack for doc"
                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor(
                          "Protection",
                          fn.getEmoji("Doctor_Protection").url
                        )
                        .setDescription(
                          `Your protection saved **${
                            attackedPlayer.number
                          } ${nicknames.get(attackedPlayer.id)}** last night!`
                        )
                    )
                    fn.addLog(
                      game,
                      `Doctor ${protector.number} ${nicknames.get(protector.id)} saved ${
                      attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Serial Killer ${
                      sk.number} ${nicknames.get(sk.id)}'s attack.`
                    )
                  }
                  else if (protector.role == "Beast Hunter") {
                    game.running = "protect from sk attack for bh"

                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor(
                          "Trap Triggered!",
                          fn.getEmoji(client, "Beast Hunter TrapInactive").url
                        )
                        .setDescription(
                          "Your target was too string to be killed!"
                        )
                    )
                    fn.addLog(
                      game,
                      `Beast Hunter ${protector.number} ${nicknames.get(protector.id)}'s trap saved ${
                      attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Serial Killer ${
                      sk.number} ${nicknames.get(sk.id)}'s attack.`
                    )
                      
                    delete protector.trap
                    delete protector.trapAct
                  }
                  else if (protector.role == "Witch") {
                    game.running = "protect from sk attack for witch"
                    protector.abil1 = 0

                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor("Elixir", fn.getEmoji("Witch Elixir").url)
                        .setDescription("Last night your potion saved a life!")
                    )
                    
                    fn.addLog(
                      game,
                      `Witch ${protector.number} ${nicknames.get(protector.id)} saved ${
                      attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Serial Killer ${
                      sk.number} ${nicknames.get(sk.id)}'s attack with their elixir potion.`
                    )
                  }
                  // FORGER'S SHIELD
                  else if (protector.role == "Bodyguard") {
                    game.running = "protect from sk attack for bg"
                    protector.health -= 1
                    if (protector.health) {
                      fn.getUser(client, protector.id).send(
                        new Discord.MessageEmbed()
                          .setTitle(
                            `fn.getEmoji(client, "Bodyguard_Protect") Attacked!`
                          )
                          .setDescription(
                            "You fought off an attack last night and survived.\n" +
                              "Next time you are attacked you will die."
                          )
                      )
                      
                      fn.addLog(
                        game,
                        `Bodyguard ${protector.number} ${nicknames.get(
                          protector.id
                        )} fought off from Serial Killer ${
                          sk.number
                        } ${nicknames.get(sk.id)}'s attack on ${
                          attackedPlayer.number
                        } ${nicknames.get(attackedPlayer.id)}.`
                      )
                    } else {
                      game.running = "kill bg protector - attacker sk"
                      game.lastDeath = game.currentPhase
                      protector.alive = false
                      protector.killedBy = sk.number
                      if (game.config.deathReveal)
                        protector.roleRevealed = protector.role
                      fn.broadcastTo(
                        client,
                        game.players.filter(p => !p.left),
                        `The serial killer stabbed **${
                          protector.number
                        } ${nicknames.get(protector.id)}${
                          game.config.deathReveal
                            ? ` ${fn.getEmoji(client, protector.role)}`
                            : ""
                        }**.`
                      )
                      
                      fn.addLog(
                        game,
                        `Bodyguard ${protector.number} ${nicknames.get(protector.id)} was stabbed to death when saving ${
                        attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Serial Killer ${
                        sk.number} ${nicknames.get(sk.id)}'s attack.`
                      )
                      
                      skKilled.push(protector.number)

                      // game = fn.death(client, game, protector.number)
                    }
                  }
                  else if (protector.role == "Tough Guy") {
                    game.running = "protect from sk attack for tg"
                    protector.health = 0

                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor(
                          "Attacked!",
                          fn.getEmoji(client, "Bodyguard Protect").url
                        )
                        .setDescription(
                          `You protected **${
                            attackedPlayer.number
                          } ${nicknames.get(
                            attackedPlayer.id
                          )}** who was attacked by **${
                            sk.number
                          } ${nicknames.get(sk.id)} ${fn.getEmoji(
                            client,
                            sk.role
                          )}**.\n` +
                            "You have been wounded and will die at the end of the day."
                        )
                    )
                      
                    fn.addLog(
                      game,
                      `Tough Guy ${protector.number} ${nicknames.get(protector.id)} was wounded when saving ${
                      attackedPlayer.number} ${nicknames.get(attackedPlayer.id)} from Serial Killer ${
                      sk.number} ${nicknames.get(sk.id)}'s attack.`
                    )
                  }
                }
              }
              else if (attackedPlayer.role == "Bodyguard") {
                game.running = "bg self-prot from sk attack"
                attackedPlayer.health -= 1
                if (attackedPlayer.health) {
                  fn.getUser(client, attackedPlayer.id).send(
                    new Discord.MessageEmbed()
                      .setTitle(
                        fn.getEmoji(client, "Bodyguard_Protect") + " Attacked!"
                      )
                      .setDescription(
                        "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                      )
                  )
                      
                  fn.addLog(
                    game,
                    `Bodyguard ${protector.number} ${nicknames.get(protector.id)} fought off an attack from Serial Killer ${
                    sk.number} ${nicknames.get(sk.id)}'s attack.`
                  )
                } else {
                  game.running = "kill bg self-prot - attacker sk"
                  game.lastDeath = game.currentPhase
                  attackedPlayer.alive = false
                  attackedPlayer.killedBy = sk.number
                  if (game.config.deathReveal)
                    attackedPlayer.roleRevealed = attackedPlayer.role
                  fn.broadcastTo(
                    client,
                    game.players.filter(p => !p.left),
                    `The serial killer stabbed **${
                      attackedPlayer.number
                    } ${nicknames.get(attackedPlayer.id)}${
                      game.config.deathReveal
                        ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                        : ""
                    }**.`
                  )
                      
                  fn.addLog(
                    game,
                    `Bodyguard ${attackedPlayer.number} ${nicknames.get(
                      attackedPlayer.id
                    )} was stabbed to death by Serial Killer ${
                      sk.number
                    } ${nicknames.get(sk.id)}.`
                  )
                  skKilled.push(attackedPlayer.number)
                  // game = fn.death(client, game, attackedPlayer.number)
                }
              }
              else if (attackedPlayer.role == "Tough Guy") {
                game.running = "tg self-prot from sk attack"
                attackedPlayer.health = 0

                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.MessageEmbed()
                    .setAuthor(
                      "Attacked!",
                      fn.getEmoji(client, "Bodyguard Protect").url
                    )
                    .setDescription(
                      `You were attacked by **${sk.number} ${nicknames.get(
                        sk.id
                      )} ${fn.getEmoji(client, sk.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                    )
                )
                      
                fn.addLog(
                  game,
                  `Tough Guy ${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} was wounded when fighting off an attack from Serial Killer ${
                    sk.number
                  } ${nicknames.get(sk.id)}'s attack.`
                )
              }
              else {
                game.running = "kill sk-attacked player"
                game.lastDeath = game.currentPhase
                attackedPlayer.alive = false
                attackedPlayer.killedBy = sk.number
                if (game.config.deathReveal)
                  attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.left).map(p => p.id),
                  `The serial killer stabbed **${
                    attackedPlayer.number
                  } ${nicknames.get(attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
                      
                fn.addLog(
                  game,
                  `${attackedPlayer.number} ${nicknames.get(
                    attackedPlayer.id
                  )} was stabbed to death by Serial Killer ${
                    sk.number
                  } ${nicknames.get(sk.id)}.`
                )
                
                skKilled.push(attackedPlayer.number)
                // game = fn.death(client, game, attackedPlayer.number)
              }
            }
            game = fn.death(client, game, skKilled)
            
            game.running = "kill rl visiting evil player"
            let killedRLlist = []
            let killVisitRL = (player) => {
              let killedRLs = game.players.filter(rl => rl.role == "Red Lady" && rl.alive && rl.usedAbilityTonight == player.number)
              for (var killedRL of killedRLs) {
                killedRL.alive = false
                killedRL.roleRevealed = "Red Lady"
                killedRL.killedBy =
                  game.players[killedRL.usedAbilityTonight - 1].number
                game.lastDeath = game.currentPhase
                // game = fn.death(client, game, killedRL.number)
                killedRLlist.push(killedRL.number)

                fn.addLog(
                  game,
                  `Red Lady ${killedRL.number} ${nicknames.get(killedRL.id)} visited ${
                    game.players[killedRL.usedAbilityTonight - 1].role
                  } ${
                    game.players[killedRL.usedAbilityTonight - 1].number
                  } ${nicknames.get(game.players[killedRL.usedAbilityTonight - 1].id)} and died.`
                )
                
                killVisitRL(killedRL)
              }
            }
            let rlVisitEvil = game.players.filter(
              rl =>
                rl.role == "Red Lady" &&
                rl.alive &&
                rl.usedAbilityTonight &&
                (roles[game.players[rl.usedAbilityTonight - 1].role].team !==
                  "Village" || game.players[rl.usedAbilityTonight - 1].killedBy)
            )
            for (var rl of rlVisitEvil) killVisitRL(game.players[rl.usedAbilityTonight-1])
            fn.death(client, game, killedRLlist)
            for (var rl of game.players.filter(p => killedRLlist.includes(p.number)))
              fn.broadcastTo(
                client,
                game.players.filter(p => !p.left),
                `<:Red_Lady_LoveLetter:674854554369785857> **${
                  rl.number
                } ${nicknames.get(rl.id)} ${fn.getEmoji(
                  client,
                  "Red Lady"
                )}** visited an evil player and died!`
              )
            
            // KITTEN CONVERSION
            game.running = "convert player for kww"
            for (var kww of kwws) {
              let attackedPlayer = game.players[kww.usedAbilityTonight - 1]
              if (!attackedPlayer.alive) continue
              if (roles[attackedPlayer.role].team == "Werewolves") continue;
              let convertRLs = (player) => {
                let rls = game.players.filter(rl => rl.role == "Red Lady" && rl.usedAbilityTonight == player.number && rl.alive)
                for (var rl of rls) {
                  if (rl.headhunter) continue;

                  game.lastDeath = game.currentPhase
                  fn.broadcastTo(
                    client,
                    game.players.filter(
                      p =>
                        !p.left && roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF
                    ),
                    `Kitten Wolf converted **${
                      rl.number
                    } ${nicknames.get(
                      rl.id
                    )}**. They are now a werewolf!`
                  )
                  rl.role = "Werewolf"
                  fn.getUser(client, rl.id).send(
                    `You were scratched by the kitten wolf. You are now a werewolf!` +
                      `Check out who your teammates are in \`w!game\`.`
                  )
                      
                  fn.addLog(
                    game,
                    `Red Lady ${rl.number} ${nicknames.get(
                      rl.id
                    )} was scratched by Kitten Wolf ${
                      kww.number
                    } ${nicknames.get(kww.id)} when visiting ${
                      attackedPlayer.number
                    } ${nicknames.get(attackedPlayer.id)} and is now a Werewolf.`
                  )
                  convertRLs(rl)
                }
              }
              if (
                roles[attackedPlayer.role].team !== "Village" ||
                attackedPlayer.headhunter || attackedPlayer.sect || attackedPlayer.role === "Amulet of Protection Holder"
              ) {
                fn.broadcastTo(
                  client,
                  game.players.filter(
                    p =>
                      !p.left && roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF
                  ),
                  `Kitten Wolf tried to convert **${
                    attackedPlayer.number
                  } ${nicknames.get(attackedPlayer.id)}** but failed!` +
                    ` They were either protected, a Headhunter's target, or not a villager.`
                )
                
                fn.addLog(
                  game,
                  `Kitten Wolf ${kww.number} ${nicknames.get(kww.id)} could not convert ${
                    attackedPlayer.number
                  } ${nicknames.get(attackedPlayer.id)} (${attackedPlayer.role}).`
                )
              }
              else if (attackedPlayer.protectors.length) {
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left && (roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF)),
                  `Kitten Wolf tried to convert **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}**!` +
                  ` They were either protected, a Headhunter's target, or not a villager.`
                )

                for (var x of attackedPlayer.protectors) {
                  let protector = game.players[x-1]

                  if (protector.role == "Doctor") {
                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor("Protection", fn.getEmoji(client, "Doctor Protect").url)
                        .setDescription(
                          `Your protection saved **${attackedPlayer.number} ${nicknames.get(attackedPlayer.id)}** last night!`
                        )
                    )
                
                    fn.addLog(
                      game,
                      `Doctor ${protector.number} ${nicknames.get(protector.id)} healed ${attackedPlayer.role} ${
                        attackedPlayer.number
                      } ${nicknames.get(attackedPlayer.id)} from Kitten Wolf ${kww.number} ${nicknames.get(kww.id)}'s scratch.`
                    )
                  }
                  else if (protector.role == "Beast Hunter") {
//                     kww.alive = false
//                     if (game.config.deathReveal) kww.roleRevealed = kww.role
//                     else kww.roleRevealed = "Fellow Werewolf"

//                     fn.broadcastTo(
//                       client, game.players.filter(p => !p.left),
//                       `The beast hunter's trap killed **${kww.number} ${
//                         nicknames.get(kww.id)
//                       } ${
//                         game.config.deathReveal
//                           ? fn.getEmoji(client, kww.role)
//                           : fn.getEmoji(client, "Fellow Werewolf")
//                       }**.`
//                     )
                
                    fn.addLog(
                      game,
                      `Beast Hunter ${protector.number} ${nicknames.get(
                        protector.id
                      )}'s trap prevented Kitten Wolf ${
                        kww.number
                      } ${nicknames.get(
                        kww.id
                      )} from scratching ${
                        attackedPlayer.role
                      } ${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )}.`
                    )
                    
                    delete protector.trap
                    delete protector.trapAct

                    // game = fn.death(client, game, kww.number)
                  }
                  else if (protector.role == "Witch") {
                    protector.abil1 = 0

                    fn.getUser(client, protector.id).send(
                      new Discord.MessageEmbed()
                        .setAuthor("Elixir", fn.getEmoji(client, "Witch Elixir").url)
                        .setDescription("Last night your potion saved a life!")
                    )
                
                    fn.addLog(
                      game,
                      `Witch ${protector.number} ${nicknames.get(
                        protector.id
                      )} saved ${attackedPlayer.role} ${
                        attackedPlayer.number
                      } ${nicknames.get(attackedPlayer.id)} from Kitten Wolf ${
                        kww.number
                      } ${nicknames.get(kww.id)}'s scratch with their elixir.`
                    )
                  }
                  else if (protector.role == "Bodyguard" || protector.role == "Tough Guy") {
                    game.lastDeath = game.currentPhase
                    fn.broadcastTo(
                      client,
                      game.players.filter(
                        p =>
                          !p.left && roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF
                      ),
                      `Kitten Wolf converted **${
                        attackedPlayer.number
                      } ${nicknames.get(
                        attackedPlayer.id
                      )}**. They are now a werewolf!`
                    )
                    attackedPlayer.role = "Werewolf"
                    fn.getUser(client, attackedPlayer.id).send(
                      `You were scratched by the Kitten Wolf. You are now a werewolf!` +
                        `Check out who your teammates are in \`w!game\`.`
                    )
                
                    fn.addLog(
                      game,
                      `${protector.role} ${protector.number} ${nicknames.get(
                        protector.id
                      )} was scratched by Kitten Wolf ${
                        kww.number
                      } ${nicknames.get(kww.id)} whilst protecting ${attackedPlayer.number} ${nicknames.get(
                        attackedPlayer.id
                      )} (${
                        attackedPlayer.role
                      }).`
                    )

                    convertRLs(protector)
                  }
                }
              }
              else {
                game.lastDeath = game.currentPhase
                fn.broadcastTo(
                  client,
                  game.players.filter(
                    p =>
                      !p.left && roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF
                  ),
                  `Kitten Wolf converted **${
                    attackedPlayer.number
                  } ${nicknames.get(
                    attackedPlayer.id
                  )}**. They are now a werewolf!`
                )
                attackedPlayer.role = "Werewolf"
                fn.getUser(client, attackedPlayer.id).send(
                  `You were scratched by the kitten wolf. You are now a werewolf!` +
                    `Check out who your teammates are in \`w!game\`.`
                )
                
                fn.addLog(
                  game,
                  `${attackedPlayer.role} ${
                    attackedPlayer.number
                  } ${nicknames.get(attackedPlayer.id)} was scratched by Kitten Wolf ${
                    kww.number
                  } ${nicknames.get(kww.id)} and is now a Werewolf.`
                )
                
                convertRLs(attackedPlayer)
              }
              kww.abil1 -= 1
            }

            // SECT CONVERSION
            game.running = "convert player for sect"
            let sl = game.players.find(p => p.role == "Sect Leader" && p.alive)
            if (sl && sl.usedAbilityTonight) {
              let sectTarget = game.players[sl.usedAbilityTonight - 1]
              
              // if (sectTarget.protectors.find(p => game.players[p-1].role == "Beast Hunter"))

              if (
                (!sectTarget.protectors || (sectTarget.protectors && !sectTarget.protectors.find(p => game.players[p-1].role == "Beast Hunter"))) &&
                sectTarget.role !== "Cursed" &&
                (roles[sectTarget.role].team == "Village" ||
                ["Fool", "Headhunter"].includes(sectTarget.role))
              ) {
                sectTarget.sect = true
                game.lastDeath = game.currentPhase
                fn.getUser(client, sectTarget.id).send(
                  new Discord.MessageEmbed()
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
                            `${p.number} ${nicknames.get(p.id)} ${
                              !p.alive ? ` ${fn.getEmoji(client, "Death")}` : ""
                            }`
                        )
                    )
                )

                fn.broadcastTo(
                  client,
                  game.players.filter(p => p.sect),
                  new Discord.MessageEmbed()
                    .setTitle("Welcome to the Gang")
                    .setThumbnail(fn.getEmoji(client, "Sect Member").url)
                    .setDescription(
                      `**${sectTarget.number} ${nicknames.get(
                        sectTarget.id
                      )}${sectTarget.roleRevealed ? fn.getEmoji(
                        client,
                        sectTarget.roleRevealed
                      ) : ""}** is turned into the sect!`
                    )
                    .addField(
                      "Sect Members",
                      game.players
                        .filter(p => p.sect)
                        .map(
                          p =>
                            `${p.number} ${nicknames.get(p.id)}${
                              !p.alive ? ` ${fn.getEmoji(client, "Death")}` : ""
                            }`
                        )
                    )
                )
                
                fn.addLog(
                  game,
                  `${sectTarget.role} ${
                    sectTarget.number
                  } ${nicknames.get(sectTarget.id)} was turned into the sect of ${
                    sl.number
                  } ${nicknames.get(sl.id)}.`
                )
              }
              else {
                fn.getUser(client, sl.id).send(
                  `**${sectTarget.number} ${nicknames.get(
                    sectTarget.id
                  )}** cannot be sected!`
                )
                
                fn.addLog(
                  game,
                  `Sect Leader ${
                    sl.number
                  } ${nicknames.get(sl.id)} tried to turn ${
                    sectTarget.number
                  } ${nicknames.get(sectTarget.id)} (${sectTarget.role}) into their sect but failed.`
                )
              }
            }

            // SPIRIT SEER RESULTS
            game.running = "give spirit seer results"
            let spzs = game.players.filter(
              p => p.alive && p.role == "Spirit Seer" && p.usedAbilityTonight && p.usedAbilityTonight.length
            )
            for (var spz of spzs) {
              let targets = spz.usedAbilityTonight.map(
                p => game.players[p - 1]
              )
              console.log(spz)
              console.log(targets)
              if (targets[0].killedTonight || (targets[1] && targets[1].killedTonight)){
                fn.getUser(client, spz.id).send(
                  new Discord.MessageEmbed()
                    .setTitle("They had an evil soul...")
                    .setThumbnail(fn.getEmoji(client, "Spirit Seer Killed").url)
                    .setDescription(
                      `**${targets[0].number} ${nicknames.get(
                        targets[0].id
                      )}** ${targets[1] ? `and/or **${targets[1].number} ${nicknames.get(
                        targets[1].id
                      )}**` : ""} killed last night!`
                    )
                )
                
                fn.addLog(
                  game,
                  `Spirit Seer ${
                    spz.number
                  } ${nicknames.get(spz.id)} found that ${targets[1] ? "either " : ""}${targets[0].number} ${nicknames.get(
                    targets[0].id
                  )} ${targets[1] ? `or ${targets[1].number} ${nicknames.get(
                    targets[1].id
                  )}` : ""} killed last night.`
                )
              }
              else {
                fn.getUser(client, spz.id).send(
                  new Discord.MessageEmbed()
                    .setTitle("Good for tonight")
                    .setThumbnail(
                      fn.getEmoji(client, "Spirit Seer NotKilled").url
                    )
                    .setDescription(targets[1] ? `Neither of **${targets[0].number} ${nicknames.get(
                        targets[0].id
                      )}** or **${targets[1].number} ${nicknames.get(
                        targets[1].id
                      )}** killed last night.` : `**${targets[0].number} ${nicknames.get(
                        targets[0].id
                      )}** did not kill last night.`
                    )
                )
                
                fn.addLog(
                  game, 
                  `Spirit Seer ${
                    spz.number
                  } ${nicknames.get(spz.id)} found that ${targets[1] ? "neither " : ""}${targets[0].number} ${nicknames.get(
                    targets[0].id
                  )} ${targets[1] ? `or ${targets[1].number} ${nicknames.get(
                    targets[1].id
                  )}` : ""} killed last night.`
                )
              }
            }

            // SHERIFF RESULTS
            game.running = "give sheriff results"
            let sheriffs = game.players.filter(
              p => p.alive && p.role == "Sheriff" && p.usedAbilityTonight
            )
            for (var sheriff of sheriffs) {
              console.log(sheriff)
              let target = game.players[sheriff.usedAbilityTonight - 1]
              if (!target.killedBy) continue;

              let one = Math.floor(Math.random() * 2) == 1
              let killedBy = game.players[target.killedBy - 1]
              let suspects = [killedBy]
              let other = game.players.filter(
                p =>
                  p.alive &&
                  p.number !== killedBy.number &&
                  p.number !== sheriff.number
              )
              if (other.length) {
                let random = other[Math.floor(Math.random() * other.length)]
                suspects.push(random)
                suspects = game.players.filter(p => suspects.map(x => x.number).includes(p.number))
              }
              
              fn.getUser(client, sheriff.id).send(
                new Discord.MessageEmbed()
                  .setTitle("You were up for something...")
                  .setThumbnail(fn.getEmoji(client, "Sheriff Suspect").url)
                  .setDescription(
                    `${suspects.map(p => `**${p.number} ${nicknames.get(
                      p.id
                    )}**`).join(' or ')} killed **${target.number} ${nicknames.get(
                      target.id
                    )}** last night.`
                  )
              )
                
              fn.addLog(
                game,
                `Sheriff ${sheriff.number} ${nicknames.get(
                  sheriff.id
                )} found that ${suspects
                  .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                  .join(" or ")} killed ${target.number} ${nicknames.get(
                  target.id
                )} last night.`
              )
            }

            // GRUMPY GRANDMA MUTE
            game.running = "mute for gg"
            for (var gg of ggs) {
              let muted = game.players[gg.usedAbilityTonight - 1]
              if (!muted.alive) continue

              muted.mute = true
              gg.prevmute = muted.number

              fn.getUser(client, muted.id).send(
                new Discord.MessageEmbed()
                  .setAuthor(
                    "Muted!",
                    fn.getEmoji(client, "Grumpy Grandma Mute").url
                  )
                  .setThumbnail(fn.getEmoji(client, "Grumpy Grandma").url)
                  .setDescription("You cannot speak or vote today!")
              )
              fn.broadcastTo(
                client,
                game.players.filter(p => !p.left),
                `${fn.getEmoji(client, "Grumpy_Grandma_Mute")} Grumpy Grandma muted **${
                  muted.number
                } ${nicknames.get(muted.id)}**!` +
                  `They cannot speak or vote today.`
              )
                
              fn.addLog(
                game,
                `Grumpy Grandma ${gg.number} ${nicknames.get(
                  gg.id
                )} forbid ${
                  muted.number
                } ${nicknames.get(muted.id)} (${muted.role}) from speaking today.`
              )
            }

            // CUPID LOVER
            game.running = "assign lovers for cupid"
            if (
              game.currentPhase == 1 &&
              game.players.find(p => p.role == "Cupid")
            ) {
              let cupid = game.players.find(p => p.role == "Cupid")
              if (!cupid.usedAbilityTonight) cupid.usedAbilityTonight = []
              let lovers = []
              for (var loverNumber of cupid.usedAbilityTonight) {
                let lover = game.players[loverNumber - 1]
                if (!lover.alive) {
                  let possible = game.players.filter(
                    p => p.alive && p.role != "Cupid"
                  )
                  lover =
                    game.players[
                      possible[Math.floor(Math.random() * possible.length)]
                        .number - 1
                    ]
                }
                lover.couple = true
                lovers.push(lover)
              }
              if (!lovers[0])
                lovers[0] = game.players.filter(
                  p => p.alive && p.role !== "Cupid"
                )[
                  Math.floor(
                    Math.random() *
                      game.players.filter(p => p.alive && p.role !== "Cupid")
                        .length
                  )
                ]
              if (!lovers[1])
                lovers[1] = game.players.filter(
                  p =>
                    p.alive &&
                    p.role !== "Cupid" &&
                    p.number !== lovers[0].number
                )[
                  Math.floor(
                    Math.random() *
                      game.players.filter(
                        p =>
                          p.alive &&
                          p.role !== "Cupid" &&
                          p.number !== lovers[0].number
                      ).length
                  )
                ]
              fn.getUser(client, lovers[0].id).send(
                new Discord.MessageEmbed()
                  .setTitle("Love Was When")
                  .setThumbnail(fn.getEmoji(client, "Cupid Lovers").url)
                  .setDescription(
                    `You are in love with **${lovers[1].number} ${nicknames.get(
                      lovers[1].id
                    )} ${fn.getEmoji(client, lovers[1].role)}**.` +
                      ` You will die together! ${
                        roles[lovers[0].role].team !==
                        roles[lovers[1].role].team
                          ? "You and the Cupid win if you are the last players alive apart from the Cupid."
                          : "You also win with your team."
                      }`
                  )
              )
              fn.getUser(client, lovers[1].id).send(
                new Discord.MessageEmbed()
                  .setTitle("Love Was When")
                  .setThumbnail(fn.getEmoji(client, "Cupid Lovers").url)
                  .setDescription(
                    `You are in love with **${lovers[0].number} ${nicknames.get(
                      lovers[0].id
                    )} ${fn.getEmoji(client, lovers[0].role)}**.` +
                    `You have to stay alive with them until the end of the game. If ${nicknames.get(lovers[0].id)} dies, you die along with them!`
                  )
              )
            }

            // ILLUSIONIST DISGUISE
            game.running = "disguise by illu"
            let illus = game.players.filter(
              p => p.alive && p.role == "Illusionist" && p.usedAbilityTonight
            )
            for (var illu of illus) {
              let disguisedPlayer = game.players[illu.usedAbilityTonight - 1]
              if (!disguisedPlayer.alive) continue;
              if (disguisedPlayer.role == "Red Lady" && disguisedPlayer.usedAbilityTonight) continue;
              disguisedPlayer.disguised = true
              game.lastDeath = game.currentPhase
              illu.deluded.push(disguisedPlayer.number)
              fn.getUser(client, illu.id).send(
                new Discord.MessageEmbed()
                  .setTitle("Magic")
                  .setThumbnail(fn.getEmoji(client, "Illusionist Delude").url)
                  .setDescription(
                    `**${disguisedPlayer.number} ${nicknames.get(
                      disguisedPlayer.id
                    )}** has been disguised!`
                  )
              )
                
              fn.addLog(
                game,
                `Illusionist ${illu.number} ${nicknames.get(
                  illu.id
                )} disguised ${
                  disguisedPlayer.number
                } ${nicknames.get(disguisedPlayer.id)} (${disguisedPlayer.role}) as an Illusionist.`
              )
              
              let disguiseRL = (player) => {
                for (var rl of game.players.filter(p => p.role == "Red Lady" && p.usedAbilityTonight == disguisedPlayer.number)) {
                  rl.disguised = true
                  game.lastDeath = game.currentPhase
                  illu.deluded.push(rl.number)
                  fn.getUser(client, illu.id).send(
                    new Discord.MessageEmbed()
                      .setTitle("Magic")
                      .setThumbnail(fn.getEmoji(client, "Illusionist Delude").url)
                      .setDescription(
                        `**${rl.number} ${nicknames.get(
                          rl.id
                        )}** has been disguised!`
                      )
                  )
                
                  fn.addLog(
                    game,
                    `Illusionist ${illu.number} ${nicknames.get(
                      illu.id
                    )} rl ${
                      disguisedPlayer.number
                    } ${nicknames.get(rl.id)} (${rl.role}) as an Illusionist.`
                  )
                  disguiseRL(rl)
                }
              }
              disguiseRL(disguisedPlayer)
            }

            // ARSONIST DOUSE
            game.running = "douse by arso"
            let arsos = game.players.filter(
              p =>
                p.alive &&
                p.role == "Arsonist" &&
                p.usedAbilityTonight &&
                p.usedAbilityTonight !== "ignite"
            )
            for (var arso of arsos) {
              let doused = arso.usedAbilityTonight
                .map(p => game.players[p - 1])
                .filter(p => p.alive)
              let dousedPlayers = []
              let douseRL = (player) => {
                for (var rl of game.players.filter(p => p.alive && p.role == "Red Lady" && p.usedAbilityTonight == player.number)) {
                  if (!arso.doused) arso.doused = []
                  arso.doused.push(rl.number)
                  game.lastDeath = game.currentPhase
                  dousedPlayers.push(rl)
                  // fn.getUser(client, arso.id).send(
                  //   new Discord.MessageEmbed()
                  //     .setTitle("Medium Rare")
                  //     .setThumbnail(fn.getEmoji(client, "Arsonist Douse").url)
                  //     .setDescription(
                  //       `**${rl.number} ${nicknames.get(rl.id)}** has been doused with gasoline!`
                  //     )
                  // )
                }
              }
              for (var dousedPlayer of doused) {
                if (!arso.doused) arso.doused = []
                if (dousedPlayer.role == "Red Lady" && dousedPlayer.usedAbilityTonight) continue;
                arso.doused.push(dousedPlayer.number)
                game.lastDeath = game.currentPhase
                dousedPlayers.push(dousedPlayer)
                douseRL(dousedPlayer)
              }
              fn.getUser(client, arso.id).send(
                new Discord.MessageEmbed()
                  .setTitle("Medium Rare")
                  .setThumbnail(fn.getEmoji(client, "Arsonist Douse").url)
                  .setDescription(
                    `${dousedPlayers.map(p => `**${p.number} ${nicknames.get(
                      p.id
                    )}**`)} ${dousedPlayers.length == 1 ? "has" : "have"} been doused with gasoline!`
                  )
              )
                
              fn.addLog(
                game,
                `Arsonist ${arso.number} ${nicknames.get(
                  arso.id
                )} doused ${dousedPlayers.map(p => `${p.number} ${nicknames.get(
                  p.id
                )} ${p.role}`).join(", ")} with gasoline.`
              )
            }

            // ZOMBIE BITE
            // game.running = "convert by zomb"
            // let bitten = game.players.filter(p => p.bitten && p.alive)
            // for (var bit of bitten) {
            //   bit.role = "Zombie"
            //   game.lastDeath = game.currentPhase
            //   fn.getUser(client, bit.id).send(
            //     new Discord.MessageEmbed()
            //       .setTitle("Rrrrrrr")
            //       .setDescription(
            //         "You have been bitten by zombies and are now one of them!"
            //       )
            //       .setThumbnail(fn.getEmoji(client, "Zombie").url)
            //   )
            //   bit.bitten = false
            // }
            // let zombies = game.players.filter(
            //   p => p.alive && p.role == "Zombie"
            // )
            // if(bitten.array().length){
            // fn.broadcastTo(
            //   client,
            //   zombies,
            //   new Discord.MessageEmbed()
            //     .setTitle("New FRRrrrrriends")
            //     .setDescription(
            //       `${bitten
            //         .map(b => nicknames.get(b.id))
            //         .join(", ")} are now zombies!`
            //     )
            //     .setThumbnail(fn.getEmoji(client, "Zombie").url)
            // )
            // }
            // game.running = "bite by zomb"
            // let cannotBite = []
            // for (var zombie of zombies.filter(z => z.usedAbilityTonight)) {
            //   let bit = game.players[zombie.usedAbilityTonight - 1]
            //   if (["Cursed","President","Doppelganger"].includes(bit.role) || bit.sect ||
            //      bit.headhunter || !(roles[bit.role].team == "Villager" || (roles[bit.role].tag & tags.ROLE.SOLO_VOTING))) {
            //     cannotBite.push(bit)
            //   }
            //   else bit.bitten = true
            // }
            // bitten = game.players.filter(p => p.bitten && p.alive)
            // fn.broadcastTo(
            //   client,
            //   zombies,
            //   new Discord.MessageEmbed()
            //     .setTitle("BRAINS")
            //     .setDescription(
            //       (bitten.length ? `${bitten
            //         .map(b => `**${b.number} ${nicknames.get(b.id)}**`)
            //         .join(", ")} are now bitten!\n` : "") +
            //       (cannotBite.length ? `${cannotBite
            //         .map(c => `**${c.number} ${nicknames.get(c.id)}**`)
            //         .join(", ")} cannot be bitten!` : "")
            //     )
            //     .setThumbnail(fn.getEmoji(client, "Zombie Bitten").url)
            // )

            // CORRUPTOR GLITCH
            game.running = "glitch by corr"
            let corrs = game.players.filter(
              p => p.alive && p.role == "Corruptor" && p.usedAbilityTonight
            )
            for (var corr of corrs) {
              let glitched = game.players[corr.usedAbilityTonight - 1],
                  glitchedPlayers = []
              if (!glitched.alive) continue;
              glitched.mute = corr.number
              corr.glitched = [glitched.number]
              fn.getUser(client, glitched.id).send(
                new Discord.MessageEmbed()
                  .setTitle("Glitched")
                  .setThumbnail(fn.getEmoji(client, "Corruptor Glitch").url)
                  .setDescription(
                    `You have been glitched by a corruptor! You cannot speak or vote today and will die at the end of the day.`
                  )
              )
              glitchedPlayers.push(glitched)
                
              let corruptRLs = (player) => {
                let rls = game.players.filter(rl => rl.role == "Red Lady" && rl.usedAbilityTonight == player.number && rl.alive)
                for (var rl of rls) {
                  if (!rl.alive) continue;
                  rl.mute = corr.number
                  corr.glitched.push(rl.number)
                  // fn.getUser(client, corr.id).send(
                  //   new Discord.MessageEmbed()
                  //     .setTitle("Glitching")
                  //     .setThumbnail(fn.getEmoji(client, "Corruptor Glitch").url)
                  //     .setDescription(
                  //       `**${rl.number} ${nicknames.get(
                  //         rl.id
                  //       )}** has been glitched!`
                  //     )
                  // )
                  glitchedPlayers.push(glitched)
                  fn.getUser(client, rl.id).send(
                    new Discord.MessageEmbed()
                      .setTitle("Glitched")
                      .setThumbnail(fn.getEmoji(client, "Corruptor Glitch").url)
                      .setDescription(
                        `You have been glitched by a corruptor! You cannot speak or vote today and will die at the end of the day.`
                      )
                  )
                  corruptRLs(rl)
                }
              }
              corruptRLs(glitched)
              
              fn.getUser(client, corr.id).send(
                new Discord.MessageEmbed()
                  .setTitle("Glitching")
                  .setThumbnail(fn.getEmoji(client, "Corruptor Glitch").url)
                  .setDescription(
                    `${glitchedPlayers.map(p => `**${p.number} ${nicknames.get(
                      p.id
                    )}**`)} has been glitched!`
                  )
              )
              
              fn.addLog(
                game,
                `Corruptor ${corr.number} ${nicknames.get(
                  corr.id
                )} corrupted ${glitchedPlayers
                  .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                  .join(", ")}.`
              )
            }

            if (game.frenzy) game.frenzy = false
            // CLEAR NIGHT SELECTIONS
            game.running = "clear night selections"
            for (var x = 0; x < game.players.length; x++) {
              game.players[x].usedAbilityTonight = false
              if (game.players[x].enchanted)
                if (game.players.find(p => p.role == "Wolf Shaman" && p.alive))
                  game.players[x].enchanted = []
                else delete game.players[x].enchanted
              if (game.players[x].jailed) game.players[x].jailed = false
              game.players[x].protectors = []
              game.players[x].killedBy = undefined
              if (game.players[x].nightmared) delete game.players[x].nightmared
            }
          }

          for (var j = 0; j < game.players.length; j++) {
            game.players[j].vote = null
            if (game.currentPhase % 3 == 2) {
              game.players[j].mute = false
            }
          }
          
          if (game.currentPhase % 3 == 2) {
            game.running = "kill attacked tg"
            let killedtgs = []
            for (var tg of game.players.filter(p => p.role == "Tough Guy" && p.alive && !p.health)) {
              Object.assign(tg, {
                health: 1,
                alive: false,
                roleRevealed: tg.role
              })

              fn.broadcastTo(
                client,
                game.players.filter(p => !p.left),
                `**${tg.number} ${nicknames.get(
                  tg.id
                )} ${fn.getEmoji(
                  client,
                  "Tough Guy"
                )}** was wounded last night and has died now.`
              )
              
              killedtgs.push(tg)
              
              fn.addLog(
                game,
                `Tough Guy ${tg.number} ${nicknames.get(
                  tg.id
                )} died of wounds.`
              )
            }
            
            game = fn.death(client, game, killedtgs.map(p => p.number))
            
            game.running = "kill glitched player"
            let corruptedDeaths = []
            for (var corr of game.players.filter(p => p.role == "Corruptor" && p.glitched && p.alive)) {
              for (var glitchedPlayer of corr.glitched) {
                let glitched = game.players[glitchedPlayer-1]
                if (!glitched.alive) continue;
                corruptedDeaths.push(glitched)
                game.lastDeath = game.currentPhase
                Object.assign(glitched, {
                  alive: false,
                  roleRevealed: "Unknown"
                })

                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `**${glitched.number} ${nicknames.get(
                    glitched.id
                  )} ${fn.getEmoji(
                    client, "Unknown"
                  )}** was glitched and has died now.`
                )
              
                fn.addLog(
                  game,
                  `${glitched.role} ${glitched.number} ${nicknames.get(
                    tg.id
                  )} was glitched and died.`
                )
              }
              delete corr.glitched
            }
            game = fn.death(client, game, corruptedDeaths.map(p => p.number), "corr")
          }

          let alive = game.players.filter(p => p.alive),
              aliveRoles = alive.map(p => p.role)
          
          game.running = "test for tie"
          if (
            game.lastDeath + 9 == game.currentPhase ||
            !alive.length || alive.length == 0 ||
            (alive.length == 2 && aliveRoles.includes("Amulet of Protection Holder") &&
             roles[aliveRoles.filter(r => !r == "Amulet of Protection Holder")[0]].tag & tags.ROLE.SEEN_AS_WEREWOLF)
          ) {
            game.running = "tie end"
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Death").url)
                .setDescription(`It was a tie. There are no winners.`)
            )
            game.running = "give tie xp"
            fn.addXP(game, game.players.filter(p => !p.suicide), 15)
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(game, [])
            fn.addLog(
              game,
              `[RESULT] The game ended in a tie. No one won!`
            )
            continue
          }

          game.running = "test for kill president win conditions"
          if (
            game.players.find(
              p => p.role == "President" && !p.alive && !p.suicide
            )
          ) {
            let president = game.players.find(p => p.role == "President")
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "President").url)
                .setDescription(
                  `The President **${president.number} ${nicknames.get(
                    president.id
                  )}** <:President:660497498430767104> was killed! All but the villagers have won!`
                )
            )
            game.running = "give xp and win for pres win cond"
            fn.addXP(game, game.players.filter(p => p.sect && !p.suicide), 50)
            fn.addXP(game, 
              game.players.filter(
                p =>
                  (roles[p.role].team == "Werewolves" || p.role == "Zombie") &&
                  !p.suicide
              ),
              75
            )
            fn.addXP(game, 
              game.players.filter(
                p =>
                  [
                    "Headhunter",
                    "Fool",
                    "Bomber",
                    "Arsonist",
                    "Corruptor"
                  ].includes(p.role) && !p.suicide
              ),
              100
            )
            fn.addXP(game, 
              game.players.filter(p => p.role == "Sect Leader" && !p.suicide),
              70
            )
            fn.addXP(game, game.players.filter(p => p.sect && !p.suicide), 50)
            fn.addXP(game, 
              game.players.filter(p => p.role == "Serial Killer" && !p.suicide),
              250
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(
              game,
              game.players
                .filter(p => !p.suicide && roles[p.role].team != "Village")
                .map(p => p.number)
            )
            fn.addLog(
              game,
              `[RESULT] The President was killed. All but the village win!\n[RESULT] Winners: ${game.players.filter(
                p => !(roles[p.role].team == "Village" && !p.sect)
              )}`
            )
            continue;
          }

          game.running = "test for soul collector win conditions"
          if (
            alive.find(
              p =>
                p.role == "Soul Collector" &&
                p.alive &&
                game.players.filter(p => p.boxed).length >=
                  Math.round(game.players.length / 4)
            )
          ) {
            let sc = alive.find(p => p.role == "Soul Collector")
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Soul Collector").url)
                .setDescription(
                  `Soul Collector **${sc.number} ${nicknames.get(
                    sc.id
                  )} ${fn.getEmoji(client, sc.role)}** win!`
                )
            )
            game.running = "give xp and win for soul collector"
            fn.addXP(game, [sc], 100)
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(game, alive.filter(p => p.sect).map(p => p.number))
            fn.addLog(
              game,
              `[RESULT] Soul Collector ${sc.number} ${nicknames.get(
                sc.id
              )} win.`
            )
            continue
          }

          game.running = "test for couple win conditions"
          if (
            alive.filter(p => p.couple).length == 2 &&
            alive.filter(p => !p.couple && p.role !== "Cupid").length == 0
          ) {
            let lovers = alive.filter(p => p.couple)
            let cupid = game.players.filter(p => p.role == "Cupid" && !p.suicide)
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Cupid").url)
                .setDescription(
                  `${
                    game.players.filter(p => p.role == "Cupid" && !p.suicide)
                      ? `Cupid **${cupid.number} ${nicknames.get(cupid.id)}** and the `
                      : ""
                  }Love Couple **${lovers[0].number} ${nicknames.get(
                    lovers[0].id
                  )} ${fn.getEmoji(client, lovers[0].role)}** and **${
                    lovers[1].number
                  } ${nicknames.get(lovers[1].id)} ${fn.getEmoji(
                    client,
                    lovers[1].role
                  )}** win!`
                )
            )
            game.running = "give xp and win for couple"
            fn.addXP(game, 
              game.players.filter(
                p => p.couple || (p.role == "Cupid" && !p.suicide)
              ),
              95
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(game, game.players.filter(p => p.couple || (p.role == "Cupid" && !p.suicide)).map(p => p.number))
            fn.addLog(
              game,
              `[RESULT] The ${
                game.players.filter(p => p.role == "Cupid" && !p.suicide)
                  ? "Cupid and the "
                  : ""
              }Love Couple win.\n[RESULT] Winners: ${game.players
                .filter(p => p.couple || (p.role == "Cupid" && !p.suicide))
                .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                .join(", ")}`
            )
            continue
          }

          game.running = "test for zombie win conditions"
          if (alive.filter(p => p.role == "Zombie").length == alive.length) {
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Zombie").url)
                .setDescription(`The zombies wins!`)
            )
            game.running = "give xp and win for zombie"
            fn.addXP(game, 
              game.players.filter(p => p.role == "Zombie" && !p.suicide),
              75
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(game, game.players.filter(p => p.role == "Zombie" && !p.suicide).map(p => p.number))
            fn.addLog(
              game,
              `[RESULT] The zombies win.\n[RESULT] Winners: ${game.players
                .filter(p => p.role == "Zombie" && !p.suicide)
                .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                .join(", ")}`
            )
            continue
          }

          game.running = "test for sect win conditions"
          if (
            aliveRoles.includes("Sect Leader") &&
            alive.filter(p => !p.sect).length == 0
          ) {
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Sect Leader").url)
                .setDescription(`The sect wins!`)
            )
            game.running = "give xp and win for sect"
            fn.addXP(game, game.players.filter(p => p.sect && !p.suicide), 50)
            fn.addXP(game, 
              game.players.filter(p => p.role == "Sect Leader" && !p.suicide),
              70
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(game, game.players.filter(p => p.sect && !p.suicide).map(p => p.number))
            fn.addLog(
              game,
              `[RESULT] The sect win.\n[RESULT] Winners: ${game.players
                .filter(p => p.sect && !p.suicide)
                .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                .join(", ")}`
            )
            continue
          }

          game.running = "test for solo killer win conditions"
          if (
            (alive.length == 1 &&
              [
                "Arsonist",
                "Bomber",
                "Cannibal",
                "Corruptor",
                "Illusionist",
                "Serial Killer"
              ].includes(aliveRoles[0])) ||
            (alive.length == 2 &&
              aliveRoles.includes("Jailer") &&
              aliveRoles.some(
                r =>
                  [
                    "Arsonist",
                    "Bomber",
                    "Cannibal",
                    "Corruptor",
                    "Illusionist",
                    "Serial Killer"
                  ].indexOf(r) >= 0
              ))
          ) {
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(
                  fn.getEmoji(
                    client,
                    alive.find(p => roles[p.role].team == "Solo").role
                  ).url
                )
                .setDescription(
                  `${alive.find(p => roles[p.role].team == "Solo").role} **${
                    alive.find(p => roles[p.role].team == "Solo").number
                  } ${nicknames.get(
                    alive.find(p => roles[p.role].team == "Solo").id
                  )}** wins!`
                )
            )
            game.running = "give xp and win for solo killer"
            fn.addXP(game, [alive.find(p => roles[p.role].team == "Solo")], 250)
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(
              game,
              [alive.find(p => roles[p.role].team == "Solo").number],
              "Solo"
            )
            fn.addLog(game, `-divider-`)
            fn.addLog(game, `[RESULT] ${alive.find(p => roles[p.role].team == "Solo").role} ${
                    alive.find(p => roles[p.role].team == "Solo").number
                  } ${nicknames.get(
                    alive.find(p => roles[p.role].team == "Solo").id
                  )} wins.`)
            continue
          }

          game.running = "test for werewolves win conditions"
          if (
            game.players.filter(
              p => p.alive && (roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF)
            ).length >=
              game.players.filter(
                p => p.alive && (roles[p.role].tag & tags.ROLE.SEEN_AS_VILLAGER)
              ).length &&
            !game.players.filter(
              p =>
                p.alive &&
                (roles[p.role].tag & tags.ROLE.SOLO_KILLER)
            ).length
          ) {
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left).map(p => p.id),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Werewolf").url)
                .setDescription(`The werewolves win!`)
            )
            game.running = "give xp and win for ww"
            fn.addXP(game, 
              game.players.filter(
                p => !p.suicide && roles[p.role].team == "Werewolves"
              ),
              50
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(
              game,
              game.players
                .filter(p => !p.suicide && roles[p.role].team == "Werewolves")
                .map(p => p.number),
              "Werewolves"
            )
            fn.addLog(game, `-divider-`)
            fn.addLog(
              game,
              `[RESULT] The werewolves win.\n[RESULT] Winners: ${game.players
                .filter(p => !p.suicide && roles[p.role].team == "Werewolves")
                .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                .join(", ")}`
            )
            continue
          }

          game.running = "test for village win conditions"
          if (
            game.players.filter(
              p => p.alive && !(roles[p.role].tag & tags.ROLE.SEEN_AS_VILLAGER)
            ).length == 0
          ) {
            game.currentPhase = 999
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left).map(p => p.id),
              new Discord.MessageEmbed()
                .setTitle("Game has ended.")
                .setThumbnail(fn.getEmoji(client, "Villager").url)
                .setDescription(`The village wins!`)
            )
            game.running = "give xp and win for village"
            fn.addXP(game, 
              game.players.filter(
                p =>
                  !p.suicide &&
                  !p.sect &&
                  (roles[p.role].team == "Village" ||
                    (p.role == "Headhunter" &&
                      !game.players.find(pl => pl.headhunter == p.number)
                        .alive))
              ),
              50
            )
            fn.addXP(game, game.players.filter(p => !p.left), 15)
            fn.addWin(
              game,
              game.players
                .filter(
                  p =>
                    !p.suicide &&
                    !p.sect &&
                    (roles[p.role].team == "Village" ||
                      (p.role == "Headhunter" &&
                        !game.players.find(pl => pl.headhunter == p.number)
                          .alive))
                )
                .map(p => p.number),
              "Village"
            )
            fn.addLog(game, `-divider-`)
            fn.addLog(
              game,
              `[RESULT] The villagers win.\n[RESULT] Winners: ${game.players
                .filter(
                  p =>
                    !p.suicide &&
                    !p.sect &&
                    (roles[p.role].team == "Village" ||
                      (p.role == "Headhunter" &&
                        !game.players.find(pl => pl.headhunter == p.number)
                          .alive))
                )
                .map(p => `${p.number} ${nicknames.get(p.id)} (${p.role})`)
                .join(", ")}`
            )
            continue
          }

          game.running = "test for tie warning"
          if (game.lastDeath + 6 == game.currentPhase) {
            game.running = "tie warning"
            fn.broadcastTo(
              client,
              game.players.filter(p => !p.left),
              "There has been no deaths for two days. Three consecutive days without deaths will result in a tie."
            )
            fn.addLog(game, `There has been no deaths for two days.`)
          }

          // fn.updateLogs(client, game)
          // game.logs = ""

          game.running = "update next phase"
          game.currentPhase++
          game.nextPhase = moment().add(
            game.currentPhase % 3 == 0
              ? game.config.nightTime || 45
              : game.currentPhase % 3 == 1
              ? game.config.dayTime || 60
              : game.config.votingTime || 45,
            "s"
          )


          game.running = "broadcast phase msg for alive"
          switch (game.currentPhase % 3) {
            case 0:
              game.shade = false
              for (var player of game.players.filter(
                p =>
                  !p.left && !p.alive
              )) {
                fn.getUser(client, player.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `Night ${Math.floor(game.currentPhase / 3) +
                        1} has started!`
                    )
                    .setThumbnail(fn.getEmoji(client, "Night").url)
                )
              }
              break
            case 1:
              for (var player of game.players.filter(p => !p.alive && !p.left)) {
                fn.getUser(client, player.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `Day ${Math.floor(game.currentPhase / 3) +
                        1} has started!`
                    )
                    .setThumbnail(fn.getEmoji(client, "Day").url)
                )
              }
              if (game.shade)
                fn.broadcastTo(
                  client, game.players.filter(p => !p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle("Shady Things")  
                    .setThumbnail(fn.getEmoji(client, "Shadow Wolf Shade").url)
                    .setDescription(
                      `${fn.getEmoji(client, "Shadow Wolf")} Shadow Wolf manipulated today's voting!`
                    )
                )
              break
            case 2:
              if (!game.noVoting)
                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle(`Voting time has started!`)
                    .setThumbnail(fn.getEmoji(client, "Voting").url)
                    .setDescription(
                      `${Math.floor(
                        game.players.filter(player => player.alive).length / 2
                      )} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
                    )
                )
              else
                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle("Peace For Today")
                    .setThumbnail(fn.getEmoji(client, "Pacifist Reveal").url)
                    .setDescription(`There is no voting today! ✌`)
                )
              break
          }


          game.running = "broadcast phase msg for alive"
          switch (game.currentPhase % 3) {
            case 0:
              game.shade = false
              for (var player of game.players.filter(
                p =>
                  !p.left && p.alive &&
                  !["Jailer","Cannibal"].includes(p.role) &&
                  !(p.jailed &&
                    game.players.find(p => p.role == "Jailer") &&
                    game.players.find(p => p.role == "Jailer").alive)
              )) {
                fn.getUser(client, player.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `Night ${Math.floor(game.currentPhase / 3) +
                        1} has started!`
                    )
                    .setThumbnail(fn.getEmoji(client, "Night").url)
                    .setDescription(
                      roles[player.role].nite ||
                        player.abil1 + (player.abil2 || 0) == 0
                        ? roles[player.role].nite
                        : "Nothing to do. Go back to sleep!"
                    )
                )
              }
              fn.addLog(game, "-divider-")
              fn.addLog(game, `Night ${Math.floor(game.currentPhase / 3) + 1} has started.`)
              break
            case 1:
              for (var player of game.players.filter(p => p.alive && !p.left)) {
                fn.getUser(client, player.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `Day ${Math.floor(game.currentPhase / 3) +
                        1} has started!`
                    )
                    .setThumbnail(fn.getEmoji(client, "Day").url)
                    .setDescription(
                      `Start discussing!\n${roles[player.role].day || ""}`
                    )
                )
              }
              if (game.shade)
                fn.broadcastTo(
                  client, game.players.filter(p => p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle("Shady Things")  
                    .setThumbnail(fn.getEmoji(client, "Shadow Wolf Shade").url)
                    .setDescription(
                      `${fn.getEmoji(client, "Shadow Wolf")} Shadow Wolf manipulated today's voting!`
                    )
                )
              fn.addLog(game, "-divider-")
              fn.addLog(game, `Day ${Math.floor(game.currentPhase / 3) + 1} has started.`)
              break
            case 2:
              if (!game.noVoting)
                fn.broadcastTo(
                  client,
                  game.players.filter(p => p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle(`Voting time has started!`)
                    .setThumbnail(fn.getEmoji(client, "Voting").url)
                    .setDescription(
                      `${Math.floor(
                        game.players.filter(player => player.alive).length / 2
                      )} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
                    )
                )
              else
                fn.broadcastTo(
                  client,
                  game.players.filter(p => p.alive && !p.left),
                  new Discord.MessageEmbed()
                    .setTitle("Peace For Today")
                    .setThumbnail(fn.getEmoji(client, "Pacifist Reveal").url)
                    .setDescription(`There is no voting today! ✌`)
                )
              fn.addLog(game, "-divider-")
              fn.addLog(game, `Voting for Day ${Math.floor(game.currentPhase / 3) + 1} has started.`)
              break
          }

          // game.logs[game.currentPhase] = ""

          if (game.currentPhase % 3 == 0) {
            game.running = "give nightmares"
            let nmwws = game.players.filter(
              p => p.role == "Nightmare Werewolf" && p.alive && p.nmtarget
            )
            for (var nmww of nmwws) {
              let nmtarget = game.players[nmww.nmtarget - 1]
              if (!nmtarget.alive) continue
              nmtarget.nightmared = true
              fn.getUser(client, nmtarget.id).send(
                new Discord.MessageEmbed()
                  .setThumbnail(fn.getEmoji(client, "Nightmare_Ghosts"))
                  .setTitle("Nightmared!")
                  .setDescription(
                    "You have been nightmared and cannot use your abilities tonight!\nGo to sleep!"
                  )
              )
              fn.broadcastTo(
                client,
                game.players.filter(
                  p => roles[p.role].tag & tags.ROLE.SEEN_AS_WEREWOLF && !p.left
                ),
                new Discord.MessageEmbed()
                  .setThumbnail(fn.getEmoji(client, "Nightmare"))
                  .setTitle("Nightmared!")
                  .setDescription(
                    `**${nmtarget.number} ${nicknames.get(
                      nmtarget.id
                    )}** has been nightmared and cannot use their abilities!`
                  )
              )
              
              fn.addLog(
                game,
                `Nightmare Werewolf ${nmww.number} ${nicknames.get(
                  nmww.id
                )} gave ${nmtarget.number} ${nicknames.get(
                  nmtarget.id
                )} (${nmtarget.role}) a nightmare and they cannot use their abilities.`
              )
            }

            if (game.players.find(p => p.role == "Jailer")) {
              game.running = "jail player"
              let jailer = game.players.find(p => p.role == "Jailer")

              if (game.players.find(p => p.jailed && p.alive && !p.left)) {
                let jailed = game.players.find(p => p.jailed && p.alive && !p.left)

                if (jailer.alive) {
                  if (
                    roles[jailed.role].team == "Werewolves"
                  )
                    fn.broadcastTo(
                      client,
                      game.players
                        .filter(
                          p =>
                            !p.left &&
                            roles[p.role].team == "Werewolves" &&
                            p.id !== jailed.id
                        )
                        .map(p => p.id),
                      new Discord.MessageEmbed()
                        .setTitle(`Jailed!`)
                        .setThumbnail(fn.getEmoji(client, "Jail").url)
                        .setDescription(
                          `**${jailed.number} ${nicknames.get(
                            jailed.id
                          )} ${fn.getEmoji(client, jailed.role)}** is jailed!`
                        )
                    )

                  fn.getUser(client, jailer.id).send(
                    new Discord.MessageEmbed()
                      .setTitle(
                        `Night ${Math.floor(game.currentPhase / 3) +
                          1} has started!`
                      )
                      .setThumbnail(fn.getEmoji(client, "Jail Night").url)
                      .setDescription(
                        `**${jailed.number} ${nicknames.get(
                          jailed.id
                        )}** is now jailed!\nYou can talk to them or shoot them (\`w!execute\`).`
                      )
                  )

                  fn.getUser(client, jailed.id).send(
                    new Discord.MessageEmbed()
                      .setTitle(
                        `Night ${Math.floor(game.currentPhase / 3) +
                          1} has started!`
                      )
                      .setThumbnail(fn.getEmoji(client, "Jail Night").url)
                      .setDescription(
                        `You are now jailed.\nYou can talk to the jailer to prove your innocence.`
                      )
                  )
              
                  fn.addLog(
                    game,
                    `Jailer ${jailer.number} ${nicknames.get(
                      jailer.id
                    )} put ${jailed.number} ${nicknames.get(
                      jailed.id
                    )} (${jailed.role}) in jail.`
                  )
                } else game.players[jailed.number - 1].jailed = false
              } else if (jailer.alive) {
                fn.getUser(client, jailer.id).send(
                  new Discord.MessageEmbed()
                    .setTitle(
                      `Night ${Math.floor(game.currentPhase / 3) +
                        1} has started!`
                    )
                    .setThumbnail(fn.getEmoji(client, "Night").url)
                    .setDescription(
                      "You did not select a player last day or your target could not be jailed.\n" +
                        " Go back to sleep!"
                    )
                )
              }
            }

            if (game.frenzy) {
              game.running = "announce frenzy for wolves"
              fn.broadcastTo(
                client,
                game.players.filter(
                  p =>
                    !p.left &&
                    roles[p.role].team == "Werewolves" &&
                    p.role != "Sorcerer" &&
                    !p.jailed
                ),
                new Discord.MessageEmbed()
                  .setTitle("Frenzy")
                  .setThumbnail(
                    fn.getEmoji(client, "Werewolf Berserk Frenzy").url
                  )
                  .setDescription("It's frenzy night!")
              )
              
              fn.addLog(
                game,
                `Werewolf Frenzy is activated tonight.`
              )
            }

            game.running = "clear gunner shot status"
            for (var gunner of game.players.filter(p => p.role == "Gunner"))
              gunner.shotToday = false
            
            game.running = "add canni hunger"
            for (var canni of game.players.filter(p => p.role == "Cannibal" && p.alive)) {
              fn.getUser(client, canni.id).send(
                new Discord.MessageEmbed()
                  .setTitle(
                    `Night ${Math.floor(game.currentPhase / 3) +
                      1} has started!`
                  )
                  .setThumbnail(fn.getEmoji(client, "Night").url)
                  .setDescription(
                    `Select ${canni.abil1} player${
                      canni.abil1 == 1 ? "" : "s"
                    } to \"eat\" (\`w!eat [player] ${
                      canni.abil1 == 1 ? "" : `[...]`
                    }\`) or save up your hunger.`
                  )
              )
            }
          }
        } catch (error) {
          client.channels.cache.get("664285087839420416").send(
            new Discord.MessageEmbed()
              .setColor("RED")
              .setTitle(`${fn.getEmoji(client, "red_tick")} Game Terminated`)
              .setDescription(
                `${
                  game.mode == "custom"
                    ? `${game.name} [\`${game.gameID}\`]`
                    : `Game #${game.gameID}`
                } has been terminated when trying to \`${
                  game.running
                }\` due to the following reason: \`\`\`${error.stack.replace(
                  /(?:(?!\n.*?\(\/home\/sd\/wwou.*?)\n.*?\(\/.*?\))+/g,
                  "\n\t..."
                )}\`\`\``
              )
          )
          fn.addLog(game, `[ERROR] Game was terminated at \`${game.running}\`.`)
          fn.addLog(game, "[ERROR] " + error.stack.replace(/ {4}/g, "            "))
          game.currentPhase = 999
          // fn.addXP(game, game.players, 15)
          fn.addXP(game, game.players.filter(p => !p.left), 15)
          fn.broadcastTo(
            client,
            game.players.filter(p => !p.left),
            `${fn.getEmoji(client, "red_tick")} There is an error causing this game to be terminated.` +
              " Please contact staff members."
          )
        }
    }
    games.set("quick", QuickGames)
  }, 500)
}
