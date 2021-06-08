const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({ error: "User Account Already Exist!" })
  }

  users.push({
    id: uuidv4,
    name,
    username,
    todo: []
  })

  return response.status(201).send();

});

app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todo)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title , deadline } = request.body;

  const { user } = request;

  const toDoOperation = {
    title,
    id: uuidv4(),
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todo.push(toDoOperation);

  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const toDoId = request.params;

  const todo = user.todo.filter((toDo) => toDo.id == toDoId.id);


  if(todo.length < 1) {
    return response.status(400).json({ error: "todo not exists!"})
  } else {
    todo[0].title = title;
    todo[0].deadline = new Date(deadline);
  }

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  // const toDoId = request.params[0];
  // const toDoStatus = request.params[1];
  const { user } = request;

  console.log(request.params)

  // const todo = user.todo.filter((toDo) => toDo.id == toDoId.id);

  // if(todo.length < 1) {
  //   return response.status(400).json({ error: "todo not exists!"})
  // } else {
  //   if(toDoStatus === done) {
  //     todo[0].done = true;
  //   }
  // }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const toDoId = request.params;

  const todo = user.todo.filter((toDo) => toDo.id == toDoId.id);

  user.todo.splice(todo, 1);

  return response.status(200).send();

});

module.exports = app;