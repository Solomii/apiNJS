const http = require("http");
require('dotenv').config();
const url = require('url');
const PORT = process.env.PORT || 3000;


const server = http.createServer(
  (request, response) => {
    const urlParse = url.parse(request.url, true);

    if (urlParse.pathname === '/api/users' && request.method === "GET") {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(readJsonFile());
    }
    else if ((new RegExp('^\/api\/users\/[0-9]+$').test(urlParse.pathname)) && request.method === 'GET') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
    
      let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
      response.end(readUser(userParseId));

    } else if (urlParse.pathname === '/api/users' && request.method === "POST") {
      request.on('data', data => {
        const jsonData = JSON.parse(data);
        writeUserToFile(jsonData);
      })
      response.writeHead(201, { 'Content-Type': 'application/json' });
       response.end();
    } else if ((new RegExp('^\/api\/users\/[0-9]+$').test(urlParse.pathname)) && request.method === 'PATCH') {
      request.on('data', data => {
        let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
        const jsonData = JSON.parse(data);
        editUser(userParseId, jsonData);
      })
      response.writeHead(200, { 'Content-Type': 'application/json' });
       response.end();
    } else if ((new RegExp('^\/api\/users\/[0-9]+$').test(urlParse.pathname)) && request.method === 'DELETE') {
      let userParseId = parseInt(urlParse.pathname.split('/').splice(-1));
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(deleteUserFromJson(userParseId));
    }
    else {
      const message = { message: 'Invalid url' };
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(message, null, 2));
    }

  });

server.listen( PORT, () => {
  console.log(`Server started on :${PORT}`);

});


function readJsonFile() {
  let jsonData = require('./users.json');
  return JSON.stringify(jsonData, null, 4);
}




function writeUserToFile(user) {
  const fs = require('fs');
  let jsonData = require('./users.json');
  user.id = parseInt(Math.random().toString(10).slice(2));
  jsonData.push(user);
  let data = JSON.stringify(jsonData, null, 4);
  fs.writeFileSync('./users.json', data);
}


function editUser(id, user) {
  const fs = require('fs');
  let jsonData = require('./users.json');
  user.id = id;
  let newArray = jsonData.filter(item => item.id !== id);
  newArray.push(user);
  fs.writeFileSync('./users.json', JSON.stringify(newArray, null, 4));
}


function deleteUserFromJson(userId) {
  const fs = require('fs');
  let jsonData = require('./users.json');
  let newArray = jsonData.filter(user => user.id !== userId);
  fs.writeFileSync('./users.json',JSON.stringify(newArray, null, 4));

}


function readUser(userId) {
  const fs = require('fs');
  let jsonData = require('./users.json');
  return JSON.stringify(jsonData.filter(user => user.id == userId), null, 4);
}
