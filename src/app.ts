import express, { Application } from "express";
import { startDataBase } from "./database";
import { createDeveloper, readAllDevelopers, readDeveloperById, createDeveloperInfos, updateDeveloperById, updateDeveloperInfosById, deleteDeveloper } from "./logic/developers.logic"
import { createProject, readAllProjects, readProjectsById, deleteProjectById, updateProjectById, addTechInProjectById, readAllDeveloperProjects, deleteOneTechInProject }  from "./logic/projects.logic"
import { allDevs, checkingIfTheDevExists, allDevInfos } from "./middlewares/developers.middlewares"
import { checkingIfProjectExists, allProjects, checkingDevExistence } from "./middlewares/projects.middlewares"

const app: Application = express()
app.use(express.json())

app.post('/developers', allDevs, createDeveloper)

app.post('/developers/:id/infos', checkingIfTheDevExists, allDevs, createDeveloperInfos)

app.get('/developers', allDevs, readAllDevelopers)

app.get('/developers/:id', checkingIfTheDevExists, readDeveloperById)

app.patch('/developers/:id', checkingIfTheDevExists, allDevs, updateDeveloperById)

app.patch('/developers/:id/infos', allDevs, allDevInfos, checkingIfTheDevExists, updateDeveloperInfosById)

app.delete('/developers/:id', checkingIfTheDevExists, deleteDeveloper)

app.post('/projects', checkingDevExistence, createProject)

app.get('/projects', readAllProjects)

app.get('/projects/:id', checkingIfProjectExists, readProjectsById)

app.patch('/projects/:id', allProjects, checkingIfProjectExists, checkingDevExistence, updateProjectById)

app.delete('/projects/:id', checkingIfProjectExists, deleteProjectById)

app.get('/developers/:id/projects', checkingIfTheDevExists, readAllDeveloperProjects)

app.post('/projects/:id/technologies', checkingIfProjectExists, addTechInProjectById)

app.delete('/projects/:id/technologies/:name', checkingIfProjectExists, deleteOneTechInProject)

app.listen(3000, async () => {
    await startDataBase()
    console.log("Server is running!")
}) 
