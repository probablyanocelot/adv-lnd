log("31")
load_code(1)	//base
load_code(13)	//skill3shot(), get_nearby_entitties()
load_code(14)	// PARTY
load_code(15)	//bots
load_code(16)	// cm

//const { webFrame } = require('electron');
//webFrame.setZoomFactor(0.5);

//send_cm("camelCase", {code: "move", loc: locations["camelCase"]})

performance_trick()

class Ranger extends Character {
	constructor(){
		super()
		this.attributes;
	}
	farmFlow(){
		if (!this.state) tasker();
	}
	tasker(){
		
	}
	
	
}

let rangers = ["cannaMace", "camelCase", "couplaGrapes",] 
function startRangers(){
	for (var toon of rangers)
	{
		if (toon == character.id) continue; // || toon == "camelCase"
		start_character(toon, 30)
	}
}
startRangers()
let mobs=["bee", "crab", "squigtoad", "snake", "rat", "armadillo", "croc", "squig", "spider", "porcupine", "goo", "tortoise",];

const invite_bots = map_key("9","snippet","sendInvites('r3')")





// SET UP A MOB DICT FOR THIS
let crab = {map:"main", x:-1175.7559333568836, y:-94.26759905415406}
let squig = { map:"main", x: -1143.6557029608748, y: 423.21328251075323 }
let squigSouth = { map:'main', "x": -1175.1357465735891, "y": 505.95326309049074 }
let optimalBee = { map: "main", x: 745.0119325069998, y: 713.0353542476796 }


// bees
// let cMacePos = {map: "main", x: 524.6951256023658, y: 806.8168003462486}
// let cCasePos = { map: "main", x: 230.8360471312811, y: 1465.6396571609434 }

let locations = {
	"cannaMace": squig,
	"camelCase": crab,
	"couplaGrapes": squigSouth}


function leaveBank(){
	if (character.bank) {
		smart_move("main").then(
			s => {smart_move(locations[character.id])
				 return}
			,
			f => {smart_move(locations[character.id])
				 }
			)
	}
}


function bee_bank() {
	if (smart.moving || character.moving) return;
	smart_move("bank").then(
		success => {
			for (let i = 5; i < 42; i++){
				if(character.items[i]) bank_store(i, "items2")
			}
			if (character.gold > 1250000){
				let reserve = 500000;
				let deposit = character.gold - reserve;
				bank_deposit(deposit)
			}
			if(character.gold < 500000) {
				log("Bank success");
				bank_withdraw(500000);
			}
			return
		},
		failure => {
			log("bank failed");
			smart_move(locations[character.id]);
		});
	leaveBank();
}




var attack_mode=true
var playerName = character.id;    
    // get our self
setInterval(function () {
	savePosition()
	if(character.rip) handle_death();
	
	if (character.rip || smart.moving) return;	
		

	let u = setInterval(loot(), 50);
	
	valuaBank()
	
	if (character.esize <= 1) bee_bank();
	
	
	if(character.rip) return;	
	
	if(character.hp<character.max_hp*.85 || character.mp<=character.max_mp-300) use_hp_or_mp();
	
	if(!attack_mode || character.rip || is_moving(character)) return;
	
	if(item_quantity("mpot1")<20) // item_quantity is defined below
	{
		smart_move({to:"potions",return:true},function(){ buy("mpot1",2500); });
		return;
	};
	if(item_quantity("hpot1")<20) // item_quantity is defined below
	{
		smart_move({to:"potions",return:true},function(){ buy("hpot1",600); });
		return;
	};
	skill3shot(get_nearby_entities());
	clearInterval(u);
},210); // Loops every 1/4 seconds.

function item_quantity(name)
{
	for(var i=0;i<42;i++)
	{
		if(character.items[i] && character.items[i].name==name) return character.items[i].q||0;
	}
	return 0;
}

function death_return(location){
		if (character.rip || is_moving(character)) return;
		smart_move(location)
	}


function handle_death()
{
	setTimeout(respawn,25000);
	setTimeout(death_return(locations[character.id]), 26000);
}

function toMerch(){
	if (!is_in_range(get_player("VendorGuy"))) return;
	for (let i = 0; i < 9; i++) {
		let item = "egg"
		i = i.toString()
		let itemName=item+i
		if(!locate_item(itemName)) return false;
		let itemLoc = locate_item(itemName)
		send_item("VendorGuy", itemLoc, character.items[itemLoc]['q']);
	}
	for (let i = 5; i<42; i++) {
		if (!character.items[i]) continue;
		send_item("VendorGuy", i, character.items[i]['q']);
	}return;
}

function toSnek(){
	if(is_moving(character)) return;
	smart_move("halloween");
	setInterval(function(){
		if(is_moving(character)) return;
		xmove(-495,-500);
	},5000);
}