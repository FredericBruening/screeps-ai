import settings from "config/settings";
import worker from "roles/worker";

class CreepController {

    manage() {
        const spawn = Game.spawns['Spawn1']

        if(!spawn) return

        this.spawnCreeps(spawn)

        // Every creep has one role
        for (const name in Game.creeps) {
            let creep = Game.creeps[name];

            if (creep.memory.role == "worker") {
                worker.run(creep);
            }
        }

        // Automatically delete memory of missing creeps
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
            }
        }
    }

    spawnCreeps(spawn: StructureSpawn) {
        // Create a creep inventory to count current number of creeps
        let creepsInventory: { [key: string]: number } = {
            worker: 0,
            builder: 0
        };

        for (const name in Game.creeps) {
            let creep = Game.creeps[name];

            if (creep.memory.role in creepsInventory) {
                creepsInventory[creep.memory.role] += 1;
            }
        }

        // Spawn necessary creeps
        for (const name in creepsInventory) {
            if (creepsInventory[name] < settings.creeps[name]) {
                let newName = name + Game.time;

                spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: name, ready: false } });
            }
        }
    }
}

export default CreepController;
