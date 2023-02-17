import { Request, Response } from "express"
import format from "pg-format"
import { client } from "../database"
import { ProjectsResult, iProjectUpdate, TechnologyResult, AddTech, ProjectTechResult, iProjectRequest } from "../interfaces/projects.interface"
import { QueryConfig } from "pg"

const createProject = async (request: Request, response: Response): Promise<Response> => {

    const projectsRequest: iProjectRequest = request.body
    
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

    const requestValues = [projectsRequest.name, projectsRequest.description, projectsRequest.estimatedtime, projectsRequest.repository, projectsRequest.startdate, projectsRequest.enddate, projectsRequest.developerId]

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

    const queryString = `
    SELECT 
	    p.id "projectId",
	    p.name "projectName",
	    p.description "projectDescription",
	    p.estimatedtime "projectEstimatedTime",
	    p.repository "projectRepository",
	    p.startdate "projectStartDate",
	    p.enddate "projectEndDate",
        p."developerId" "projectDeveloperID",
	    t.id "technologyId",
	    t.name "technologyName"
    FROM 
	    projects_technologies pt 
    FULL JOIN 
	    projects p ON pt."projectsId" = p."id" 
    LEFT JOIN 
	    technologies t ON pt."technologiesId" = t."id";
    `

    const queryConfig: QueryConfig = {
        text: queryString
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)

    return response.status(200).json(queryResult.rows)
}

const readProjectsById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 
    
    const queryString: string = `
    SELECT 
	    p.id "projectId",
	    p.name "projectName",
	    p.description "projectDescription",
	    p.estimatedtime "projectEstimatedTime",
	    p.repository "projectRepository",
	    p.startdate "projectStartDate",
	    p.enddate "projectEndDate",
        p."developerId" "projectDeveloperID",
	    t.id "technologyId",
	    t.name "technologyName"
    FROM 
	    projects_technologies pt 
    FULL JOIN 
	    projects p ON pt."projectsId" = p."id" 
    LEFT JOIN 
	    technologies t ON pt."technologiesId" = t."id"
    WHERE
        p.id = $1 ;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult: ProjectsResult = await client.query(queryConfig)

    return response.status(200).json(queryResult.rows)
}

const updateProjectById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 

    const updatableColumns: string[] = ["name", "description", "estimatedtime", "repository", "startdate", "enddate", "developerId"]

    let name: string | undefined = request.body.name

    let description: string | undefined = request.body.description

    let estimatedtime: string | undefined = request.body.estimatedTime

    let repository: string | undefined = request.body.repository

    let startdate: Date | undefined= request.body.startDate

    let enddate: Date | null | undefined = request.body.endDate

    let developerId: number | undefined = request.body.developerId

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

const readAllDeveloperProjects = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id)

    const queryString = `
    SELECT 
	    d.id "developerID",
	    d.name "developerName",
	    d.email "developerEmail",
	    d.developerinfoid "developerInfoID",
	    p.id "projectId",
	    p.name "projectName",
	    p.description "projectDescription",
	    p.estimatedtime "projectEstimatedTime",
	    p.repository "projectRepository",
	    p.startdate "projectStartDate",
	    p.enddate "projectEndDate",
	    t.id "technologyId",
	    t.name "technologyName"
    FROM 
	    projects_technologies pt 
    FULL JOIN 
	    projects p ON pt."projectsId" = p."id" 
    LEFT JOIN
	    developers d ON p.id = d.id 
    LEFT JOIN 	
	    developer_infos di ON d.developerinfoid = di.id 
    LEFT JOIN 
	    technologies t ON pt."technologiesId" = t."id"
    WHERE 
	    d.id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult = await client.query(queryConfig)

    return response.status(200).json(queryResult.rows)
}

const addTechInProjectById = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id)

    const techName: string = request.body.name

    const allTechs = ["JavaScript", "Python", "React", "Express.js", "HTML", "CSS", "Django", "PostgreSQL", "MongoDB"]

    const checkTech = allTechs.every((item) => {
        return item !== techName
    })

    if(checkTech) {
        return response.status(400).json({
            message: `the technology ${techName} is not supported.`,
            options_supported: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]
        })
    }

    const queryTech: string = `
    SELECT
        *
    FROM 
        technologies t
    WHERE
        t.name = $1
    `

    const queryConfigTech: QueryConfig = {
        text: queryTech,
        values: [techName]
    }

    const queryResultTech: TechnologyResult = await client.query(queryConfigTech)

    const techId = queryResultTech.rows[0].id

    const date: Date = new Date

    const queryString: string = `
    INSERT INTO
        projects_technologies ( "projectsId", "technologiesId", "addedin"  )
    VALUES
        ( $1, $2, $3)
    RETURNING *;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id, techId, date]
    }

    const queryProjectTech: string = `
    SELECT 
	    p.id "projectId",
	    p.name "projectName",
	    p.description "projectDescription",
	    p.estimatedtime "projectEstimatedTime",
	    p.repository "projectRepository",
	    p.startdate "projectStartDate",
	    p.enddate "projectEndDate",
	    t.id "technologyId",
	    t.name "technologyName"
    FROM 
	    projects_technologies pt 
    LEFT JOIN 
	    projects p ON pt."projectsId" = p."id" 
    LEFT JOIN 
	    technologies t ON pt."technologiesId" = t."id"
    WHERE
        p.id = $1;
    `

    const queryConfigProjectTech: QueryConfig = {
        text: queryProjectTech,
        values: [id]
    }

    const queryResultProjectTech: AddTech = await client.query(queryConfigProjectTech)

    const checkIfTechExist = queryResultProjectTech.rows.every((item) => {
        return item.technologyName !== techName
    })

    if (!checkIfTechExist) {
        return response.status(409).json({
            message: `${techName} technology already exists in this project`
        })
    }

    await client.query(queryConfig)

    const queryResultSearchProject: AddTech = await client.query(queryConfigProjectTech)

    const newTech = queryResultSearchProject.rows.find((item) => {
        return item.technologyName === techName
    })

    return response.status(201).json(newTech)
}

const deleteOneTechInProject =  async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id) 
    
    const name: string = request.params.name

    const queryString: string = `
    SELECT 
        p.id "projectId",
        t.name "technologyName",
        pt.id 
    FROM 
        projects_technologies pt 
    FULL JOIN 
        projects p ON pt."projectsId" = p."id" 
    LEFT JOIN 
        technologies t ON pt."technologiesId" = t."id"
    WHERE 
        p.id = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    const searchProject: ProjectTechResult = await client.query(queryConfig)

    const allTechs = ["JavaScript", "Python", "React", "Express.js", "HTML", "CSS", "Django", "PostgreSQL", "MongoDB"]

    const checkTech = allTechs.every((item) => {
        return item !== name
    })

    if(checkTech) {
        return response.status(400).json({
            message: `the technology ${name} is not supported.`,
            options_supported: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]
        })
    }

    const checkName = searchProject.rows.find((item) => {
        return item.technologyName === name
    })

    if (checkName === undefined) {
        return response.status(404).json({
            message: `Technology ${name} not found on this Project.`
        })
    }

    const queryDelete: string = `
        DELETE FROM
            projects_technologies
        WHERE
            id = $1; 
    `

    const queryConfigDelete: QueryConfig = {
        text: queryDelete,
        values: [checkName.id]
    }

    await client.query(queryConfigDelete)

    return response.status(204).send()
}

export {
    createProject,
    readAllProjects, 
    readProjectsById,
    updateProjectById,
    deleteProjectById,
    readAllDeveloperProjects,
    addTechInProjectById,
    deleteOneTechInProject
}