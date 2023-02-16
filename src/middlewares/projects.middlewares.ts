import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import { ProjectsResult } from "../interfaces/projects.interface"
import { DevResult } from "../interfaces/developers.interface"


const checkingIfProjectExists = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const id: number = parseInt(request.params.id);
  
  const queryString: string = `
    SELECT * 
      FROM projects
    WHERE
      id = $1;  
  `;
  
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  
  const projectById: ProjectsResult = await client.query(queryConfig);
  
  if (projectById.rows.length === 0) {
    return response.status(404).json({
      message: `Project not found.`,
    });
  }

  return next();
}

const allProjects = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const queryString: string = `
    SELECT
      *
    FROM
      projects
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  const queryResult: ProjectsResult = await client.query(queryConfig);

  const projectsList = queryResult.rows;

  request.projectsResult = {
    projectsList: projectsList,
  };

  return next();
}

const checkingDevExistence = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const id: number = request.body.developerId

  const querySearchDev: string = `
  SELECT * 
    FROM developers
  WHERE
    id = $1;  
  `;

  const queryConfig: QueryConfig = {
    text: querySearchDev,
    values: [id],
  };

  const devById: DevResult = await client.query(queryConfig);

  if (devById.rows.length === 0) {
    return response.status(404).json({
      message: `Developer with id: ${request.body.developerId} is not exist.`,
    });
  }

  return next()

}

export {
  checkingIfProjectExists,
  allProjects,
  checkingDevExistence
}