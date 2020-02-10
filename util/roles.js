/** 
  * ====================== ROLE TAGS ======================
  * 0x0001 - REGULAR VILLAGER    0x0002 - STRONG VILLAGER
  * 0x0004 - WEREWOLF            0x0008 - SOLO VOTING
  * 0x0010 - SOLO KILLING        0x0020 - SEEN AS VILLAGER
  * 0x0040 - SEEN AS WEREWOLF    0x0080 - 
  * 0x0100 -                     0x0200 -
  * 0x0400 -                     0x0800 - WWC ROLES
  * 0x1000 - AVAILABLE           0x2000 - TO BE TESTED
  * 0X4000 - UNAVAILABLE         0x8000 - WWOWC ROLES
  * =======================================================
  */

let roles = {
  
  // Villager roles
  
  "Villager": {
    desc: "You are a regular villager without any special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forkman","forkmen"],
    cat : "Regular Villager",
    tag : 0
  },
  "Aura Seer": {
    desc: "Each night you can select a player to uncover their alignment: Good, Evil, or Unknown." +
          " Evil players belong to the werewolves and good players belong to the villagers team.\n" +
          "Unknown targets can be: Gunner, Jailer, Medium, Alpha werewolf, and all solo players.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"],
    cat : "Regular Villager",
    nite: "Select a player to uncover their alignment (`w!check [player]`)."
  }, 
  "Avenger": {
    desc: "After the first night you can select a player to kill when you die.",
    aura: "Good",
    team: "Village",
    abbr: ["hunter"],
    cat : "Regular Villager",
    day : "Select a player to kill when you die (`w!avenge [player]`).",
    nit1: "Nothing to do. Go back to sleep!",
    nite: "Select a player to kill when you die (`w!avenge [player]`)."
  }, 
  "Beast Hunter": {
    desc: "At night you can place a trap on a person which will become active the following night." +
          " This player cannot be killed at night." +
          " If the player is attacked by werewolves, the weakest werewolf will die." +
          " Solo killers will not be killed by the trap, but will instead remove the trap after attacking." +
          " The trap has no effect on zombies and the sect leader.",
    aura: "Unknown",
    team: "Village",
    abbr: ["bh"],
    cat : "Regular Villager",
    nite: "Select a player to place your trap on (`w!trap [player]`). You can place the trap on yourself."
  },
  "Bodyguard": {
    desc: "You can choose one player to protect every night." +
          " That player cannot be killed that night and instead you will be attacked." +
          " Because you are strong you survive the first attack, but you will die on the second attack." +
          " Every night you automatically protect yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"],
    cat : "Regular Villager",
    nite: "Select a player to protect (`w!protect [player]`)."
  },
  "Cupid": {
  	desc: "During the first night you can select two players to be a love couple." +
    			" You win if the village wins or if the lovers are the last survivors.",
    aura: "Good",
    team: "Village",
    abbr: [],
    oneOnly: true,
    nit1: "Select two players to be a love couple (`w!lovers [player1] [player2]`)." +
          " If you do not select two players, they will be randomly selected."
  },
  "Cursed": {
    desc: "You are a villager until the werewolves try to kill you, at which point you become a werewolf." +
          " You cannot be converted into another team by sect leader etc.", 
    aura: "Good",
    team: "Village",
    abbr: ["lycan"]
  },
  "Detective": {
  	desc: "Each night you can select two players to uncover if they are in the same team.",
    aura: "Good",
    team: "Village",
    abbr: ["det","sherlock","holmes","sherlock holmes","conan"],
    cat : "Strong Villager",
    nite: "Select two players to uncover if they are in the same team (`w!detect [player1] [player2]`)."
  },
  "Doctor": {
    desc: "Choose a player to protect every night." +
          " That player cannot be killed that night.",
    aura: "Good",
    team: "Village",
    abbr: ["doc", "medic"],
    cat : "Regular Villager",
    nite: "Choose a player to protect (`w!heal [player]`)."
  },
  "Flower Child": {
 		desc: "You are a villager who can once protect a player from being lynched by the village.",
    aura: "Good", 
    team: "Village", 
 		abbr: ["fc", "flower"],
    cat : "Regular Villager",
    day : "You can once protect a player from being lynched by the village (`w!protect [player]`)."
  }, 
  "Fortune Teller": {
  	desc: "You have two cards which you can give to other players at night." +
          " These players can use these cards to reveal their roles.",
    aura: "Unknown",
    team: "Village",
    abbr: ["ft"],
    cat : "Regular Villager",
    nite: "Select a player to give your card to (`w!card [player]`).\n" +
          "You can give both cards to two players at once (`w!cards [player1] [player2]`)."
  }, 
  "Grumpy Grandma": {
    desc: "After the first night you can select a player who cannot talk or vote during the day.",
    aura: "Good",
    team: "Village",
    abbr: ["granny","gg"],
    cat : "Regular Villager",
    nit1: "Nothing to do. Go back to sleep!",
    nite: "Select a player who cannot talk or vote during the day (`w!mute [player]`)."
  },
  "Gunner": {
    desc: "You have two bullets which you can use to kill somebody." +
          " Only one bullet can be fired per day." +
          " The shots are very loud so that your role will be revealed after the first shot." +
          " You cannot shoot during the discussion phase on the first day.",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"],
    cat : "Strong Villager",
    day : "Select a player to kill (`w!shoot [player]`) if you find them suspicious.\n" +
          "**⚠️ Random shooting is a gamethrowing act, and can result in a ban!**"
  },
  "Jailer": {
    desc: "Select a target each day to put in jail during the next night." +
          " At night you can talk privately with your target." +
          " Your target cannot act or be attacked, but if you find them suspicious, you can kill them.",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"],
    cat : "Strong Villager",
    oneOnly: true,
    day : "Select a player to put in jail during the next night (`w!jail [player]`)."
  },
  "Marksman": {
 		desc: "At night you can mark a player as your target." +
          " After the next day, you can kill or change your target." +
          " If you try to kill a villager, your shot will backfire and kill you." +
          " You have two arrows.",
    aura: "Unknown",
    team: "Village",
    abbr: ["mm"],
    cat : "Regular Villager",
    day : "Kill your target (`w!shoot`) if you find them suspicious.\n" +
          "**⚠️ If your target is a villager, your shot will backfire and kill you!**",
    nite: "Mark a player as your target (`w!mark [player]`).\n" +
          "After the next day, you can kill your target (`w!shoot`) if you find them suspicious.\n" +
          "**⚠️ If your target is a villager, your shot will backfire and kill you!**"
  }, 
  "Mayor": {
  	desc: "Once during the game you can reveal your role which will make your vote count double during the rest of the game.",
    aura: "Good",
    team: "Village",
    abbr: [],
    day : "You can reveal your role (`w!reveal mayor`) to make your vote count double during the rest of the game."
  },
  "Medium": {
    desc: "During the night you can talk anonymously with the dead." +
          " Once during the game you can revive a dead player.",
    aura: "Unknown",
    team: "Village",
    abbr: ["med"],
    cat : "Strong Villager",
    nite: "You can talk anonymously with the dead." +
          " Once during the game you can revive a dead player (`w!revive [player]`)."
  },
  "Pacifist": {
  	desc: "Once per game you can reveal the role of a player (`w!reveal [player]`) and prevent anybody from voting during that day.",
    aura: "Good",
    team: "Village",
    abbr: ["paci"],
    cat : "Regular Villager",
    day : "You can reveal the role of a player (`w!reveal [player]`) and prevent anybody from voting during that day.\n" +
          "**⚠️ Random revealing is a gamethrowing act, and can result in a ban!**"
  },
  "President": {
  	desc: "Everyone knows who you are! If you die the village loses.",
    aura: "Good",
    team: "Village",
    abbr: ["trump", "donald trump"],
    oneOnly: true
  },
  "Priest": {
    desc: "You can throw holy water on another player." +
          " If that player is a werewolf, they die. If he is not a werewolf, you die.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"],
    cat : "Regular Villager",
    day : "You can throw holy water on another player (`w!water [player]`) if you find them suspicious.\n" +
          "**⚠️ If your target is __not__ a werewolf, you die!**"
  },
  "Red Lady": {
  	desc: "At night you can visit another player." +
          " If you are attacked while visiting, you will not be killed." +
          " However, if you visit a player that is attacked or is evil, you will die!",
    aura: "Good",
    team: "Village",
    abbr: ["rl", "harlot", "prostitute"],
    cat : "Regular Villager",
    nite: "You can visit another player (`w!visit [player]`)." +
          " If you are attacked while visiting, you will not be killed.\n" +
          "**⚠️ However, if you visit a player that is attacked or is evil, you will die!**"
  },
  "Seer": {
    desc: "Every night, you can select a player to uncover their role.",
    aura: "Good",
    team: "Village",
    abbr: [],
    cat : "Strong Villager",
    nite: "Select a player to uncover their role (`w!check [player]`)."
  },
  "Seer Apprentice": {
    desc: "You are a normal villager until the seer dies, at which point you become the new seer.",
    aura: "Good",
    team: "Village",
    abbr: ["sapp", "sa", "app", "seer app"],
    cat : "Regular Villager"
  },
  "Sheriff": {
  	desc: "At night you can select someone to watch." +
          " If that player dies during the night, you will uncover two possible suspects who might have killed that player.",
    aura: "Good",
    team: "Village",
    abbr: ["sher", "woody", "cowboy"], 
    cat : "Regular Villager",
    nite: "Select a player to watch (`w!watch [player]`)."
  }, 
  "Spirit Seer": {
  	desc: "Each night you can select two players." +
          " At the beginning of the next day you will be informed if either of those two players has killed last night.",
    aura: "Good",
    team: "Village",
    abbr: ["ss", "sz", "spirit", "spz", "sps"],
    cat : "Regular Villager",
    nite: "Select two players to see if either of them has killed tonight (`w!check [player1] [player2]`)."
  }, 
  "Tough Guy": {
  	desc: "You can choose one player to protect every night." +
          " If you or that player is attacked, neither dies and instead you and the attacker will both see each others' roles." +
          " Because of your injuries, you will die at the end of the following day.",
    aura: "Good",
    team: "Village",
    abbr: ["tg"],
    cat : "Regular Villager",
    nite: "Select a player to protect (`w!protect [player]`)."
  }, 
  "Witch": {
  	desc: "You have two potions: One will kill and the other will protect a player." +
          " The protect potion is only consumed if the player was attacked. You cannot kill in the first night.",
    aura: "Unknown",
    team: "Village",
    abbr: [],
    cat : "Regular Villager",
    nit1: "Select a player to heal with your protect potion (`w!heal [player]`).",
    nite: "Select a player to heal with your protect potion (`w!heal [player]`) or to kill with your poison potion (`w!poison [player]`).\n" +
          "**⚠️ Random revealing is a gamethrowing act, and can result in a ban!**"
  },
  
  // Werewolf roles
  "Werewolf": {
    desc: "Choose one player to kill every night.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"],
    cat : "Werewolf",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`)."
  },
  "Alpha Werewolf": {
    desc: "You are a regular werewolf, except when your vote counts as double.",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha", "alpha ww"],
    cat : "Werewolf",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`).\n" +
          "You vote counts double."
  },
  "Guardian Wolf": {
  	desc: "You are a werewolf who can once protect a player from being lynched by the village (`w!protect [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["gww","wwg","gw","wg"],
    cat : "Werewolf",
    day : "You can once protect a player from being lynched by the village (`w!protect [player]`).",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`)."
  }, 
  "Junior Werewolf": {
    desc: "Because you are so cute, you can select another player to be killed when you are killed.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["jww", "jr", "jnr", "jrww", "jnrww","jw"],
    cat : "Werewolf",
    day : "Select a player to kill when you die (`w!avenge [player]`).",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`)." +
          " Select a player to kill when you die (`w!avenge [player]`)."
  },
  "Kitten Wolf": {
    desc: "You are a werewolf with the ability to convert a villager into a werewolf." +
          " You can only do this once." +
          " If your target is not a villager, you lose your ability!",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["kww","wwk","wk","kw"],
    cat : "Werewolf",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`).\n" +
          "Once you can convert a villager into a werewolf (`w!scratch [player]`).\n" +
          "**⚠️ If they are not a villager, you lose your ability!**"
  }, 
  "Nightmare Werewolf": {
    desc: "Twice during the game you can select a player during the day to \"fall asleep\" for one night ." + 
          " That player won't be able to use any abilities for one night.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["nww","nw"],
    cat : "Werewolf",
    day : "You can select a player during the day to \"fall asleep\" for one night (`w!nightmare [player]`).",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`)."
  },
  "Sorcerer": {
    desc: "Each night you can select a player to uncover their role." +
          " You cannot vote or talk with the werewolves at night.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["sorc"],
    nite: "Select a player to uncover their role (`w!check [player]`)."
  },
  "Werewolf Berserk": {
    desc: "Once per game, you can active a werewolves \"frenzy\" during the day." +
          " If during the night your selected victim is being protected, your victim and all protectors of your victim will die." +
          " The frenzy will only be announced to the werewolves.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wwb","bww","bers","berz"],
    cat : "Werewolf",
    day : "Once per game, you can active a werewolves \"frenzy\" during the day (`w!frenzy`).",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`)."
  },
  "Wolf Seer": {
    desc: "Each night you can select a player to uncover their role (`w!check [player]`)." +
          " If you are the last werewolf or you resign your ability (`w!resign`), you become a regular werewolf.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer", "ww seer"],
    cat : "Werewolf",
    nite: "Chat and vote with the werewolves on who to kill tonight (`w!vote [player]`).\n" +
          "Select a player to uncover their role (`w!check [player]`)."
  },
  "Wolf Shaman": {
    desc: "During the day you can enchant another player (`w!enchant [player]`)." +
          " For investigators, this player will appear to be a wolf shaman at the next night." +
          " If you are the last werewolf, you cannot enchant anybody.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww sham","sham","shaman"],
    cat : "Werewolf",
    day : "Select a player to enchant (`w!enchant [player]`).",
    nite: "Vote to kill a player with the werewolves (`w!vote [player]`)."
  },
  
  // Solo non-killing roles
  
  "Fool": {
    desc: "Your goal is to get lynched by the village. You win if they lynch you.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["tanner"],
    cat : "Voting"
  },
  "Headhunter": {
    desc: "Your goal is to get your target lynched by the village." +
          " You target must be lynched before you die in order to win." +
          " If your target dies another way, you become a regular villager.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["hh"],
    cat : "Voting"
  },
  
  // Solo killing roles
  
  "Arsonist": {
  	desc: "Each night, you can either select two players to douse with gasoline (`w!douse [player1] [player2]`)" + // alias: w!burn
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
    desc: "Each night you can kill one player." +
          " You cannot be killed by the werewolves." +
          " You win if you are the last player alive.", 
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"],
    cat : "Killer",
    nite: "Select a player to stab (`w!stab [player]`)."
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