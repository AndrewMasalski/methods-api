let _ = require('lodash');
let express = require('express');

let router = express.Router();

function filterMethods(methods, searchParams) {
    // '<span class="highlighted !important;">$&</span>'
    let queryRegex = new RegExp(searchParams.query, 'gi');
    return _.filter(methods, function(m) {
        let matches = [];
        let match;
        if (searchParams.groups) {
            match = _.intersection(m.groups, searchParams.groups).length > 0;
            matches.push(match);
        }
        if (searchParams.tags) {
            match = _.intersection(m.tags, searchParams.tags).length > 0;
            matches.push(match);
        }
        if (searchParams.query) {
            match = queryRegex.test(m.description);
            if (match && searchParams.highlight) {
                m.description = m.description.replace(queryRegex, '<mark>$&</mark>')
            }
            matches.push(match);
        }
        if (searchParams.type) {
            match = (m.type || '').indexOf(searchParams.type) >= 0;
            matches.push(match);
        }
        if (searchParams.year) {
            match = (m.year || '').indexOf(searchParams.year) >= 0;
            matches.push(match);
        }
        return _.every(matches, function(m) { return m });
    });
}

router.route('/search')
    .post(function(req, res) {
        try {
            let allMethods = db.methods.find({});
            let searchParams = req.body;
            let filteredMethods = filterMethods(allMethods, searchParams);

            let groups = db.groups.find();
            let tags = db.tags.find();
            let page = Number(searchParams.page || 1) - 1;
            let pageSize = Number(searchParams.pageSize || 25);
            let start = page * pageSize;
            let results = [];
            for (let i = start; i < start + pageSize && i < filteredMethods.length; i++) {
                let method = filteredMethods[i];
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
                results.push(method);
            }
            let payload = {
                $count: filteredMethods.length,
                results: results
            };
            res.send(payload);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    });

module.exports = router;
