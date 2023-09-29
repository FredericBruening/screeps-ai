const builder = {
    findStructures(creep: Creep) {
        return creep.room.find(FIND_CONSTRUCTION_SITES)
    },

    run(creep: Creep) {
        if (creep.memory.ready && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.ready = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.ready && creep.store.getFreeCapacity() == 0) {
            creep.memory.ready = true;
            creep.say("🚧 build");
        }

        if (creep.memory.ready) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
                }
            } else {
                let spawn = creep.room.find(FIND_MY_SPAWNS)
                let idlePosition = new RoomPosition(spawn[0].pos.x + 5, spawn[0].pos.y + 5, spawn[0].room.name)
                creep.moveTo(idlePosition)
            }
        } else {
            let sources = creep.room.find(FIND_SOURCES);
            let result = creep.harvest(sources[0])
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    }
}

export default builder
