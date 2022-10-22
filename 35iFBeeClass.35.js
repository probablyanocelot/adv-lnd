log("31")
performance_trick()
load_code('1Main')
load_code('16Relations')	// cm
load_code('13Skills')	//skill3shot(), get_nearby_entitties()
load_code('14Partying')	// PARTY, bots
load_code('15Combat')
load_code('19management') //sell extras -- merge this and 12Inv?
load_code('40Gui')

let merchant = 'VendorGuy';
let group = '1ra1pr1ro'
let currentGroup = getGroup(group)
let myFarmMob = farmDefault[character.id]
let myFarmLocation = mobLocationDict[myFarmMob].loc

let farmerReserve = 2500000;
let desired_potion_count = 9999;
let desired_mp_pot = "mpot1"
let desired_hp_pot = "hpot1"
let PACK_THRESHOLD = 28;

let myMtype = 'cgoo'

if (character.controller) log(character.controller)

//STARTUP
if (character.name == currentGroup[0]) startBots(currentGroup);
const keyInviteBots = map_key("9", "snippet", "sendInvites('r3')")
const keyKillBots = map_key('8', 'snippet', "killBots(currentGroup)")
setInterval(loot, 65)

let lastScare;

character.on('hit', function(data) {
	let orb = character.slots.orb
	if (!orb || !orb.name == 'jacko') return
	if (lastScare == null || new Date() - lastScare >= 1000) {
		if (character.mp >= 50 && !is_on_cooldown('scare')) {
			use_skill('scare', data.actor)
			lastScare = new Date()
		}
	}
})

