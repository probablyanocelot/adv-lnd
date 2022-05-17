// EARTHIVERSE
// This line is unrelated to your 3 SHOT logic



function get_nearby_entities() {
	let entities = []
	for (const id in parent.entities) {
		const entity = parent.entities[id]
		if (!entity.mtype) continue // Not a monster

		if (!is_in_range(entity)) continue;

		if (!entity.target == character.id) continue
		
		// TODO: Add filters to exclude entities you don't want

		if (mobs.includes(entity.mtype)) entities.push(entity);
	}
	return entities;
}


function focus(entities){
	// TODO: add more priority checks
	entities.sort((a, b) => {
		// Example: Prioritize those targeting you
		if (a.target == character.id && b.target !== character.id) return -1
		if (b.target == character.id && a.target !== character.id) return 1

		// Example: Prioritize lower hp entities
		if (a.hp !== b.hp) return a.hp - b.hp

		// No difference in priority
		return 0
	})

	if (entities.length > 0) return entities[0]
}



// 3 SHOT
let last_use_3shot = 0;
function skill3shot(targets, manaReserve = 0.3) {
	
    if(character.ctype !== "ranger") return
    if(is_on_cooldown("attack")) return 
	//if(Date.now() - last_use_3shot >= 1000) return // We don't want to 3shot too often
	//if(targets.length < 2) return // Not enough targets to 3shot
    
    // Remove all targets out of range
    const inRangeTargets = []
    for(var target of targets) {
        if (get_monster(target)){
			target = get_monster(target)
			log(3.333)
		}
		if(!is_in_range(target)) continue; //)||target.ctype) continue // Out of range or is character
        inRangeTargets.push(target)
    }
    
	if (inRangeTargets.length < 1) return // Not enough targets to 3shot
	if (inRangeTargets.length === 1) attack(inRangeTargets[0])
    if(manaReserve > (character.mp / character.max_mp)) return // We are low on mana, don't use 3shot
    log("3 SHOT")
    use_skill("3shot", inRangeTargets)
    last_use_3shot = Date.now()
}
// 3 SHOT