log("31")
performance_trick()
load_code('23Dicts')
load_code('1Main')
load_code('13Skills')	//skill3shot(), get_nearby_entitties()
load_code('14Partying')	// PARTY, bots
load_code('16Relations')	// cm
load_code('19management') //sell extras -- merge this and 12Inv?
// load_code('24Traversal')


let merchant = 'VendorGuy';
let group = '3r'
let currentGroup = getGroup(group)
let myFarmDefault = farmDefault[character.id]

let farmerReserve = 2500000;
let desired_potion_count = 9999;
let desired_mp_pot = "mpot1"
let desired_hp_pot = "hpot1"
let PACK_THRESHOLD = 28;


//STARTUP
startBots(currentGroup);
const keyInviteBots = map_key("9", "snippet", "sendInvites('r3')")
const keyKillBots = map_key('8', 'snippet', "killBots(currentGroup)")
setInterval(loot, 65)



function valuaBank() {
	for (let item of character.items) {
		if (!item) continue;
		switch (item["name"]) {
			case "suckerpunch":
				if (is_pvp() && !server.id == "I"){
					change_server("US","I")
					break;
				}
			case "ink":
				farmerBank()
				break
			case 'seashell':
				if (item.q > 500) farmerBank()
				break
			case 'gem0':
				if (item.q >= 5) farmerBank()
				break
		} 
	}
}


function farmerBank() {
	if (smart.moving) return;
	if (!character.bank && !smart.moving) {
		log('farmerBank move')
		smart_move('bank')
	}
	if (smart.moving || character.moving) return;
	char.current_action = undefined;
	if (character.gold > 2500000) {
		let deposit = character.gold - farmerReserve;
		bank_deposit(deposit)
	}
	if (character.gold < 1500000) {
		log("Bank success");
		bank_withdraw(500000);
	}
	if (character.bank) { // && character.bank['items0'].length < 42
		for (let itemSlot in character.items) {
			let item = character.items[itemSlot]
			if (!item) continue;
			let itemName = item.name
			if (!sell_dict['keep'].includes(itemName)) bank_store(itemSlot)
			
		}
	
	}
	log('farmerBank return move')
	char.moveToThen(myFarmDefault, char.current_action = 'farming')
}



let attack_mode = false

class Ranger {  

	constructor() {
  
		// states
		this.pvp;
		this.thinking;
		this.current_action;
		this.idle_counter = 0;
  
	  // timing
		this.idle_start;
		this.last_cm;
		this.last_respawn;
		this.last_use_potion;
		this.last_use_mp_potion;
		this.last_use_hp_potion;
  
		// combat
		this.mon_type;
		this.can_kill;
		this.itemBounty;
		this.itemBountyQty;
		
	setTimeout(savePosition(), 10000)
	
	}
	

	set_current_action(action) {
		log(`Requesting to update '${this.current_action}' to '${action}'`);
		if (!this.current_action && action) {
			this.current_action = action;
			this.idle_counter = 0;
		}
	}
	clear_current_action() {
		log(`Requesting to clear: ${this.current_action}`);
		if (this.current_action) {
			this.current_action = ""
			this.idle_counter = 0;
		}
	}
  
	handle_death() {
	  if (character.rip) {
		  if (this.last_respawn == null || new Date() - this.last_respawn >= 10000) {
			  this.clear_current_action();
		  respawn();
		  this.last_respawn = new Date();
		}
	  }
	}
  
	joinEvent(eventMob) {
		if (eventMob == 'franky') return;
		// eventMob = 'icegolem', etc
		if (this.current_action != eventMob && parent.S[eventMob] && !get_monster({ type: eventMob })) {
		// Event is on and can't find mob?
			join(eventMob)
			return true;
			// Go there, then!
		}
		return false;
	}
	
	
	serverEvents() {
		if (character.ctype == 'merchant') return;
		for (let eventMob in G.events) {
			eventMob = String(eventMob)
	
			// if (!joinEvent(eventMob)) continue;
			if (this.joinEvent(eventMob)) this.current_action = eventMob
	

			if (this.current_action == eventMob && !parent.S[eventMob]) this.moveToThen(myFarmDefault, this.clear_current_action())
			
		}
	}

	moveToThen(loc, then) {
		smart_move(loc)
		.catch(() => {
			if (!character.moving && !smart.moving) use_skill('use_town')
				.then(smart_move(loc))
		})
		.then(then)

	}

