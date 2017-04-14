global.db = require('diskdb');
db.connect('./db', ['users', 'tags', 'groups', 'methods']);

global.guid = function(separator) {
    separator = separator || '-';
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + separator + S4() + separator + "4" + S4().substr(0, 3) + separator + S4() + separator + S4() + S4() + S4()).toLowerCase();
};

