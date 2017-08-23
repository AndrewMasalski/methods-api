module.exports.stringify = function (data) {
    const br = "\n";
    const sep = '\t'
        , head = true
        , keys = (typeof data[0] === 'object') && Object.keys(data[0])
        , header = keys && keys.join(sep)
        , output = head ? (header + br) : '';

    if (!data || !keys) return '';

    return output + data.map(function(obj){
        let values = keys.reduce(function(p, key) {
            p.push(obj[key]);
            return p;
        }, []);
        return values.join(sep)
    }).join(br)
};