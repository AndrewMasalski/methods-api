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

router.route('/users')
    .get(function(req, res) {
        res.send({results: db.users.find()});
    })

    .post(function(req, res) {
        let method = req.body;
        console.log('saving: ', method);
        let resp = db.users.save(method);
        res.send(resp);
    });

router.route('/users/:id')
    .put(function(req, res) {
        let id = req.params.id;
        let resp = db.users.update({_id: id}, req.body);
        res.json(resp);
    })

    .get(function(req, res) {
        let id = req.params.id;
        let found = db.users.findOne({_id: id});
        res.json(found);
    })

    .delete(function(req, res) {
        let id = req.params.id;
        db.users.remove({_id: id});
        res.sendStatus(204);
    });


function guid(separator) {
    separator = separator || '-';
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + separator + S4() + separator + "4" + S4().substr(0, 3) + separator + S4() + separator + S4() + S4() + S4()).toLowerCase();
}

module.exports = router;

