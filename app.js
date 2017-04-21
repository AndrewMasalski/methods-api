let express = require('express');
let bodyParser = require('body-parser');
require('./db');
let app = express();

let args = process.argv.slice(2);
if (args.indexOf('cors') >= 0) {
	app.use(require('./cors'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/auth', require('./api/auth'));
app.use('/urm', require('./api/users'));
app.use('/api', require('./api/methods'));
app.use('/api', require('./api/tags'));
app.use('/api', require('./api/search'));
app.use('/api', require('./api/groups'));
let port = process.env.PORT || 30003;
app.listen(port, function() {
    console.log('api server is listening on port: ' + port)
});


