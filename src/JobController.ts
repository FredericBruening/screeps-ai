import Job from "Job"

class JobController {
    jobs: Array<Job>

    constructor() {
        this.jobs = []
    }

    add(job: Job) {
        this.jobs.push(job)
    }

    addOrIgnore(structure: AnyStructure|ConstructionSite, role: string) {
        const activeJob = this.jobs.find(job => job.target.id === structure.id)

        if(activeJob) {
            return
        }

        this.add(new Job(structure, role))
    }

    finish(job: Job) {
       // remove from active jobs array
       this.jobs.splice(
            this.jobs.findIndex(t => t.id === job.id),
            1
       )
    }

    jobsByRole(role: string) {
        return this.jobs.reduce((count, job) => job.role === role ? count++ : count, 0)
    }
}

export default JobController
