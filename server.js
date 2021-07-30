require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('authorization/error-handler');
//app.use(cors());
app.use(cors({ origin: 'http://localhost:3000' , credentials :  true,  methods: 'GET,PUT,POST,OPTIONS', allowedHeaders: 'Content-Type,Authorization' }));

/*var corsOptions = {
    origin: 'http://localhost:5000',
    optionsSuccessStatus: 200
};*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(cors(corsOptions));
///app.use(cors({ origin: 'http://localhost:5000' }));


// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Server listening on port ' + port));