const http = require("http");
require("dotenv").config();
const url = require("url");
const PORT = process.env.PORT || 3000;
const jsonOffset = 4;
const fs = require("fs");
let jsonData = require("./users.json");

const server = http.createServer((request, response) => {
  const urlParse = url.parse(request.url, true);
  let token = request.headers.authorization;
  if (token !== "Bearer 12345") {
    response.statusCode = 401;
    response.end("Not authorized");
  } else if (urlParse.pathname === "/api/users" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(readUsers());
  } else if (checkUsersPath(urlParse.pathname) && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    let userId = parseUserIdFromUrl(urlParse.pathname);
    response.end(readUser(userId));
  } else if (urlParse.pathname === "/api/users" && request.method === "POST") {
    request.on("data", (data) => {
      const parsedData = JSON.parse(data);
      writeUser(parsedData);
    });
    response.writeHead(201, { "Content-Type": "application/json" });
    response.end();
  } else if (checkUsersPath(urlParse.pathname) && request.method === "PATCH") {
    request.on("data", (data) => {
      let userId = parseUserIdFromUrl(urlParse.pathname);
      const parsedData = JSON.parse(data);
      editUser(userId, parsedData);
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end();
  } else if (checkUsersPath(urlParse.pathname) && request.method === "DELETE") {
    let userId = parseUserIdFromUrl(urlParse.pathname);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(deleteUser(userId));
  } else {
    const message = { message: "Invalid url" };
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify(message, null, jsonOffset));
  }
});

server.listen(PORT, () => {
  console.log(`Server started on :${PORT}`);
});

function readUsers() {
  return JSON.stringify(jsonData, null, jsonOffset);
}

function writeUser(user) {
  user.id = parseInt(Math.random().toString(10).slice(2));
  jsonData.push(user);
  let data = JSON.stringify(jsonData, null, jsonOffset);
  fs.writeFileSync("./users.json", data);
}

function editUser(id, user) {
  user.id = id;
  let newArray = jsonData.filter((item) => item.id !== id);
  newArray.push(user);
  fs.writeFileSync("./users.json", JSON.stringify(newArray, null, jsonOffset));
}

function deleteUser(userId) {
  let newArray = jsonData.filter((user) => user.id !== userId);
  fs.writeFileSync("./users.json", JSON.stringify(newArray, null, jsonOffset));
}

function readUser(userId) {
  return JSON.stringify(jsonData.filter((user) => user.id == userId), null, jsonOffset);
}

function checkUsersPath(pathname) {
  return new RegExp("^/api/users/[0-9]+$").test(pathname);
}

function parseUserIdFromUrl(pathname) {
  return parseInt(pathname.split("/").splice(-1));
}
