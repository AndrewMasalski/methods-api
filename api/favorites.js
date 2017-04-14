let express = require('express');
let router = express.Router();

router.route('/addFavorite')
    .post(function(req, res) {
        let method = req.body;
        console.log('saving: ', method);
        let resp = db.users.save(method);
        res.send(resp);
    });

module.exports = router;

