let express = require('express');
let router = express.Router();

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

module.exports = router;

