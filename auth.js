let basicAuth = require('express-basic-auth');

let users = {};
db.users.find().forEach(function(user) {
    users[user.username] = user.password;
});

function getUnauthorizedResponse(req) {
    return {message: 'неверное имя пользователя или пароль'};
}

module.exports = {
    basic: function() {
        return basicAuth({
            users: users,
            unauthorizedResponse: getUnauthorizedResponse
        })
    }
};