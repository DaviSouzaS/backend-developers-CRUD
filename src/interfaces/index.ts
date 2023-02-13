import { QueryResult } from "pg"

interface iDevRequest {
    name: string,
    email: string,
}

interface iDev extends iDevRequest {
    id: number
    developerinfoid?: number | null
}

interface iDevInfosRequest {
    developersince: string,
    preferredos: string
}

interface iDevInfos extends iDevInfosRequest{
    id: number
}

interface iDevUpdate {
    name?: string,
    email?: string,
}

interface iDevInfosUpdate {
    developersince?: string,
    preferredos?: string
}

interface iDevComplete {
    id: number,
    name: string,
    email: string,
    developerinfoid: number,
    developersince: Date,
    preferredos: string
}

type DevResult = QueryResult<iDev>

type DevInfosResult = QueryResult<iDevInfos>

type DevCompleteResult = QueryResult<iDevComplete>

export { 
    iDevRequest, 
    iDev, 
    DevResult, 
    iDevInfosRequest, 
    iDevInfos, 
    DevInfosResult, 
    iDevUpdate, 
    iDevInfosUpdate, 
    iDevComplete,
    DevCompleteResult 
}