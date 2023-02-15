import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { iDevRequest, iDev, DevResult, iDevInfosRequest, DevInfosResult, iDevUpdate, iDevInfosUpdate } from "../interfaces/developers.interface";

const createDeveloper = async (request: Request, response: Response): Promise<Response> => {

  const devDataRequest: iDevRequest = request.body;

  const checkingName = Object.keys(devDataRequest).find((item) => {
    return item === "name";
  });

  const checkingEmail = Object.keys(devDataRequest).find((item) => {
    return item === "email";
  });

  if (checkingName === undefined || checkingEmail === undefined) {
    return response.status(400).json({
      message: `Missing required keys: ${
        checkingName === undefined ? "name" : ""
      }${checkingEmail === undefined ? " email" : ""}`,
    });
  }

  const devs = request.devsResult.devList;

  const checkEmailUnique = devs.every((item) => {
    return item.email !== devDataRequest.email;
  });

  if (!checkEmailUnique) {
    return response.status(409).json({
      message: `Email ${request.body.email} already exists.`,
    });
  }

  const devBodyRequest = [devDataRequest.name, devDataRequest.email];

  const queryString: string = `
    INSERT INTO
      developers( name, email)
    VALUES
      ( $1, $2)
    RETURNING *;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: devBodyRequest,
  };

  const queryResult: DevResult = await client.query(queryConfig);
  const newDev: iDev = queryResult.rows[0];

  return response.status(201).json(newDev);
};

const readAllDevelopers = async (request: Request, response: Response): Promise<Response> => {

  const queryString: string = `
  SELECT
    d.*,
    di."developersince",
    di."preferredos"
  FROM 
    developers d
  LEFT JOIN
    developer_infos di ON d."developerinfoid" = di.id;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
  };

  const queryResult: DevResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

const readDeveloperById = async (request: Request, response: Response): Promise<Response> => {

  const id: number = parseInt(request.params.id) 

  const queryString: string = `
  SELECT
    d.*,
    di."developersince",
    di."preferredos"
  FROM 
    developers d
  LEFT JOIN
    developer_infos di ON d."developerinfoid" = di.id
  WHERE 
    d.id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id]
  };

  const queryResult: DevResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

const createDeveloperInfos = async (request: Request, response: Response): Promise<Response> => {

  const devInfosDataRequest: iDevInfosRequest = request.body;
  const devId: number = parseInt(request.params.id);

  const requiredKeys: Array<string> = ["developersince", "preferredos"];
  const devInfoValues: Array<string> = [devInfosDataRequest.developersince, devInfosDataRequest.preferredos];

  const devs = request.devsResult.devList;

  const searchDev = devs.find((item) => {
    item.id === devId
  })

  if (searchDev?.developerinfoid !== null) {
    return response.status(409).json({
      message: `Developer with id ${devId} already has developer information. To edit developer information, use PATCH with /developers/:id/infos`
    })
  }

  if (devInfoValues[0] === undefined || devInfoValues[1] === undefined) {
    return response.status(400).json({
      message: `Missing required keys: ${
        devInfoValues[0] === undefined ? "developersince" : ""} ${devInfoValues[1] === undefined ? "preferredos" : ""}`,
    });
  }

  let queryString: string = format(
   `
    INSERT INTO 
      developer_infos (%I)
    VALUES(%L)
    RETURNING *;
   `,
    requiredKeys,
    devInfoValues
  );

  let queryResult: DevInfosResult = await client.query(queryString);

  queryString = `
    UPDATE 
      developers
    SET
      developerinfoid = $1
    WHERE
      id = $2
    RETURNING *;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [queryResult.rows[0].id, devId],
  };

  await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

const updateDeveloperById = async (request: Request, response: Response): Promise<Response> => {

  const updatableColumns: string[] = ["name", "email"];

  let name = request.body.name;

  let email = request.body.email;

  const id: number = Number(request.params.id);

  const devs = request.devsResult.devList;

  if (name === undefined && email === undefined) {
    return response.status(400).json({
      message: `At least one of those keys must be send.`,
      keys: `[name, email]`,
    });
  }

  if (email === undefined) {
    const findDev = devs.find((item) => {
      return item.id === id;
    });

    email = findDev?.email;
  }

  if (name === undefined) {
    const findDev = devs.find((item) => {
      return item.id === id;
    });

    name = findDev?.name;
  }

  const queryString: string = `
    UPDATE developers
      SET (%I) = ROW(%L)
    WHERE id = $1
      RETURNING *;
    `;
  const queryFormat: string = format(queryString, updatableColumns, [
    name,
    email,
  ]);

  const queryConfig: QueryConfig = {
    text: queryFormat,
    values: [id],
  };

  const queryResult: DevResult = await client.query(queryConfig);

  const update: iDevUpdate = queryResult.rows[0];

  return response.status(201).json(update);
};

const updateDeveloperInfosById = async (request: Request, response: Response): Promise<Response> => {

  const updatableColumns: string[] = ["developersince", "preferredos"];

  let developersince = request.body.developersince;

  let preferredos = request.body.preferredos;

  const id: number = Number(request.params.id);

  const devs = request.devsResult.devList;

  const devInfosList = request.devInfosList.devInfosList;

  if (developersince === undefined && preferredos === undefined) {
    return response.status(400).json({
      message: `At least one of those keys must be send.`,
      keys: `[developerSince, preferredOS]`,
    });
  }

  if (developersince === undefined) {
    const findDev = devInfosList.find((item) => {
      return item.id === id;
    });

    developersince = findDev?.developersince;
  }

  if (preferredos === undefined) {
    const findDev = devInfosList.find((item) => {
      return item.id === id;
    });

    preferredos = findDev?.preferredos;
  }

  const findDev = devs.find((item) => {
    return item.id === id;
  });

  const queryString: string = `
    UPDATE developer_infos
      SET (%I) = ROW(%L)
    WHERE id = $1
      RETURNING *;
  `;

  const queryFormat: string = format(queryString, updatableColumns, [
    developersince,
    preferredos,
  ]);

  const queryConfig: QueryConfig = {
    text: queryFormat,
    values: [findDev?.developerinfoid],
  };

  const queryResult: DevInfosResult = await client.query(queryConfig);

  const update: iDevInfosUpdate = queryResult.rows[0];

  return response.status(201).json(update);
};

const deleteDeveloper = async (request: Request, response: Response) => {
  const id: number = Number(request.params.id)

  const querySearchDev: string = `
  SELECT
    *
  FROM
    developers
  WHERE
    id = $1;  
  `
  
  const queryConfigSearchDev: QueryConfig = {
    text: querySearchDev,
    values: [id],
  }

  const queryResultSearchDev: DevResult = await client.query(queryConfigSearchDev)

  const devInfoId = queryResultSearchDev.rows[0].developerinfoid

  const queryString: string = `
    DELETE FROM
      developer_infos
    WHERE
      id = $1; 
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devInfoId]
  }

  await client.query(queryConfig)

  return response.status(204).send()
};

export {
  createDeveloper,
  readAllDevelopers,
  readDeveloperById,
  createDeveloperInfos,
  updateDeveloperById,
  updateDeveloperInfosById,
  deleteDeveloper,
};
