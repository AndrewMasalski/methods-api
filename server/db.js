global.db = require('diskdb');
db.connect('./db', ['users', 'tags', 'groups', 'methods']);
