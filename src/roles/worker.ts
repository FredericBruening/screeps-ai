const worker = {
    findEnergySource(creep: Creep) {
        return creep.room.find(FIND_SOURCES);
    },
    hungryTargets(creep: Creep) {
        return creep.room.find(FIND_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });
    },
    collectEnergy(creep: Creep) {
        if (creep.memory.ready) return;

        const sources = this.findEnergySource(creep);

        if (creep.store.getFreeCapacity() > 0) {
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }

        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.ready = true;
        }
    },
    feed(creep: Creep, targets: Array<Structure>) {
        // transfer energy to hungry targets
        for (const name of targets) {
            if (creep.transfer(name, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(name);
            }
        }
    },
    upgrade(creep: Creep) {
        const controller = creep.room.controller;

        if (controller !== undefined) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
    },
    run(creep: Creep) {
        // if on a job continue with process until job is finished

        // collect enery
            // primary requirement for any job
        this.collectEnergy(creep);

        // once full check for jobs or go to idle position
        if (creep.memory.ready) {
            let hungryTargets = this.hungryTargets(creep);

            if (hungryTargets.length > 0) {
                this.feed(creep, hungryTargets);
            } else {
                this.upgrade(creep);
            }

            if (creep.store.getUsedCapacity() == 0) {
                creep.memory.ready = false;
            }
        }
    }
};

export default worker;
