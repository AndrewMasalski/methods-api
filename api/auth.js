let express = require('express');
let router = express.Router();

router.route('/login')
    .post(function(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        let found = db.users.findOne({username: username});
        if (found === undefined) {
            res.status(400).send({message: "Пользователь не найден."});
            return;
        }
        if (found.password !== password) {
            res.status(400).send({message: "Неправильный пароль."});
            return;
        }
        found.session = found.session || guid();
        res.send(found);
    });

module.exports = router;

