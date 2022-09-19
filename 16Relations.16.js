log("16 - cm.16.js")
load_code('24Traversal')

function group_cm(botlist, my_code) {
    for (let bot in botlist) {
		if (bot == character.id) continue;
        send_cm(botlist[bot], my_code)
    }
}


character.on("cm", function (m) {
	if (is_friendly(m.name)) {
		// Make sure the message is from a trusted character
		log(m.message);  // Do something with the message!
		switch (m.message.code) {
			case "move":
				smart_move(m.message.loc)
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
		
	}
)

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
