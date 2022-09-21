log("16 - cm.16.js")
load_code('24Traversal')

function group_cm(botlist, my_code) {
    for (let bot in botlist) {
		if (bot == character.id) continue;
        send_cm(botlist[bot], my_code)
    }
}


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
				if (character.ctype != 'merchant')smart_move(myFarmDefault)
				break;
			}
			smart_move(data.loc)
			break;
				
		case 'unpack':
			// maybe bank first?
			if (char.current_action == 'mining') break;
			char.thinking = true
			if (char.current_action == 'unpacking') break;
			char.current_action = 'unpacking'
			smart_move(data.loc)
				.then(send_cm(m.name, { cmd: 'arrived' }))
			break;
		
		case 'arrived':
			if (!is_in_range(get_player(m.name))) break;

			for (let itemIndex in character.items) {
				if (!character.items[itemIndex]) continue;
				let item = character.items[itemIndex]
				if (!sell_dict['keep'].includes(item.name))send_item(m.name, item, 9999)
			}
			send_cm(m.name, { cmd: 'done_unpack'})
			break;
		
		case 'done_unpack':
			use_skill('mluck', m.name)
			char.bank_mining()
			break;
		
		case 'itemBounty':
			if (!data.itemBounty || !data.itemBountyQty) break;
			char.current_action = data.cmd
			char.itemBounty = data.itemBounty
			char.itemBountyQty = data.itemBountyQty
			for (let mobToFarm in itemMobDict) if (itemMobDict[mobToFarm].includes(data.itemBounty)) smart_move(mobToFarm)
			break;
		
		case "incoming":
			smart_move(getPosition(m.name)).then(() =>{
				change_target(get_player(m.name).target)
				let target = get_current_target();
				a = setInterval(rangerPVP(target), 220)
				if (target.rip || !target) clearInterval(a);
			}).catch(()=> {
				xmove(getPosition(m.name))
				change_target(get_player(m.name).target)
				let target = get_current_target();
				a = setInterval(rangerPVP(target), 220)
				if (target.rip || !target) clearInterval(a);
			})
			break;
		}
	}
)


character.on("incoming",function(data){
	if (data.damage> 50 && data.source != "mluck" && get_player(data.actor)){
		game_log("Incoming! "+data.damage+" from" + data.actor);
		savePosition();
		group_cm("incoming");
		change_target(get_player(data.actor));
		let target = get_current_target();
		let a = setInterval(rangerPVP(target), 220)
		if (!target || target.rip) clearInterval(a);		
	}
})

function rangerPVP(target) {
	if (!target || target.rip) return;
	if (is_in_range(target) && !is_on_cooldown("huntersmark") && character.mp>G.skills.huntersmark.mp) use_skill("huntersmark", target);
	if (is_in_range(data.actor) && !is_on_cooldown("supershot") && character.mp>G.skills.supershot.mp) use_skill("supershot", target);
	if (is_in_range(target)) attack(target)
}



// ############### - MERCHANT - ###############

function sendToMerchant() {
	if (character.ctype == 'merchant') return;
	if (!get_player(merchant)) return;
	// execute only if farmer & merchant in range
	let extraGold = character.gold - farmerReserve
	if (character.gold > farmerReserve) send_gold(merchant, extraGold)
	// send extra gold to merch
	for (let idx in character.items) {
		let item = character.items[idx]
		if (!item) continue;
		if (sell_dict['keep'].includes(item.name)) continue;
		if (item.p || sell_dict['toMerch'].includes(item.name) || item.q) send_item(merchant, idx, 9999)
		// shiny / toMerch whitelisted / stackable : send
	}
}

function request_merchant() {
	send_cm(MERCHANT_NAME, {cmd:'call',loc:current_location()})
}

function send_to_merchant(start, end) {
	for (var i = start; i < end; i++)
		if (character.items[i])
			send_item(MERCHANT_NAME, i)
}

function almost_all(start, end) {
	for (var i = start; i < end; i++) {
		send_item(MERCHANT_NAME, i, character.items[i]["q"]-1)
	}
}

let full_pack = () => {
	return character.esize <= FULL_INVENTORY_THRESHOLD;
}



function current_location() {
	return {
        server: {
            region: server.region,
            id: server.id
        },
        time: new Date().toISOString(),
        in: character.in,
        map: character.map,
        x: character.x,
        y: character.y
    }
}
