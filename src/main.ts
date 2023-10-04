import CreepController from "CreepManager";
import Job from "Job";
import JobController from "JobController";
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

const creepController = new CreepController();
const jobController = new JobController();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    if (Game.spawns["Spawn1"]) {
        let spawn = Game.spawns["Spawn1"];
        let controller = spawn.room.controller;
        let room = spawn.room;

        // check if controller needs upgrade
        if (controller) {
            if (controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[controller.level] * 0.8) {
                jobController.add(new Job(controller, "upgrade"));
            }
        }

        // builder jobs
        const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);

        if (constructionSites.length < jobController.jobsByRole("builder")) {
            for(const site in constructionSites) {
                jobController.addOrIgnore(constructionSites[site], "builder")
            }
        }

        // harvester jobs

        const energyTargets = room.find(FIND_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if(energyTargets.length > 0) {
            for(const target in energyTargets) {
                jobController.addOrIgnore(energyTargets[target], "harvester")
            }
        }

        // Room controler, add construction sites, management
        if (controller && controller.level > 1) {
            // place construction sites for extensions
            let x = spawn.pos.x - 2;
            let y = spawn.pos.y;

            let incompleteExtensions = room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: structure => structure.structureType == STRUCTURE_EXTENSION
            });

            let builtExtensions = room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_EXTENSION
            });

            let extensionsCount = incompleteExtensions.length + builtExtensions.length;

            // make construction sites for the amount of available extensions
            if (extensionsCount < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][controller.level]) {
                x = x - extensionsCount;
                room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
            }
        }
    }

    creepController.manage();
});
