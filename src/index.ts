require('dotenv').config()
import express = require("express");
import { SocketHandler } from './sockets/handler.socket';

const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require('path');
const ioServer = require('socket.io');


console.log("Initialising backend...");

/*_____________initialization_______________*/
var app: express.Application = express();
if (!process.env.PORT) {
    console.log("Port not specified!");
    process.exit(1);
}



console.log("Listening on port " + process.env.PORT);

//CORS error handling
app.use(cors());

/*___________imported middleware_____________*/
//logging
app.use(morgan("dev"));

//data decoding
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

// catch the not handled requests
app.use((req, res, next) => {
	const error = new Error("Not found");
	next(error);
});

//handles errors from other parts of the api (such as database errors)
app.use((error: any, req: any, res: any, next: any) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});
const server  = app.listen(process.env.PORT);
// CREATE SOCKET SERVER
const io = ioServer(server);
io.set('origins', '*:*');
SocketHandler.init(io);

console.log("Backend successfully initialised!");