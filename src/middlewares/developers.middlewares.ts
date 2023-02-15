import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import { DevResult, DevCompleteResult } from "../interfaces/developers.interface";

const allDevs = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const queryString: string = `
    SELECT
      *
    FROM
      developers
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  const queryResult: DevResult = await client.query(queryConfig);

  const devList = queryResult.rows;

  request.devsResult = {
    devList: devList,
  };

  return next();
};

const checkingIfTheDevExists = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT * 
      FROM developers
    WHERE
      id = $1;  
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const devById = await client.query(queryConfig);

  if (devById.rows.length === 0) {
    return response.status(404).json({
      message: `Developer not found.`,
    });
  }

  request.devById = {
    devById: devById.rows,
  };

  next();
};

const allDevInfos = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  const queryString = `
    SELECT
      dv.*,
      di.developersince,
      di.preferredos
    FROM 
      developers dv
    JOIN
      developer_infos di ON dv.developerinfoid = di.id
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  const queryResult: DevCompleteResult = await client.query(queryConfig);

  const devInfosList = queryResult.rows;

  request.devInfosList = {
    devInfosList: devInfosList,
  };

  next();
};

export { allDevs, checkingIfTheDevExists, allDevInfos };
