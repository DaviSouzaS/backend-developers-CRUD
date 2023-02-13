import * as express from "express"
import { iDev, iDevComplete } from "../../interfaces"

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

        }
    }
}