#!/usr/bin/node

const http = require("http");
const fs = require("fs");
const node_static = require("node-static");

console.log("#Init Web Server#");



let public_files = new(node_static.Server)("pub");

http.createServer((request, response)=> {
	console.log(request.url);
	public_files.serve(request, response);
}).listen(8080);
