let _ = require('lodash');
let express = require('express');

let router = express.Router();

function filterMethods(methods, req) {
    return _.filter(methods, function(m) {
        let matches = [];
        let match;
        if (req.query.tags) {
            let tagIds = req.query.tags.split(';');
            match = _.intersection(m.tags, tagIds).length > 0;
            matches.push(match);
        }
        if (req.query.description) {
            let notes = m.notes || '';
            match = m.description.indexOf(req.query.description) >= 0 || notes.indexOf(req.query.description) >= 0;
            matches.push(match);
        }
        if (req.query.type) {
            match = (m.type || '').indexOf(req.query.type) >= 0;
            matches.push(match);
        }
        if (req.query.year) {
            match = (m.year || '').indexOf(req.query.year) >= 0;
            matches.push(match);
        }
        return _.every(matches, function(m) { return m });
    });
}

router.route('/methods')
    .get(function(req, res) {
        try {
            let searchParams = {};
            if (req.query.group) {
                searchParams.group = req.query.group;
            }
            let methods = filterMethods(db.methods.find(searchParams), req);

            let groups = db.groups.find();
            let tags = db.tags.find();
            let skip = Number(req.query.skip || 0);
            let top = Number(req.query.top || 25);
            let query = [];
            for (let i = skip; i < top + skip && i < methods.length; i++) {
                let method = methods[i];
                method.index = i;
                if (!!method.group) {
                    let found = _.find(groups, {_id: method.group});
                    if (!!found) {
                        method.group = found;
                    }
                }
                let tagIds = [];
                _.forEach(method.tags, function(tag) {
                    let found = _.find(tags, {_id: tag});
                    if (!!found) {
                        tagIds.push(found);
                    }
                });
                method.tags = tagIds;
                query.push(method);
            }
            let payload = {
                $count: methods.length,
                results: query
            };
            if (query.length === top && skip !== methods.length) {
                payload.$next = {
                    skip: top + skip,
                    top: top,
                    group: req.query.group
                };
            }
            res.send(payload);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    })
    .post(function(req, res) {
        try {
            let method = req.body;
            if (_.isObject(method.group)) {
                method.group = method.group._id;
            }
            method.tags = _.map(method.tags, function(tag) {
                if (tag._id) {
                    return tag._id;
                } else {
                    let savedTag = db.tags.save(tag);
                    return savedTag._id;
                }
            });
            console.log('saving: ', method);
            let resp = db.methods.save(method);
            res.send(resp);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    });

router.route('/methods/:id')
    .put(function(req, res) {
        try {
            let method = req.body;
            let id = req.params.id;
            if (_.isObject(method.group)) {
                method.group = method.group._id;
            }
            method.tags = _.map(method.tags, function(tag) {
                if (tag._id) {
                    return tag._id;
                } else {
                    let savedTag = db.tags.save(tag);
                    return savedTag._id;
                }
            });
            let resp = db.methods.update({_id: id}, method);
            res.json(resp);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    })

    .get(function(req, res) {
        let id = req.params.id;
        let found = db.methods.findOne({_id: id});
        if (found)
            res.json(found);
        else
            res.status(404).send({message: 'Not found'});

    })

    .delete(function(req, res) {
        db.methods.remove({_id: req.params.id});
        res.sendStatus(204);
    });

module.exports = router;
