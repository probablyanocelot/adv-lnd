	manage_combat_old() {
	  if (character.ctype == "merchant") return;
	  if (this.pvp) return;
	  // if hit by player, focus the player & call the bois lul
	  if (!this.pvp) {
  
		// until we have situational targets, define a target
		if (!this.mon_type) this.mon_type = "cgoo";
  
		// only targets without a target already
		let target = get_monster({ type: this.mon_type });
		if (!target || target.rip) {
  
		  target = get_nearest_monster({ type: this.mon_type });
		  
		  if (!target) return;
  
		  if ((!target.target == undefined) && (!is_friendly(target.target))) {
			change_target(null);
			return;
		  }
		  if (target) {
			change_target(target)
		  }
  
		  // if still no target, smart_move to monster
		  if (!target) {
			set_message('No Monsters');
  
			// if moving/limiters: halt
			if (character.moving || smart.moving || this.thinking) return;
			this.thinking = true;
  
			smart_move(this.mon_type).then(
			  success => {
				this.thinking = false;
			  },
			  failure => {
				this.thinking = false;
			  }
			);
			return;
		  }
		} // CODE BELOW HERE ASSUMES THERE IS A TARGET
  
		if (smart.moving || this.thinking) return;
  
		if (distance(character, target) > character.range * 0.9) {
		  if (can_move_to(target.real_x, target.real_y)) {
			let half_x = character.real_x + (target.real_x - character.real_x) / 2;
			let half_y = character.real_y + (target.real_y - character.real_y) / 2;
			move(half_x, half_y);
		  }
		}
		if (can_attack(target) && !parent.is_disabled(character)) {
		  set_message('Attacking');
		  manage_combat_skills(target);
		  if (!is_on_cooldown('attack')) attack(target);
		}
		loot();
	  }
	}

class SomeClass {
	clearWrap(fn) {
		fn && fn();
		this.clear_current_action();
	}

	traveller(loc1, loc2, a, b, c, d) {
		smart_move(loc1)
			.then(() => {
				a && this.clearWrap(a)
				b && this.clearWrap(b)
				c && this.clearWrap(c)
				d && this.clearWrap(d)
				if (loc2) loc2()
					.then(() => {
						this.clear_current_action();
					})
					.catch(() => {
						this.idle_counter = 0;
						this.clear_current_action();
					}
					);
			})
			.catch(() => {
				log("FAILURE traveller");
				this.idle_counter = 0;
				this.clear_current_action()
			}
			);
	}
	//traveller("bank", "main", this.bank_dropoff, )
}

bank_dropoff2() {
	for (let idx in character.items) {
		let item = character.items[idx];
		if (item) {
			if (!G.items[item.name].upgrade && !G.items[item.name].compound) bank_store(idx, "items1");
			for (let teller of Object.keys(BANK_ITEMS)) {
				let bank = BANK_ITEMS[teller]
				if (bank.includes(item.name)) {
					this.set_current_action("banking");
					smart_move("bank")
						.then(() => {
							log("Bank success clear")
							this.clear_current_action();
							bank_store(idx, teller);
							//this.do_idle();
						})
						.catch(() => {
							log("Bank fail clear")
							this.clear_current_action()
						}
					)
				}
			}
		}
	}
}