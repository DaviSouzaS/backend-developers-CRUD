import { QueryResult } from "pg"

interface iProjectRequest {
    name: string,
    description: string,
    estimatedtime: string,
    repository: string,
    startdate: Date,
    enddate?: Date | null,
    developerId: number
}

interface iProject extends iProjectRequest {
    id: number
}

interface iProjectUpdate {
    name?: string,
    description?: string,
    estimatedtime?: string,
    repository?: string,
    startdate?: Date,
    enddate?: Date | null,
    developerId?: number
}


type ProjectsResult = QueryResult<iProject>

export {
    iProjectRequest,
    iProject,
    ProjectsResult,
    iProjectUpdate
}