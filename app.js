let express = require('express');
let bodyParser = require('body-parser');
require('./db');
let app = express();

if (process.argv.cors) {
	app.use(require('./cors'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/auth', require('./api/auth'));
app.use('/api', require('./api/methods'));
app.use('/api', require('./api/tags'));
let groups = require('./api/groups');
app.use('/api', groups);
let port = process.env.PORT || 30003;
app.listen(port, function() {
    console.log('api server is listening on port: ' + port)
});