	manage_idle() {

		if (smart.moving || this.current_action || (this.current_action && !this.current_action == '')) return;

		if (character.moving) {
			this.idle_counter = 0;
		}

		// only increment counter when we're doing nothing
		if (!this.current_action && !character.moving && !this.thinking) {
			this.idle_counter += 0.2
			if (this.idle_counter % 1 == 0) log(`Idle: ${this.idle_counter}`);
		}
		
		if (this.idle_counter > 10 && !smart.moving) {
			log('idle move')
			this.moveToThen(myFarmDefault, this.set_current_action('farming'))
		}
	}

  
	fixStuck(){
		if (smart.moving) return
		// stuck in main
		if (character.x == 0 && character.y == 0) {
			this.clear_current_action();
			log('stuck move')
			smart_move(myFarmDefault)
		}
	}
  
  
	dry() {
	  // checks to see if we're out of weed
	  // if no health potions, go get them
	  if (quantity(desired_hp_pot) < 15) {
		  return true;
	  }
  
	  // if no mana potions, go get them
	  if (quantity(desired_mp_pot) < 15) {
		  return true;
	  }
	  
	  return false;
	}
  
  
	get_pot() {
  
	  // get potions since we're out of one of them
	  // determine how many we need to buy
	  let HP_TO_BUY = desired_potion_count - quantity(desired_hp_pot);
	  let MP_TO_BUY = desired_potion_count - quantity(desired_mp_pot);
  
  
	  if (character.moving || smart.moving || this.thinking) return;
	  this.thinking = true;
  
	  // go to the nearest potion seller & buy
		log('pot move')
		smart_move({ to: "potions", return: true }, () => {
				this.clear_current_action()
				if (HP_TO_BUY > 0) buy(desired_hp_pot, HP_TO_BUY);
				if (MP_TO_BUY > 0) buy(desired_mp_pot, MP_TO_BUY);
				sell_extras();
				this.thinking = false;
		})
	}
  
  farmSell() {


	if (smart.moving || character.ctype == 'merchant') return;
	// if (!character.esize <= 5) return;
	  log('farmSell move')
	smart_move('main').then(() => {
		sell_extras();
		this.clear_current_action()
		// 	// sellAllByName('ringsj');
		// })
	})

	}
	
	// if full, call merchant. if merchant, manage inv
	manage_inv() {
	  	if (this.dry()) this.get_pot();
		valuaBank();
		if (character.esize <= 5) this.farmSell();
	}
	
  
	manage_healing() {
	  if (character.ctype == "paladin") {
		if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
		if (!is_on_cooldown("selfheal") && character.hp < character.max_hp - 200 && character.slots.mainhand.name != "ololipop") {
		  if (character.mp > 100) {
			  use_skill("selfheal", character).then(s => {return}, f=>{return})
		  } else {
			  use(locate_item(desired_mp_pot));
		  }
		  if (is_on_cooldown("selfheal") && !is_on_cooldown("regen_mp") && character.hp <= character.max_hp - 500) use(locate_item(desired_hp_pot)) 
		}
		if (character.slots.mainhand.name == "ololipop") {
			  if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
		  }
		  if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp").then(s => {return}, f=>{return});
		  return;
	  } else {
		if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
		if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
	  }
	  if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp");
	  if (!is_on_cooldown("regen_hp") && character.hp < character.max_hp) use_skill("regen_hp");
	}
	
  
	  buff(skill) {
  
		  // do more dynamic character solution later
		  let characters = ["VendorGuy", "camelCase", "cannaMace", "couplaGrapes"];
		  for (let idx in characters) {
			  let name = characters[idx]
			  let target = get_player(name)
			  if(!target) continue;
			  if (!target.s.skill || target.s.skill.f !== character.name) {
				  use_skill(skill, name)
					  .then(log(`using skill ${skill}`))
					  .catch(`use skill ${skill} failed`)
			  }
		  }	
	}
	
  
	manage_buffs() { 
	  switch (character.ctype) {
		  case "paladin":
			  this.buff("mshield")
		  default:
			  null
	  }
	}
  

