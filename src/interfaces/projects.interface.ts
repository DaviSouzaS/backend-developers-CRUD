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

interface iTechnology {
    id:NamedCurve
    name: string
}

interface iAddTech {
    projectId: number,
    projectName: string,
    projectDescription: string
    projectEstimatedTime: string,
    projectRepository: string
    projectStartDate: Date
    projectEndDate: Date | null
    technologyId: number
    technologyName: string
}

interface iProjectTechnologies {
    projectId: number,
    technologyName: string,
    id: number
}

type TechnologyResult = QueryResult<iTechnology>

type ProjectsResult = QueryResult<iProject>

type AddTech = QueryResult<iAddTech>

type ProjectTechResult = QueryResult<iProjectTechnologies>

export {
    iProjectRequest,
    iProject,
    ProjectsResult,
    iProjectUpdate,
    TechnologyResult,
    AddTech,
    iProjectTechnologies,
    ProjectTechResult
}