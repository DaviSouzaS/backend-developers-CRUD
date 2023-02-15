import { Request, Response } from "express"
import format from "pg-format"
import { client } from "../database"
import { ProjectsResult, iProjectUpdate } from "../interfaces/projects.interface"
import { QueryConfig } from "pg"

const createProject = async (request: Request, response: Response): Promise<Response> => {

    const projectsRequest = request.body
    
    const checkingName = Object.keys(projectsRequest).find((item) => {
        return item === "name";
    });
    
    const checkingDescription = Object.keys(projectsRequest).find((item) => {
        return item === "description";
    });

    const checkingEstimatedTime =  Object.keys(projectsRequest).find((item) => {
        return item === "estimatedtime";
    });

    const checkingRepository = Object.keys(projectsRequest).find((item) => {
        return item === "repository";
    });

    const checkingStartDate = Object.keys(projectsRequest).find((item) => {
        return item === "startdate";
    });

    const checkingDeveloperId = Object.keys(projectsRequest).find((item) => {
        return item === "developerId";
    });
    
    if (checkingName === undefined || checkingDescription === undefined || checkingEstimatedTime === undefined || checkingRepository === undefined || checkingStartDate === undefined || checkingDeveloperId === undefined)  {
        return response.status(400).json({
          message: `Missing required keys: ${checkingName === undefined ? "name" : ""}${checkingDescription === undefined ? " description" : ""}${checkingEstimatedTime === undefined ? " estimatedtime" : ""}${checkingRepository === undefined ? " repository" : ""}${checkingStartDate === undefined ? " startdate" : ""}${checkingDeveloperId === undefined ? " developerId" : ""}`
        });
    }

    const requiredKeys: Array<string> = ["name", "description", "estimatedtime", "repository", "startdate", "enddate", "developerId"]

    const requestValues: Array<string> = [projectsRequest.name, projectsRequest.description, projectsRequest.estimatedtime, projectsRequest.repository, projectsRequest.startdate, projectsRequest.enddate, projectsRequest.developerId]

    const queryString: string = format(`
        INSERT INTO
            projects(%I)
        VALUES(%L)
            RETURNING *;
        `,
        requiredKeys,
        requestValues
    )

    const queryResult: ProjectsResult = await client.query(queryString)

    return response.status(201).json(queryResult.rows[0])
}

const readAllProjects = async (request: Request, response: Response): Promise<Response> => {

    // const queryString = `
    // SELECT 
	//     p.*,
	//     t.*
    // FROM 
	//     projects_technologies pt 
    // LEFT JOIN 
	//     projects p ON pt."projectsId" = p."id" 
    // LEFT JOIN 
	//     technologies t ON pt."technologiesId" = t."id";
    // `

    const queryString = `
    SELECT 
	    *
    FROM 
	    projects p ;
    `   

    const queryConfig: QueryConfig = {
        text: queryString
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)

    return response.status(200).json(queryResult.rows)
}

const readProjectsById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 
    // const queryString = `
    // SELECT 
	//     p.*,
	//     t.*
    // FROM 
	//     projects_technologies pt 
    // LEFT JOIN 
	//     projects p ON pt."projectsId" = p."id" 
    // LEFT JOIN 
	//     technologies t ON pt."technologiesId" = t."id"
    // WHERE 
	//     p.id = 1;
    // `

    const queryString = `
    SELECT 
	    *
    FROM 
	    projects p 
    WHERE 
	    id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)

    return response.status(200).json(queryResult.rows[0])
}

const updateProjectById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 

    const updatableColumns: string[] = ["name", "description", "estimatedtime", "repository", "startdate", "enddate", "developerId"]

    let name = request.body.name
    let description = request.body.description
    let estimatedtime = request.body.estimatedTime
    let repository = request.body.repository
    let startdate = request.body.startDate
    let enddate = request.body.endDate
    let developerId = request.body.developerId

    const projects = request.projectsResult.projectsList

    if (name === undefined && description === undefined && estimatedtime === undefined && repository === undefined && startdate === undefined && enddate === undefined && developerId === undefined) {
        return response.status(400).json({
            "message": "At least one of those keys must be send.",
            "keys": updatableColumns
        })
    }

    if (name === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        name = findProject?.name;
    }

    if (description === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        description = findProject?.description;
    }

    if (estimatedtime === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        estimatedtime = findProject?.estimatedtime;
    }

    if (repository === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        repository = findProject?.repository;
    }

    if (startdate === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        startdate = findProject?.startdate;
    }

    if (enddate === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        enddate = findProject?.enddate;
    }

    if (developerId === undefined) {
        const findProject = projects.find((item) => {
          return item.id === id;
        });
        developerId = findProject?.developerId;
    }

    const queryString: string = `
    UPDATE projects
      SET (%I) = ROW(%L)
    WHERE id = $1
      RETURNING *;
    `;
    
  const queryFormat: string = format(queryString, updatableColumns, [
      name,    
      description,
      estimatedtime,
      repository,
      startdate,
      enddate,
      developerId
    ]);

  const queryConfig: QueryConfig = {
    text: queryFormat,
    values: [id],
  };

  const queryResult: ProjectsResult = await client.query(queryConfig);

  const update: iProjectUpdate = queryResult.rows[0];

  return response.status(201).json(update);
}

const deleteProjectById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 

    const queryString: string = `
    DELETE FROM
      projects
    WHERE
      id = $1;  
    `;
  
  const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

  await client.query(queryConfig);

  return response.status(204).send();
}

export {
    createProject,
    readAllProjects, 
    readProjectsById,
    updateProjectById,
    deleteProjectById
}