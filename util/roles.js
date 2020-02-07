let roles = {
  
  // Villager roles
  
  "Villager": {
    desc: "You are a regular villager without any special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forkman","forkmen"],
    cat : "Regular Villager",
    n1m : ""
  },
  "Aura Seer": {
    desc: "Each night you can select a player to uncover his alignment: Good, Evil, or Unknown (`w!check [player]`)." +
          " Evil players belong to the werewolves and good players belong to the villagers team.\n" +
          "Unknown targets can be: Gunner, Jailer, Medium, Alpha werewolf, and all solo players.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"],
    cat : "Regular Villager"
  }, 
  "Avenger": {
    desc: "After the first night you can select a player to kill when you die (`w!avenge [player]`).",
    aura: "Good",
    team: "Village",
    abbr: ["hunter"],
    cat : "Regular Villager"
  }, 
  "Beast Hunter": {
    desc: "At night you can place a trap on a person (`w!trap [player]`) which will become active the following night." +
          " This player cannot be killed at night." +
          " If the player is attacked by werewolves, the weakest werewolf will die." +
          " Solo killers will not be killed by the trap, but will instead remove the trap after attacking." +
          " The trap has no effect on zombies and the sect leader.",
    aura: "Unknown",
    team: "Village",
    abbr: ["bh"],
    cat : "Regular Villager"
  },
  "Bodyguard": {
    desc: "You can choose one player to protect every night (`w!protect [player]`)." +
          " That player cannot be killed that night and instead you will be attacked." +
          " Because you are strong you survive the first attack, but you will die on the second attack." +
          " Every night you automatically protect yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"],
    cat : "Regular Villager"
  },
  "Cupid": {
  	desc: "During the first night you can select two players to be a love couple with (`w!couple [player1] [player2]`)." +
    			" You win if the village wins or if the lovers are the last survivors.",
    aura: "Good",
    team: "Village",
    abbr: [],
    oneOnly: true
  },
  "Cursed": {
    desc: "You are a villager until the werewolves try to kill you, at which point you become a werewolf." +
          " You cannot be converted into another team by sect leader etc.", 
    aura: "Good",
    team: "Village",
    abbr: ["lycan"]
  },
  "Detective": {
  	desc: "Each night you can select two players to uncover if they are in the same team (`w!detect [player1] [player2]`).",
    aura: "Good",
    team: "Village",
    abbr: ["det","sherlock","holmes","sherlock holmes","conan"],
    cat : "Strong Villager"
  },
  "Doctor": {
    desc: "Choose a player to protect every night (`w!heal [player]`)." + // alias: w!protect
          " That player cannot be killed that night.",
    aura: "Good",
    team: "Village",
    abbr: ["doc", "medic"],
    cat : "Regular Villager"
  },
  "Flower Child": {
 		desc: "You are a villager who can once protect a player from being lynched by the village.",
    aura: "Good", 
    team: "Village", 
 		abbr: ["fc", "flower"],
    cat : "Regular Villager"
  }, 
  "Fortune Teller": {
  	desc: "You have two cards which you can give to other players at night (`w!cards [player1] [player2: optional]`)." +
          " These players can use these cards to reveal their roles.",
    aura: "Unknown",
    team: "Village",
    abbr: ["ft"],
    cat : "Regular Villager"
  }, 
  "Grumpy Grandma": {
    desc: "After the first night you can select a player who cannot talk or vote during the day (`w!mute [player]`).",
    aura: "Good",
    team: "Village",
    abbr: ["granny","gg"],
    cat : "Regular Villager"
  },
  "Gunner": {
    desc: "You have two bullets which you can use to kill somebody (`w!shoot`)." +
          " Only one bullet can be fired per day." +
          " The shots are very loud so that your role will be revealed after the first shot." +
          " You cannot shoot during the discussion phase on the first day.",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"],
    cat : "Strong Villager"
  },
  "Jailer": {
    desc: "Select a target each day to put in jail during the next night (`w!jail [player]`)." +
          " At night you can talk privately with your target." +
          " Your target cannot act or be attacked, but if you find them suspicious, you can kill them (`w!execute`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"],
    cat : "Strong Villager",
    oneOnly: true
  },
  "Marksman": {
 		desc: "At night you can mark a player as your target (`w!mark [player]`)." +
          " After the next day, you can kill (`w!shoot`) or change your target." +
          " If you try to kill a villager, your shot will backfire and kill you." +
          " You have two arrows.",
    aura: "Unknown",
    team: "Village",
    abbr: ["mm"],
    cat : "Regular Villager"
  }, 
  "Mayor": {
  	desc: "Once during the game you can reveal your role (`w!reveal`) which will make your vote count double during the rest of the game.",
    aura: "Good",
    team: "Village",
    abbr: [],
  },
  "Medium": {
    desc: "During the night you can talk anonymously with the dead." +
          " Once during the game you can revive a dead player (`w!revive [player]`).", // alias: w!rev
    aura: "Unknown",
    team: "Village",
    abbr: ["med"],
    cat : "Strong Villager"
  },
  "Pacifist": {
  	desc: "Once per game you can reveal the role of a player (`w!reveal [player]`) and prevent anybody from voting during that day.",
    aura: "Good",
    team: "Village",
    abbr: ["paci"],
    cat : "Regular Villager"
  },
  "President": {
  	desc: "Everyone knows who you are! If you die the village loses.",
    aura: "Good",
    team: "Village",
    abbr: ["trump"],
    oneOnly: true
  },
  "Priest": {
    desc: "You can throw holy water on another player (`w!water [player]`)." +
          " If that player is a werewolf, they die. If he is not a werewolf, you die.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"],
    cat : "Regular Villager"
  },
  "Red Lady": {
  	desc: "At night you can visit another player (`w!visit [player]`)." +
          " If you are attacked while visiting, you will not be killed." +
          " However, if you visit a player that is attacked or is evil, you will die!",
    aura: "Good",
    team: "Village",
    abbr: ["rl", "harlot", "prostitute"],
    cat : "Regular Villager"
  },
  "Seer": {
    desc: "Every night, you can select a player to uncover their role (`w!check [player]`).", // alias: w!see
    aura: "Good",
    team: "Village",
    abbr: [],
    cat : "Strong Villager"
  },
  "Seer Apprentice": {
    desc: "You are a normal villager until the seer dies, at which point you become the new seer.",
    aura: "Good",
    team: "Village",
    abbr: ["sapp", "sa", "app", "seer app"],
    cat : "Regular Villager"
  },
  "Sheriff": {
  	desc: "At night you can select someone to watch (`w!watch [player]`)." +
          " If that player dies during the night, you will uncover two possible suspects who might have killed that player.",
    aura: "Good",
    team: "Village",
    abbr: ["sher", "woody", "cowboy"], 
    cat : "Regular Villager"
  }, 
  "Spirit Seer": {
  	desc: "Each night you can select two players (`w!spirit [player1] [player2]`)." +
          " At the beginning of the next day you will be informed if either of those two players has killed last night.",
    aura: "Good",
    team: "Village",
    abbr: ["ss", "sz", "spirit", "spz", "sps"],
    cat : "Regular Villager"
  }, 
  "Tough Guy": {
  	desc: "You can choose one player to protect every night. (`w!protect [player]`)" +
          " If you or that player is attacked, neither dies and instead you and the attacker will both see each others' roles." +
          " Because of your injuries, you will die at the end of the following day.",
    aura: "Good",
    team: "Village",
    abbr: ["tg"],
    cat : "Regular Villager"
  }, 
  "Witch": {
  	desc: "You have two potions: One will kill and the other will protect a player." +
          " The protect potion is only consumed if the player was attacked. You cannot kill in the first night.",
    aura: "Unknown",
    team: "Village",
    abbr: [],
    cat : "Regular Villager"
  },
  
  // Werewolf roles
  "Werewolf": {
    desc: "Choose one player to kill every night (`w!vote [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"],
    cat : "Werewolf"
  },
  "Alpha Werewolf": {
    desc: "You are a regular werewolf except when you vote with the werewolves (`w!vote [player]`), your vote counts as double!",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha", "alpha ww"],
    cat : "Werewolf"
  },
  "Guardian Wolf": {
  	desc: "You are a werewolf who can once protect a player from being lynched by the village (`w!protect [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["gww","wwg","gw","wg"],
    cat : "Werewolf"
  }, 
  "Junior Werewolf": {
    desc: "Because you are so cute, you can select another player to be killed when you are killed (`w!avenge [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["jww", "jr", "jnr", "jrww", "jnrww","jw"],
    cat : "Werewolf"
  },
  "Kitten Wolf": {
    desc: "You are a werewolf with the ability to convert a villager into a werewolf (`w!scratch [player]`)." +
          " You can only do this once." +
          " If your target is not a villager, you lose your ability!",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["kww","wwk","wk","kw"],
    cat : "Werewolf"
  }, 
  "Nightmare Werewolf": {
    desc: "Twice during the game you can select a player during the day to \"fall asleep\" for one night (`w!nightmare [player]`)." + 
          " That player won't be able to use any abilities for one night.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["nww","nw"],
    cat : "Werewolf"
  },
  "Sorcerer": {
    desc: "Each night you can see the roles of a player (`w!check [player]`)." +
          " However, you cannot see the roles of the other werewolves nor can you talk to them." +
          " The role of the checked player will not be known by the other werewolves." +
          " You can however find out the other wolves by seeing their roles." +
          " You cannot be killed by the Priest's Holy Water.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["sorc"]
  },
  "Werewolf Berserk": {
    desc: "Once per game, you can active a werewolves \"frenzy\" during the day." +
          " If during the night your selected victim is being protected, your victim and all protectors of your victim will die." +
          " The frenzy will only be announced to the werewolves.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wwb","bww","bers","berz"],
    cat : "Werewolf"
  },
  "Wolf Seer": {
    desc: "Each night you can uncover the role of one player (`w!check [player]`)." +
          " You can talk with the other werewolves and provide any information you found." +
          " However, you cannot vote on a player to kill unless you resign your ability to see roles." +
          " If you are the last werewolf alive you instantly resign your seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer", "ww seer"],
    cat : "Werewolf"
  },
  "Wolf Shaman": {
    desc: "During the day you can enchant another player." +
          " For investigators, this player will appear to be a wolf shaman at the next night." +
          " If you are the last werewolf, you cannot enchant anybody.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww sham","sham","shaman"],
    cat : "Werewolf"
  },
  
  // Solo non-killing roles
  
  "Fool": {
    desc: "Your only goal is to get lynched by the village.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["tanner"],
    cat : "Voting"
  },
  "Headhunter": {
    desc: "Your only goal is to get your target lynched by the village." +
          " If your target dies in a way other than being lynched, you become a regular villager.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["hh"],
    cat : "Voting"
  },
  
  // Solo killing roles
  
  "Arsonist": {
  	desc: "Each night, you can douse 2 players with gasoline (`w!douse [player]`) or ignite doused players by doing (`w!ignite`)." + // alias: w!burn
          " You cannot be killed by the werewolves." + 
          " You win if you are the last player alive.", 
    aura: "Unknown", 
    team: "Solo",
    abbr: ["ars", "arso", "arson", "pyro"],
    cat : "Killer"
  }, 
  "Bomber": {
  	desc: "At night, place a bomb on 3 players vertically, horizontally or diagonally (`w!placebomb [player]`)." +
          " The following night, tbe bomb explodes, killing the selected players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
 		aura: "Unknown",
    team: "Solo",
    abbr: ["bb", "bomb"],
    cat : "Killer"
  },
  "Corruptor": {
  	desc: "Every night, select a player 'glitch' by doing (`w!glitch [player]`)." +
    			" That player won't be able to speak or vote the next day and will die at the end of the day." +
  				" The role of the player won't be revealed. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["corr"],
    cat : "Killer"
  },
  "Cannibal": {
  	desc: "Every night, you can kill a player or save up your hunger to kill more the next night by doing (`w!eat [player]`)." +
    			" You can only stack up to 5 kills. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["canni", "cani", "cb"],
    cat : "Killer"
  },
  "Illusionist": {
  	desc: "Every night, select a player to disguise." +
    			" These players will appear to be the Illusionist to the <:Seer:658633721448235019> Seer," +
          " a different team to the <:Detective:660070860832505863> Detective and unknown to the <:Aura_Seer:658632880490020874> Aura Seer." +
          " During the day, you can choose to kill all disguised players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown", 
    team: "Solo", 
    abbr: ["illu", "illusion"],
    cat : "Killer"
  },
  "Sect Leader": {
  	desc: "Every night, select a player to convert into a Sect Member with (`w!sect [player]`). You can only convert villagers to the Sect Team." +
    			" However, if you're killed, every Sect Member dies along. You win if everyone alive is converted into a Sect Member.", 
    aura: "Unknown",
    team: "Sect",
    abbr: ["sl"],
    cat : "Killer",
    oneOnly: true
	},
  "Serial Killer": {
    desc: "Each night, stab one player with (`w!stab [player]`)." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.", 
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"],
    cat : "Killer"
  },
  "Zombie": {
  	desc: "Each night, select a player to convert to a Zombie by (`w!zombify [player]`). Only players from the Village team can be converted." +
    			" However, players take one day to convert before turning to a zombie. You win if all alive players are converted into Zombies.",
    aura: "Unknown",
    team: "Zombies",
    abbr: ["zomb", "zom", "zb", "zombert", "walking dead"],
    cat : "Killer"
  },
  
  // Random Roles
  
  "Random": {
    desc: "Any role.",
    abbr: ["rdm"],
    cat : "Random"
  },
  "Random Regular Villager": {
    desc: "One of: Villager, Aura Seer, Avenger, Beast Hunter, Bodyguard, Doctor, Flower Child," +
          " Fortune Teller, Grumpy Grandma, Marksman, Pacifist, Priest, Red Lady," +
          " Seer Apprentice, Sheriff, Spirit Seer, Tough Guy, Villager or Witch",
    abbr: ["rrv"],
    cat : "Random"
  },
  "Random Strong Villager": {
    desc: "One of: Detective, Gunner, Jailer, Medium or Seer",
    abbr: ["rsv"],
    cat : "Random"
  },
  "Random Werewolf": {
    desc: "One of:\nWerewolf, Alpha Werewolf, Guardian Wolf, Junior Werewolf," +
          "Kitten Wolf, Nightmare Werewolf, Werewolf Berserk, Wolf Seer, Wolf Shaman",
    abbr: ["rw"],
    cat : "Random"
  },
  "Random Voting": {
    desc: "One of: Fool or Headhunter",
    abbr: ["rv"],
    cat : "Random"
  },
  "Random Killer": {
    desc: "One of: Arsonist, Bomber, Corruptor, Cannibal, Illusionist," +
          " Sect Leader, Serial Killer, Zombie",
    abbr: ["rk"],
    cat : "Random"
  }
}

for (const [key,] of Object.entries(roles))
  roles[key].name = key

module.exports = roles