	handleMonsterHunt(){
		if (character.ctype == 'merchant' || character.id == 'camelCase') return;
		let monsterHunterLocation = {
			map: 'main', 
			x: parent.G.maps.main.npcs[24].position[0],
			y: parent.G.maps.main.npcs[24].position[1],
		}


		if (character.s.monsterhunt){
	
			// if monsterhunt not finished, keep killing
			if (character.s.monsterhunt.c > 0){
				// if mobType not in 'mobs' : skip
				let mobType = character.s.monsterhunt.id
				if (!mobsLow.includes(mobType) && this.current_action == 'monsterhunt') {
					this.clear_current_action();
					this.can_kill = false
					return
				};
				if (!mobsLow.includes(mobType)) return
				if (this.current_action == 'farming' && (character.x != monsterHunterLocation.x && character.y != monsterHunterLocation.y)) return;

				// if can kill or not current action, set
				this.can_kill = true
				if (this.current_action != 'monsterhunt') this.set_current_action = 'monsterhunt'

				// if (!mobs.includes(mobType) || !G.monsters[mobType].attack > character.hp/20) return
				// targetting
				let target = get_targeted_monster()
				let nearest = get_monster({ type: mobType, no_target: true })
				if (!target && nearest) change_target(nearest)
	
				// if not there, go!
				log('monsterhunt move')
				if (!nearest && !smart.moving) smart_move(mobType)
			}

	
			// if finished, turn in.
			if (character.s.monsterhunt.c == 0 && !smart.moving){
				log('monsterhunt complete move')
				smart_move(monsterHunterLocation).then(() => {
					parent.socket.emit('monsterhunt')
					this.clear_current_action()
				})
			}
		}
		if (!character.s.monsterhunt && !smart.moving){
			// get quest from Daisy
			log('monsterhunt get quest move')
			smart_move(monsterHunterLocation).then(() => {
				parent.socket.emit('monsterhunt')
				setTimeout(function(){
					parent.socket.emit('monsterhunt')
				}, character.ping)
				this.set_current_action('monsterhunt')
			})
		}
	}


	manage_combat() {
		
		if (character.rip || smart.moving) return;
													
		skill3shot(get_nearby_entities());
	}

	manage_item_bounty() {
		if (!this.itemBounty) return
		if (quantity(this.itemBounty) >= this.itemBountyQty) {
			this.clear_current_action()
			this.itemBountyQty = false
			this.itemBounty = false
		}
	}

	
  
	sequence() {
		this.handle_death()
		if (character.rip) return;
		handle_party()
		this.manage_item_bounty
		//this.handleMonsterHunt();
		this.manage_idle()
		this.manage_inv()
		// this.manage_task()
		this.manage_healing()
		//this.manage_buffs()
		this.manage_combat()
		// this.fixStuck();
		this.serverEvents();
	}

  
	loop() {
	  this.sequence()
		  
	  // loop timeout
	  setTimeout(() => {
		this.loop()
	  }, 200);
	};
  }
  
let char = new Ranger;
char.loop();


// send_cm("CHARACTERNAME",{a:1,b:2,c:"something"});
character.on("cm", (m) => {
	log(m)

	// Make sure the message is from a trusted character
	if (!is_friendly(m.name)) {
		log(`UNAUTHORIZED CM ATTEMPT: ${m.name}`)
		return
	}	
		let data = m.message
	log(data);  // Do something with the message!
	if (!data.cmd) return;
	switch (data.cmd) {
		case 'move':
			char.current_action = false;
			if (!data.loc) {
				smart_move(myFarmDefault)
				break;
			}
			smart_move(data.loc)
			break;
		case 'itemBounty':
			if (!data.itemBounty || !data.itemBountyQty) break;
			char.current_action = data.cmd
			char.itemBounty = data.itemBounty
			char.itemBountyQty = data.itemBountyQty
			for (let mobToFarm in itemMobDict) if (itemMobDict[mobToFarm].includes(data.itemBounty)) smart_move(mobToFarm)
			break;
	}
	// if (data.cmd == 'move' && data.loc) smart_move(data.loc) 
	}
)

function item_quantity(name)
{
	for(var i=0;i<42;i++)
	{
		if(character.items[i] && character.items[i].name==name) return character.items[i].q||0;
	}
	return 0;
}

function death_return(location){
		if (character.rip || is_moving(character)||smart.moving) return;
	log('death return move')	
	smart_move(location)
	}



function toMerch(){
	if (!is_in_range(get_player(merchant))) return;
	for (let i = 0; i < 9; i++) {
		let item = "egg"
		i = i.toString()
		let itemName=item+i
		if(!locate_item(itemName)) return false;
		let itemLoc = locate_item(itemName)
		send_item(merchant, itemLoc, character.items[itemLoc]['q']);
	}
	for (let i = 5; i<42; i++) {
		if (!character.items[i]) continue;
		send_item(merchant, i, character.items[i]['q']);
	}return;
}

// function toSnek(){
// 	if(is_moving(character)) return;
// 	smart_move("halloween");
// 	setInterval(function(){
// 		if(is_moving(character)) return;
// 		xmove(-495,-500);
// 	},5000);
// }