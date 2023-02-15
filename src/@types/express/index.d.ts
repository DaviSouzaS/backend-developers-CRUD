import * as express from "express";
import { iDev, iDevComplete } from "../../interfaces/developers.interface";
import { iProject } from "../../interfaces/projects.interface";

declare global {
  namespace Express {
    interface Request {
      devsResult: {
        devList: Array<iDev>
      }

      devById: {
        devById: Array<iDev>
      }

      devInfosList: {
        devInfosList: Array<iDevComplete>
      }

      projectsResult: {
        projectsList: Array<iProject>
      }

    }
  }
}