function pvpBank() {
	for (let item of character.items) {
		if (!item) continue;
		if (is_pvp()){
			switch (item["name"]) {
				
				case "suckerpunch":
					if (!server.id == "I") {
						change_server("US", "I")
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
}


function get_luck_elixir() {
	if (!character.slots.elixir) return
	let timeToExpire = new Date - character.slots.elixir.expires
	log(timeToExpire)
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
	char.moveToThen(myFarmLocation, char.current_action = myFarmMob)
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
		this.turret = true;
		this.mon_type;
		this.can_kill;
		this.itemBounty;
		this.itemBountyQty;
		
		if(character.ctype == 'paladin') this.turret = false

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

	isActionMonster() {
		if (G.monsters.hasOwnProperty(this.current_action)) return true
		return false
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


	drink(){
		let elixir = locate_item('elixirluck')
		
		// Don't have any elixirs; TODO: if -1, ask merch for more
		if (elixir == -1) return
		
		// Already drinking elixir
		if (character.slots['elixir']) return
		
		if (!character.slots['elixir'] && elixir > -1) use(elixir)
	}
	
	
	serverMiniEvents() {

		// TODO: snowman, rabbit support -- smart_move('snowman') gives 'Unrecognized Location'
		let bosses = ['mrpumpkin', 'mrgreen', 'snowman',]		//'snowman', 'rabbit'
		let rareBosses = []

		// if (this.current_action && this.current_action != 'farming') return

		for (let boss of bosses) {
			if (parent.S[boss] && parent.S[boss].live) {

				if (boss == 'snowman' && (parent.S.mrgreen.live || parent.S.mrpumpkin.live)) return

				// TODO: what if current_action is more important event?
				if (smart.moving) return
				// TODO: maybe just mobsFocus / mobsGroup .includes(current_action)
				// e.g. is event mob, etc
				if ((!this.current_action || this.current_action == 'farming') && this.current_action != boss) this.current_action = boss

				if (is_in_range(get_nearest_monster({ type: boss }))) break
				
				
				let bossLocation = mobLocationDict[boss].loc // imported data set
				if (!bossLocation) {
					log('no boss location defined!!')
					smart_move(boss)
					return
				}
				if (this.current_action == boss && !get_nearest_monster({ type: boss })) smart_move(bossLocation)
			}

			if (!this.current_action == boss) continue
			if (parent.S[boss] && !parent.S[boss].live && this.current_action == boss && !smart.moving) this.moveToThen('main', this.clear_current_action())
		}

	}
	
	joinEvent(event) {
		// event = 'icegolem', etc
		if (!parent.S[event]) return// no event 
		if (event == 'franky') return;
		if (parent.S.halloween) return // nobody farming in season

		if (this.current_action == event) return // we set this true once we get there

		// if event is a mob name and we don't see the mob, join
		if (G.monsters[event] && get_nearest_monster({ type: event })) return
		
		join(event)
		return true;
	}

	serverEvents() {
		if (character.ctype == 'merchant') return;
		for (let event in G.events) {
			// seasonal events are global, not joinable
			if (seasonalEvents.includes(event)) continue
			event = String(event)
	
			// if checks return true, set action to event
			if (this.joinEvent(event)) this.current_action = event
	

			if (this.current_action == event && !parent.S[event] && !smart.moving) this.moveToThen(myFarmLocation, this.clear_current_action())
			
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


	async manage_idle() {

		if (smart.moving) {
			this.idle_counter = 0;
		}

		// if (character.ctype == 'paladin') return
		if (smart.moving || this.isActionMonster() || (this.current_action && !this.current_action === '')) return;

		// only increment counter when we're doing nothing
		if (!this.current_action && !character.moving && !this.thinking) {
			this.idle_counter += 0.2
			if (this.idle_counter % 1 == 0) log(`Idle: ${this.idle_counter}`);
		}
		
		if (this.idle_counter > 5 && !smart.moving) {
			log('idle move')
			await smart_move(myFarmLocation)
			this.set_current_action(myFarmMob)
		}
	}

  
	fixStuck(){
		if (smart.moving) return
		// stuck in main
		if (character.x == 0 && character.y == 0) {
			this.clear_current_action();
			log('stuck move')
			smart_move(myFarmLocation)
		}

		// !TODO: replace farmDefault with 'is in' dict logic. maybe .hasOwnProperty()
		// if (this.current_action == 'farming' && character.x != farmDefault[character.id].x && character.y != farmDefault[character.id].y) {
			// if (character.moving || smart.moving) return
			// smart_move(farmDefault[character.id]).catch(use_skill('use_town'))
		// }
	}
  
  
	dry() {
	  // checks to see if we're out of weed
	  // if no health potions, go get them
	  if (quantity(desired_hp_pot) < 100) {
		  return true;
	  }
  
	  // if no mana potions, go get them
	  if (quantity(desired_mp_pot) < 100) {
		  return true;
	  }
	  
	  return false;
	}
  
  
	count_pot() {
		// determine how many we need to buy
		let HP_TO_BUY = desired_potion_count - quantity(desired_hp_pot);
		let MP_TO_BUY = desired_potion_count - quantity(desired_mp_pot);	
		let pots = {
			h: {
				type: desired_hp_pot,
				qty: HP_TO_BUY,
			},
			m: {
				type: desired_mp_pot,
				qty: MP_TO_BUY,
			}
		}
		return pots
	}


  

	
	// if full, call merchant. if merchant, manage inv
	manage_inv() {
		pvpBank();
		
		// don't call the truck if we're in a very temporary place (event bosses)
		if (smart.moving) return
		if (this.current_action && mobsGroup.includes(this.current_action)) return
		for (let event in parent.S) {
			if (parent.S[event].live && mobsGroup.includes(String(event))) return
		}
		if (this.dry()) {
			if (this.turret == false) this.set_current_action('unpacking')
			doCm(merchant, { cmd: 'unpack', loc: current_location(), pots: this.count_pot() });
		}
		if (character.esize <= 24) doCm(merchant, {cmd:'unpack', loc:current_location(), pots: this.count_pot()});
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
		
		let target;

		// if (character.ctype != 'ranger' && character.ctype != 'merchant') doCombat()

		if (this.current_action && G.monsters.hasOwnProperty(this.current_action)) target = get_nearest_monster({ type: this.current_action })

		// GROUP MOBS / HARDER MOBS GET PRIORITY
		for (let mob of mobsFocus) {
			let targetFocus = get_nearest_monster({ type: mob })
			if (!targetFocus) continue
			target = targetFocus
			break
		}


		// near weak/always-attack mobs
		if (!target) {
			this.target = false
							
			if (this.isActionMonster()) {
				target = get_nearest_monster({ type: this.current_action })
			}

			if (this.current_action && !this.isActionMonster()) {

				for (let mob of mobsLow) {
					target = get_nearest_monster({ type: mob })
					// ! NOT OPTIMAL; SUPERSHOT IS 3x character.range !!
					if (target) break
				}
			}
				
		}
		
		
		if (!target) return 	// must have target beyond here
		this.target = target

		// if(!is_in_range(target) && can_move_to(target.x, target.y)) {
		// 	move(
		// 		character.x+(target.x-character.x)/4,
		// 		character.y+(target.y-character.y)/4
		// 	);
		// 	// Walk 1/4 the distance
		// }
		let targetName = target.mtype

		// TODO: maybe better phoenix selection
		if (!mobsFocus.includes(targetName)) {
			if (get_nearest_monster({ type: 'phoenix' })) target = get_nearest_monster({ type: 'phoenix' })
		}

		if (character.ctype == 'rogue') {
			let priest = get_player('prayerBeads')
			if (priest.target) {
				if(get_monster(priest.target)) target = get_monster(priest.target) 
			}
		}


		combatDistancing(target)


		// GROUP MOBS
		if (mobsGroup.includes(targetName)) {
			avoid(target)
			if(!target.target) return
		}


		change_target(target)
		
		switch(character.ctype) {
				
			case 'mage':
				if (!member.s.energize && !is_on_cooldown('energize')) use_skill('energize')
				break
			
			case 'ranger':
				if (target.max_hp > character.attack * 3 && !is_on_cooldown('huntersmark') && character.mp >= 400) use_skill('huntersmark', target)
			if (target.max_hp >= character.attack * 1.5 && !is_on_cooldown('supershot') && character.mp >= 500) use_skill('supershot', target)
			// ! MAYBE DO <= character.attack * 2
			if (target.max_hp < character.attack * 0.7 * 3 * 2 && !is_on_cooldown('3shot')) skill3shot(mobsLow, get_nearby_entities())
				break
				
			case 'priest':
				if (character.hp <= character.max_hp - G.skills.partyheal.output && !is_on_cooldown('partyheal') && character.mp > G.skills.partyheal.mp) use_skill('partyheal')
				break
			
			case 'rogue':
				this.party_buff('rspeed')
				
				break
				
		}


		if (!is_on_cooldown('attack')) attack(target)

		// if (!is_on_cooldown('3shot')) skill3shot(mobsLow, get_nearby_entities());
	}

	manage_item_bounty() {
		if (!this.itemBounty) return
		if (quantity(this.itemBounty) >= this.itemBountyQty) {
			this.clear_current_action()
			this.itemBountyQty = false
			this.itemBounty = false
		}
	}

	party_buff(skill, currentGroup){
		let party = currentGroup ?? parent.party
			for (let member of party) {
				if (!get_player(member)) continue
				member = get_player(member)
				// TODO: if (G.skills?.mp) have enough, do skill
				// TODO: or something that checks for G.skills.mp
				let mpCost = G.skills[skill].mp
				if (mpCost && character.mp < mpCost) return
				if (!member.s[skill] && !is_on_cooldown(skill)) use_skill(skill, member.id)
			}
		}
		//}
  
	sequence() {
		this.handle_death()

		if (character.rip) return;
		
		handle_party()
		orbSwap()
		if (!this.current_action || this.current_action && !mobsGroup.includes(this.current_action)) getLuck()
		this.drink()
		this.manage_item_bounty
		//this.handleMonsterHunt();
		this.manage_idle()
		this.manage_inv()
		// this.manage_task()
		this.manage_healing()
		//this.manage_buffs()
		this.manage_combat()
		this.fixStuck();
		this.serverEvents()
		this.serverMiniEvents()
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

character.on("cm", async (m) => {
	if (!is_friendly(m.name)) return
	let data = m.message

	if (!data.cmd) return;

	switch (data.cmd) {
		case 'clear':
			switch (character.ctype) {
				case 'merchant':
					merchantBot.clear_current_action()
					break
				default:
					char.clear_current_action()
					break
			}
			break
		
		case 'farm':
			if (character.ctype == merchant) break
			if (char.current_action && mobsGroup.includes(char.current_action)) break
			if (!data.mob) break
			let mobLoc = mobLocationDict[data.mob].loc ?? data.mob
			char.clear_current_action()
			char.set_current_action(data.mob)
			log(data.mob)
			await smart_move(mobLoc)
			break
	}
})


function avoid(target) {
	let mtype = target.mtype
	let nearest = get_nearest_monster({type: mtype})
	if (character.moving||smart.moving) return
	if (distance(character, nearest) <= character.range / 4) {
		moveInCircle(nearest, 90)
		return
	}
}



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

function getTarget() {

	let target = get_nearest_monster()
	let mobType = null
	if (target) mobType = target.mtype

	let rgoo = get_nearest_monster({type: 'rgoo'})

	if (rgoo) return rgoo

	if (!mobType) return false

	// if in dict: return target
	if (mobsLow.includes(mobType) || (mobsMed.includes(mobType) &&
		character.ctype == 'paladin')) return target;

	// else, set null and return
	target = null
	set_message("No Monsters");
	return false
}

function goToTarget(target) {
	if (!target) return
	// not in range, or we are moving - skip
	if(is_in_range(target)) return
	if(character.moving || smart.moving) return
	
	// Walk half the distance
	xmove(
		character.x+(target.x-character.x)/2,
		character.y+(target.y-character.y)/2
		);
}
	function combatDistancing(target){
		if (target) {
			// if turret, don't poke
			// ! TODO: fix having to list each ctype below
			if (mobLocationDict.hasOwnProperty(target.name) && (character.ctype == 'ranger' && mobLocationDict[target].turret)) return
			
			// can't kill in 2 hits, 1/4 range or closer -> move away
			if (target.hp > character.attack * 2 && distanceToTarget(target) <= character.range * 0.25) {
				// TODO: poking ( CREATE LINE AND MOVE 1/4 character.range DOWN LINE )
				// xmove(
				// 	character.x + (target.x - character.x) * 1.05,
				// 	character.y + (target.y - character.y) * 1.05
				// );
			}
			
			if (!is_in_range(target)) {
				// TODO: move into 3/4 character.range
				xmove(
					character.x + (target.x - character.x) / 2,
					character.y + (target.y - character.y) / 2
				);
			}

		}
	}

function distanceToTarget(target){
	let dist;
	if (target) dist = distance(character,target)
	return dist
}

function doCombat() { // doCombat(char)

	if (character.ctype == merchant) return
	// if (char.turret == false && char.current_action === 'unpacking') return
	let target = get_targeted_monster()

	if (!target || target.rip) target = getTarget()
	if (target) myMtype = target.mtype
	change_target(target)
	goToTarget(target)


	if (can_attack(target)) {
		pallySkills(target)
		attack(target);
	}

	if (!getTarget()){
		let spawnBorder = getTargetSpawnBorder(myMtype)
		let topLeft = spawnBorder[0]

		xmove(topLeft[0]*.5, topLeft[1]*.5)
	}
}




function getTargetSpawnBorder(mtype, map = false) {
    // get a target monster and return the spawn border
    if (!map) map = G.maps[character.map];
	if (map) map = G.maps[map]
    // iterate through the monsters
    for (let monster of map.monsters) {
        // if it's of our target type
        if (monster.type == mtype) {

			// TODO: simple? trig to find other 2 ends + some 'if unreachable' logic
            let topLeft = [monster.boundary[0], monster.boundary[1]]
            let bottomRight = [monster.boundary[2], monster.boundary[3]]

            return [topLeft, bottomRight]
        }
    }
}

function getLuck(){
	if (!character.s.mluck || character.s.mluck.f != merchant) doCm(merchant, {cmd:'unpack', loc:	current_location()})
}

// let spawnBorder = getTargetSpawnBorder(target)
// let topLeft = spawnBorder[0]

// if ( (target.hp < target.max_hp) && character.x !== topLeft[0] ) {
// 	xmove(topLeft[0], topLeft[1])
// }