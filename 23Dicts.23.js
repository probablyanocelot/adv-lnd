// SET UP A MOB DICT FOR THIS
// ! USE THIS IN TRAVELLING FN TO GIVE COORDS IF NO x / y GIVEN
// let map = G.maps[character.map];

// // iterate through the monsters
// for (let monster of map.monsters) {
// 	// if it's of our target type
// 	if (monster.type == mtype) {

// 		let topLeft = [monster.boundary[0], monster.boundary[1]]
let crab = { map: "main", x: -1175.7559333568836, y: -94.26759905415406 }
let squig = { map:"main", x: -1165.6557029608748, y: 300.21328251075323 }
let squigSouth = { map:'main', x: -1166.3100928140552, y: 478.627440332755 }
let optimalBee = { map: "main", x: 745.0119325069998, y: 713.0353542476796 }
let snake = { map:'main', x: -99.00430360974092, y: 1892.1728334181553}
let osnake = {map: "halloween",x: -585.5701569278165,y: -350.4367234174731,}
let cgoo = { map: 'arena', x:933, y:-178 }
let mrpumpkin = { map: 'halloween', x:-309, y:786 }
let mrgreen = { map: 'spookytown', x: 480, y:1070 }
let snowman = { map: 'winterland', x:1150, y:-850 }

let mobLocationDict = {
	'crab': {
		loc: crab,
		turret: true,
	},
	'squig': {
		loc: squig,
		turret: true,
	},
	'squig2': {
		loc: squigSouth,
		turret: true,
	},
	'bee': {
		loc: optimalBee,
		turret: true,
	},
	'snake': {
		loc: snake,
		turret: true,
	},
	'osnake': {
		loc: osnake,
		turret: true,
	},
	'cgoo': {
		loc: cgoo,
		turret: false,
	},
	'mrpumpkin': {
		loc: mrpumpkin,
		turret: false,
	},
	'mrgreen': {
		loc: mrgreen,
		turret: false,
	},
	'snowman': {
		loc: snowman,
		turret: false,
	}
}


let bots = {
	'3ra': ['couplaGrapes','cannaMace','camelCase','VendorGuy'],
	'2ra': ['couplaGrapes','camelCase','VendorGuy'],
	'2ra1p': ['couplaGrapes','camelCase','SaladMan','VendorGuy'],
	'1ra1p1ro': ['camelCase','SaladMan','Teef','VendorGuy'],
}

function makeGroups(){
	// dict of ctypes, maybe do if {mainChar} == x, group=y	
	switch(character.ctype){
		case 'ranger':
			break
		case 'paladin':
			break
	}
}


let itemMobDict = {
	'spider': 'spidersilk',
	'snake': ['stramulet', 'intamulet', 'dexamulet',],
	'arcticbee': ['strring', 'vitring', 'intring', 'dexring',],
}
let sell_dict = {
	'keep': 
		[
			'hpot0', 'hpot1', 'mpot0', 'mpot1',
			'stand0', 'tracker',
			'primling', 'offering',
			'scroll0', 'scroll1', 'scroll2',
			'cscroll0', 'cscroll1', 'cscroll2',
		],
    'low':
		[
			'hpamulet', 'hpbelt', 'wcap', 'wshoes', 'wattire',
			'wbreeches', 'wgloves', 'stinger', 'cclaw', 'ringsj',
			'vitearring',
		],
	'toMerch':
		[
			'ringsj', 'gem0', 'gem1', 'seashell',
		],
	'merchSell':
		[
			'coat1', 'helmet1', 'hpbelt', 'hpamulet', 'whiteegg', 'pmaceofthedead', 
			'smoke', 'phelmet', 'gphelmet',
		],
	'merchTradeSell':
		[
			'throwingstars',
		]
}
let mobsLow = [
	"bee", "crab", "squigtoad", "snake", "osnake", "armadillo",
	"croc", "squig", "goo", "tortoise", 
	"goldenbat", "phoenix", "tinyp", "greenjr", "minimush", 'bgoo',
	'rgoo', 'grinch', 'crabx', 'frog', 'cutebee',
	// group mobs
	'crabxx', 'franky', 'mrpumpkin','mrgreen', "icegolem",

];

let mobsGroup = ['crabxx', 'franky', 'mrpumpkin', 'mrgreen', 'icegolem',]

let mobsFocus = [
	'franky', 'mrpumpkin', 'mrgreen', 'icegolem', 'grinch',
	'cutebee', 'tinyp', 'rgoo', 'jr', 'greenjr', 'snowman',
]

let mobsMed = [
	'rat', 'bbpompom', 'cgoo', "iceroamer", 'scorpion', "bat", 'arcticbee',
	"porcupine", "spider",
]

let mobsHard = {

}



let farmDefault = {
	"cannaMace": squig,
	"camelCase": crab,
	"couplaGrapes": squigSouth
}

let seasonalEvents = ['halloween','holidayseason','lunarnewyear','valentines']