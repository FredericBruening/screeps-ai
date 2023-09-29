import settings from "config/settings";
import builder from "roles/builder";
import worker from "roles/worker";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
    }

    interface CreepMemory {
        role: string;
        ready: boolean;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    if (Game.spawns["Spawn1"]) {
        let spawn = Game.spawns["Spawn1"];
        let controller = spawn.room.controller;
        let room = spawn.room;

        if (controller && controller.level > 1) {
            // place construction sites for extensions
            if (controller.level == 2) {
                let x = spawn.pos.x - 2;
                let y = spawn.pos.y;

                let extensions = room.find(FIND_CONSTRUCTION_SITES, {
                    filter: structure => structure.structureType == STRUCTURE_EXTENSION
                })

                if(extensions.length < 5) {
                    x = x - extensions.length
                    let result = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
                    console.log(result)
                }
            }
        }

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

    // Every creep has one role
    for (const name in Game.creeps) {
        let creep = Game.creeps[name];

        if (creep.memory.role == "worker") {
            worker.run(creep);
        }

        if (creep.memory.role == "builder") {
            builder.run(creep);
        }
    }

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
});
