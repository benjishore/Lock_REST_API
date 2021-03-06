var express = require('express');
var exec = require('child_process').exec;
var util = require('util')
var bodyParser = require('body-parser');
var moment = require('moment');
var mongoOp = require("../model/mongo");

var router = express.Router();
var app = express();

//needed to be able to run child_proccess in browser
// app.get('/javascript/jquery.min.js', function(req, res) {
//     res.sendFile(__dirname + "/javascript" + "/jquery.min.js");
//
// });

router.get('/', function(req, res) {
    res.render('index', {
        title: 'Home'
    });
});


/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */

router.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
router.use(bodyParser.json());

//could maybe get the ssh working by sending the IP up from the app in future

router.post('/unLock', function(req, res) {
    var now = moment().format('LLL');
    var ID = req.body.LockID;
    //print to console when the lock is being operated
    //work out how to save this date info in mongo for lookup on the app
    console.log(req.body.name + " unlock attempt on LockID: " + req.body.LockID + " at " + now);
    // ip when conected to mac via ethernet is 192.168.2.2
    //changed to ls to demo it working without the lock on the network
    //ssh pi@192.168.1.161 sudo python /home/pi/unlock.py
    exec('ls', (e, stdout, stderr) => {
        if (e instanceof Error) {

            if (e) {
                console.log(req.body.name + " unlock failed at " + now + " due to " + e);
                //504 is timeout
                return res.status(504).json({
                    success: false,
                    message: "Error: Unable to connect to lock, please check its internet connection"
                });
            }
        } else {
            console.log(req.body.name + " unlock success at " + now);

            var db = new mongoOp.Logs({
                name: req.body.name,
                lockTime: now,
                type: "UNLOCK",
                ID: ID

            });
            // save the user
            console.log(db);
            db.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        message: "unlock successful by " + req.body.name
                    });
                }
            });
        }
    });
});

router.post('/Lock', function(req, res) {
    var now = moment().format('LLL'); //updating date format
    var ID = req.body.LockID;
    //print to console when the lock is being operated
    //work out how to save this date info in mongo for lookup on the app
    console.log(req.body.name + " lock attempt on LockID: " + req.body.LockID + " at " + now);
    // ip when conected to mac via ethernet is 192.168.2.2
    //changed to ls to demo it working without the lock on the network
    //ssh pi@192.168.1.161 sudo python /home/pi/lock.py
    exec('ls', (e, stdout, stderr) => {
        if (e instanceof Error) {

            if (e) {
                console.log(req.body.name + " lock failed at " + now + " due to " + e);
                //504 is timeout
                return res.status(504).json({
                    success: false,
                    message: "Error: Unable to connect to lock, please check its internet connection"
                });
            }
        } else {
            console.log(req.body.name + " lock success at " + now);

            var db = new mongoOp.Logs({
                name: req.body.name,
                lockTime: now,
                type: "LOCK",
                ID: ID
            });
            // save the user
            console.log(db);
            db.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        message: "lock successful by " + req.body.name
                    });
                }
            });
        }
    });
});

router.post('/Logs', function(req, res) {
  mongoOp.Logs.find({
    //  name: req.body.name,
      ID: req.body.LockID
  }, function(err, data) {
      if (err) {
          response = {
              "success": false,
              "message": "Error fetching data, check connection"
          };
          res.status(400).json(response);
      } else {
        response = {
             success : true,
            message: data
        };
  res.json(response);
}
})
});


module.exports = router;
