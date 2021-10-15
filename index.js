const http = require("http");
require('dotenv').config();
const url = require('url');
const PORT = process.env.PORT || 3000;
const offset = 4;
const fs = require('fs');
let jsonData = require('./users.json');

const server = http.createServer(
  (request, response) => {
    const urlParse = url.parse(request.url, true);
    let token = request.headers.authorization;
    if (token !== "Bearer 12345") {
       response.statusCode = 401;
       response.end('Missing Authorization Header')
    }  else if (urlParse.pathname === '/api/users' && request.method === "GET") {
       response.writeHead(200, { 'Content-Type': 'application/json' });
       response.end(readJsonFile());
    }  else if ( checkPath(urlParse.pathname) && request.method === 'GET') {
       response.writeHead(200, { 'Content-Type': 'application/json' });
       let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
       response.end(readUser(userParseId));
    }  else if (urlParse.pathname === '/api/users' && request.method === "POST") {
      request.on('data', data => {
        const parseData = JSON.parse(data);
        writeUserToFile(parseData);
      });
      response.writeHead(201, { 'Content-Type': 'application/json' });
       response.end();
    } else if (checkPath(urlParse.pathname) && request.method === 'PATCH') {
      request.on('data', data => {
        let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
        const parseData = JSON.parse(data);
        editUser(userParseId, parseData);
      });
      response.writeHead(200, { 'Content-Type': 'application/json' });
       response.end();
    } else if (checkPath(urlParse.pathname) && request.method === 'DELETE') {
      let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(deleteUserFromJson(userParseId));
    } else {
      const message = { message: 'Invalid url' };
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(message, null, offset));
    }
  });

server.listen( PORT, () => {
  console.log(`Server started on :${PORT}`);
});

function readJsonFile() {
  return JSON.stringify(jsonData, null, offset);
};

function writeUserToFile(user) { 
  user.id = parseInt(Math.random().toString(10).slice(2));
  jsonData.push(user);
  let data = JSON.stringify(jsonData, null, offset);
  fs.writeFileSync('./users.json', data);
};

function editUser(id, user) {
  user.id = id;
  let newArray = jsonData.filter(item => item.id !== id);
  newArray.push(user);
  fs.writeFileSync('./users.json', JSON.stringify(newArray, null, offset));
};

function deleteUserFromJson(userId) {
  let newArray = jsonData.filter(user => user.id !== userId);
  fs.writeFileSync('./users.json',JSON.stringify(newArray, null, offset));
};

function readUser(userId) {
  return JSON.stringify(jsonData.filter(user => user.id == userId), null, offset);
};

function checkPath(pathname) {
  return new RegExp('^\/api\/users\/[0-9]+$').test(pathname);
};