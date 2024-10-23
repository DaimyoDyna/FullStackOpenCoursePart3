const express = require('express')
const app = express()
let data = require('./db.json')
const fs = require('fs')
const cors = require('cors')

app.use(express.json()) //crucial for the post request perhaps
app.use(cors())
app.use(express.static('dist'))

const baseURL = 'https://phonebookbackend-yyys.onrender.com/api/persons'

//morgan middleware:
const morgan = require('morgan')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
morgan.token('body', function (request, response) { 
  return JSON.stringify(request.body) 
})

app.get(baseURL, (request, response) => {
  response.end(JSON.stringify(data))
})

app.get('/info', (request, response) => { //info page for ex3.2
  const entryCount = data.length //number of people in the database
  const time = new Date()
  response.end(`<p>Phonebook has info for ${entryCount} people<br />
    ${time}</p>`)
})

app.get(`${baseURL}/:id`, (request, response) => { //single person data view for ex3.3
  const person = data.find(person => person.id === request.params.id)
  if (person) { //
    response.json(person)
  } else { //error handling
    response.status(400).send({error: `person not found with ID ${request.params.id}`})
  }
})

app.delete(`${baseURL}/:id`, (request, response) => {
  const id = request.params.id
  //console.log(id)
  const newData = data.filter(person => person.id !== id)
  //console.log(newData)
  //'null, 2' makes the new JSON pretty-printed. 204 is same as 200, but no return data:
  fs.writeFile('./db.json', JSON.stringify(newData, null, 2), (err) => {
    if (err) {
      return response.status(500).send({error: `Failed to delete person`})
    }
    response.status(204).end()
  })
})

app.post(baseURL, (request, response) => {
  //add a person with certain characteristics to the database
  //console.log(request.body.name)
  const newPerson = {"id": Math.floor(Math.random() * 99999).toString(), "name": request.body.name, "number": request.body.number}
  //console.log(newPerson)
  const duplicate = data.find(person => person.name === request.body.name)
  //console.log(duplicate)
  if (duplicate) { //in case the name is already in use
    response.status(400).send({error: `person already found with name ${request.body.name}`})
  } else if (!request.body.name || !request.body.number) { //in case of missing data
    response.status(400).send({error: `name or number missing from parameters`})
  } else {
    const newData = [...data, newPerson] //adds the requested person to the local data
    fs.writeFile('./db.json', JSON.stringify(newData, null, 2), (err) => { //overwrites server with the local data
      if (err) {
        return response.status(500).send({error: `Failed to add person`})
      }
      response.status(204).end() //it seems some kind of response always has to be returned
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)