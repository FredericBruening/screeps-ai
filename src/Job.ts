class Job {
    room: Room
    target: Structure
    worker: Creep
    role: string

    constructor(room: Room, object: Structure, worker: Creep, role: string) {
        this.room = room
        this.target = object
        this.worker = worker
        this.role = role
    }
}

export default Job
