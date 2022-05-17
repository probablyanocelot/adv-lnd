log("6 - Ranger.6.js")


class Ranger extends Character {
    constructor() {
        super()
    }

    loop() {
        log(`Processing loop with action: ${this.current_action}`)

        if (this.thinking) {
            return;
        }

        if (character.rip) {
            respawn();
            log("Rip! Respawn clear")
            this.clear_current_action();
            this.thinking = false;
        } else {
            
            if (!this.current_action) {
                // get task
                //this.get_task();

                if (this.task.hp > character.att * 3 || this.task.att > character.max_hp / 11) {
                    this.task = "high"
                }
            }
        }
    }

    get_task() {
        if (!this.task) {
            this.task = "some_task_logic"
        }
        else if (this.task == "high") {
            // check back in 30 min... how?
        }
    }

}


char = new Ranger;
char.loop();