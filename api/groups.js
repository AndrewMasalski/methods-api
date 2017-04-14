var _ = require('lodash');
let express = require('express');

let router = express.Router();

router.route('/groups')
    .get(function(req, res) {
        let methods = db.methods.find();
        let groups = db.groups.find();
        _.forEach(groups, function(gr) {
            gr.count = _.countBy(methods, {group: gr._id}).true || 0;
        });
        res.send({ results: groups });
    })

    .post(function(req, res) {
        let group = {name: req.body.name};
        console.log('adding group: ', group);
        let resp = db.groups.save(group);
        group.count = 0;
        res.send(resp);
    });

router.route('/groups/:id')
    .put(function(req, res) {
        let id = req.params.id;
        let group = {id: id, name: req.body.name};
        let resp = db.groups.update({_id: id}, group);
        res.json(resp);
    })

    .get(function(req, res) {
        let id = req.params.id;
        let found = db.groups.findOne({_id: id});
        res.json(found);
    })

    .delete(function(req, res) {
        let id = req.params.id;
        db.groups.remove({_id: id});
        res.sendStatus(204);
    });

module.exports = router;
