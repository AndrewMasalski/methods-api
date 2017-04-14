let fs = require('fs');
let _ = require('lodash');
let db = require('diskdb');
db.connect('../import', ['methods']);


const filePath = 'data.txt';
let groupRegex = /^(\d\.)[^\d](.*)/;
let tagRegex = /^(\d\.\d)\.\s?(.*)/;
let typeRegex = /[\s+|.|-](инструкция по применению|инструкция|мви|письмо|методика|методические рекомендации|методические указания|руководство|технические условия|ту|анализ|санитарные нормы|санитарные требования|санитарные правила)\s+/;
let yearRegex = /\d\d\.\d\d.(\d\d\d\d)/;
let res = {
    groups: []
};
let lines = fs.readFileSync(filePath).toString().split("\r\n");
let currentGroup = 'start';
let currentTag = undefined;
let methods = [];
let tags = [];

function getGroup(index) {
    const groups = require('../db/groups.json');
    return groups[index];
}
function getTags(strs) {
    const tags = require('../db/tags.json');
    let res = [];
    _.forEach(strs, function(text) {
        let found = _.find(tags, {text: text});
        if (found) {
            res.push(found._id);
        }
    });
    return res;
}
lines.forEach(function(line, index) {
    line = _.trim(line.toLowerCase());
    if (groupRegex.test(line)) {
        currentGroup = getGroup(res.groups.length);
        if (currentGroup !== 'start') {
            res.groups.push(currentGroup);
        }
    } else if (tagRegex.test(line)) {
        if (!currentGroup.tags) {
            currentGroup.tags = [];
        }
        let tagText = tagRegex.exec(line)[2];
        currentTag = {_id: index, text: tagText, splitted: []};
        currentGroup.tags.push(currentTag);
        tagText.split(', ')
            .forEach(function(tag) {
                currentTag.splitted.push(_.trim(tag));
                tags.push(_.trim(tag));
            })
    } else {
        if (!currentTag.methods) {
            currentTag.methods = [];
        }
        if (line !== '') {
            let type, year;
            if (typeRegex.test(line)) {
                type = typeRegex.exec(line)[1];
            }
            if (yearRegex.test(line)) {
                year = yearRegex.exec(line)[1];
            }

            let method = {
                description: line.replace(/-\s+/, ''),
                group: currentGroup._id,
                type: type,
                tags: getTags(currentTag.splitted),
                year: year
            };
            currentTag.methods.push(method);
            methods.push(line);
        }
    }

});

_.forEach(res.groups, function(g) {
    _.forEach(g.tags, function(t) {
        _.forEach(t.methods, function(m) {
            let resp = db.methods.save(m);
        })
    })
});
//fs.writeFileSync('../import/res.json', JSON.stringify(res, null, 2));
//fs.writeFileSync('../import/lines.json', methods.join('\r\n'));
//fs.writeFileSync('../import/tags.json', _.uniq(tags).join('\r\n'));