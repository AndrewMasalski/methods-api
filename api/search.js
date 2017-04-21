let _ = require('lodash');
let express = require('express');

let router = express.Router();

router.route('/search')
    .post(function(req, res) {
        try {
            let allMethods = db.methods.find({});
            let searchParams = req.body;
            searchParams.filters = searchParams.filters || {};
            searchParams.filters.groups = searchParams.filters.groups || [];
            searchParams.filters.tags = searchParams.filters.tags || [];
            let filteredMethods = filterMethods(allMethods, searchParams);
            let groups = _.transform(db.groups.find(), function(result, value) {result[value._id] = value;}, {});
            let tags = _.transform(db.tags.find(), function(result, value) {result[value._id] = value;}, {});

            let resultGroups = {};
            let resultTags = {};
            _.forEach(filteredMethods, function(method){
                if (method.group) {
                    if (!resultGroups[method.group]) {
                        resultGroups[method.group] = groups[method.group];
                        resultGroups[method.group].count = 0;
                    }
                    resultGroups[method.group].count++;
                }
                _.forEach(method.tags, function(tagId) {
                    if (tags[tagId]) {
                        if (!resultTags[tagId]) {
                            resultTags[tagId] = tags[tagId];
                            resultTags[tagId].count = 0;
                        }
                        resultTags[tagId].count++;
                    }
                });
            });
            _.forEach(resultGroups, function(group) {
                if (_.indexOf(searchParams.filters.groups, group._id) >= 0) {
                    group.checked = true;
                }
            });
            _.forEach(resultTags, function(tag) {
                if (_.indexOf(searchParams.filters.tags, tag._id) >= 0) {
                    tag.checked = true;
                }
            });
            let filters = {
                groups: _.map(resultGroups),
                tags: _.map(resultTags)
            };

            let page = Number(searchParams.page || 1) - 1;
            let pageSize = Number(searchParams.pageSize || 25);
            let start = page * pageSize;
            let results = [];

            for (let i = start; i < start + pageSize && i < filteredMethods.length; i++) {
                let method = filteredMethods[i];
                method.index = i;
                method.group = groups[method.group];
                let tagIds = [];
                _.forEach(method.tags, function(tagId) {
                    if (tags[tagId]) {
                        tagIds.push(tags[tagId]);
                    }
                });
                method.tags = tagIds;
                results.push(method);
            }
            let payload = {
                $count: filteredMethods.length,
                results: results,
                filters: filters
            };
            res.send(payload);
        } catch (e) {
            res.status(500).send({message: e.message});
        }
    });

module.exports = router;

function filterMethods(methods, searchParams) {
    // '<span class="highlighted !important;">$&</span>'
    let queryRegex = new RegExp(searchParams.query, 'gi');
    return _.filter(methods, function(m) {
        let matches = [];
        let match;
        if (searchParams.filters.groups.length > 0) {
            match = _.intersection([m.group], searchParams.filters.groups).length > 0;
            matches.push(match);
        }
        if (searchParams.filters.tags.length > 0) {
            match = _.intersection(m.tags, searchParams.filters.tags).length > 0;
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
