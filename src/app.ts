import express, { Application } from "express";
import { startDataBase } from "./database";
import { createDeveloper, readAllDevelopers, readDeveloperById, createDeveloperInfos, updateDeveloperById, updateDeveloperInfosById, deleteDeveloper } from "./logic/developers.logic"
import { allDevs, checkingIfTheDevExists, allDevInfos } from "./middlewares/developers.middlewares"

const app: Application = express()
app.use(express.json())

app.post('/developers', allDevs, createDeveloper)

app.post('/developers/:id/infos', checkingIfTheDevExists, createDeveloperInfos)

app.get('/developers', allDevs, readAllDevelopers)

app.get('/developers/:id', checkingIfTheDevExists, readDeveloperById)

app.patch('/developers/:id', checkingIfTheDevExists, allDevs, updateDeveloperById)

app.patch('/developers/:id/infos', allDevs, allDevInfos, checkingIfTheDevExists, updateDeveloperInfosById)

app.delete('/developers/:id', checkingIfTheDevExists, deleteDeveloper)

app.listen(3000, async () => {
    await startDataBase()
    console.log("Server is running!")
}) 
