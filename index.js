'use strict'

//start by requiring the following packages 

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

/* mongo connect */
//var mongo = require('mongodb');
//var monk = require('monk');
//var db = monk('localhost:27017/mtabot');
// testing db
//var routes = require('./index');
//var users = require('./users');

// Make our db accessible to our router
//app.use(function(req,res,next){
//    req.db = db;
//    next();
//});

/* Page token */
//const PAGE_ACCESS_TOKEN  = 'EAAEY267L2C0BABCF5oCxtyZCCKW3CQ5bWtcL6AR7WbZBnAWs6dzBeUYUSMwZAtwgca5ONZCWGwJEp8Uti2mgHKx07lBu03ZCMFectIHpxM0RI5bSBG46uN1LoKBNZAj3NhXYW0voJ9bfcpqakwGzQ7ZAgaIprSIdAGx5rWYxnNB8gZDZD';
const PAGE_ACCESS_TOKEN = 'EAAEY267L2C0BAMwPz6KJIa1bXBJseYAQa0ThglqrpVxVVQnPJXHfcjEpc5DSZCBTk3W0SrZB1QK9lgcDE8LApCZBHncNLFoVoUfWgZBdUIeJw8UFnucoAZAcgUOY3BfNZCMtmvcvmEIAbPDuETFo9wqBPp7DWKX0P8ig7ctRswNgZDZD'
const USER_DEFINED_PAYLOAD = 'action@getStarted';

const FACEBOOK_MSG_API = 'https://graph.facebook.com/v2.6/me/messages';
const BRAIN_URI = 'http://localhost:8080/ZivPageBot/PageBotServlet';

const BRAIN_TOKEN = "z1vb0t";

//set the port to 8000 (the port we used with ngrok )

app.set('port', (process.env.PORT || 8000 ))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

//mongo settings route

//app.use('/', routes);
//app.use('/users', users);
// app.use(serveStatic(path.join(__dirname, 'public')));
// console.log(path.join(__dirname, 'public'));

// setup a route 
app.get('/', function (req, res) {
    res.send("Hello , I'm a bot ")
});

// var testStr;
// app.get('/getJson', function(req,res) {
//     getJsonFileAsArr('http://localhost:8000/wordVector.json');

//     setTimeout(() => console.log('IN GET ' + testStr),
//     2000);
//     setTimeout(() =>res.send(testStr), 2000);
// })

app.listen(app.get('port'), function() {
    console.log('server running at : ', app.get('port'))
});

//Token for FACEBOOK VERIFY CODE 

app.get('/webhook', function (req, res) {

    if (req.query['hub.verify_token'] === 'ZivBot123') {
        res.send(req.query['hub.challenge'])
    }
	res.send('Error, wrong token')
});

var resultMsg;
app.post('/webhook', function (req, res) {
var data = req.body;
//console.debug('Request body',data);
console.log('Request from FB received');
// Make sure this is a page subscription
if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
    var pageID = entry.id;
    var timeOfEvent = entry.time;

    // Iterate over each messaging event
    entry.messaging.forEach(function(event) {
        if (event.message) {
            getResultMsg(event.message.text, function(resMsg){
                sendMessage(event.sender.id, resMsg.resultMessage)
            });
       	    // setTimeout(() => {
            //        console.log(resultMsg);
            //        sendMessage(event.sender.id, resultMsg.resultMessage);
            //    },
            //    200);
        } else {
            var msg;
            // If the event is a postback and has a payload equals USER_DEFINED_PAYLOAD --MINE: action@getStarted --
			if(event.postback && event.postback.payload === USER_DEFINED_PAYLOAD )
			{
				//present user with some greeting or call to action
			    msg = "שלום, אני רבקה, מזכירה בחוג מערכות מידע. איך אני יכולה לעזור לך?"
				sendMessage(event.sender.id,msg);      
			}
            else{
                msg = "לא בטוחה שהבנתי, אנא חזור שנית."; 
            }
        }
    });
    });

    res.sendStatus(200);
}
});

function sendMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
	        text: messageText
        }
    };
    // call the send API
    callSendAPI(messageData, FACEBOOK_MSG_API, 'POST');
}  

function callSendAPI(messageData, uri, method) {
    request({
        uri: uri,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: method,
        json: messageData
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
        console.log('Success. recipientId=['+recipientId+'] messageId=['+messageId+']');

        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });  
}

function getResultMsg(userMsg, callback){
    var brain = {
	    "token": BRAIN_TOKEN,
	    "message": userMsg
    };
     request({
        uri: BRAIN_URI,
        method: 'POST',
        json: brain
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           // resultMsg = body;
            callback(body);
            console.log('Brain success. resultMsg=['+resultMsg+']');
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });    
}