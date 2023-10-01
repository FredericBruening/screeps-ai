class Job {
    id: string
    target: AnyStructure|ConstructionSite
    worker?: Creep
    role: string

    constructor(object: AnyStructure|ConstructionSite, role: string) {
        this.id = "Job" + Game.time + Math.floor(Math.random() * 100)
        this.target = object
        this.role = role
    }
}

export default Job
