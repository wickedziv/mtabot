'use strict'

//start by requiring the following packages 

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express();

/* Page token */
//const PAGE_ACCESS_TOKEN  = 'EAAEY267L2C0BABCF5oCxtyZCCKW3CQ5bWtcL6AR7WbZBnAWs6dzBeUYUSMwZAtwgca5ONZCWGwJEp8Uti2mgHKx07lBu03ZCMFectIHpxM0RI5bSBG46uN1LoKBNZAj3NhXYW0voJ9bfcpqakwGzQ7ZAgaIprSIdAGx5rWYxnNB8gZDZD';
const PAGE_ACCESS_TOKEN = 'EAAEY267L2C0BAKmvMPQHZCq99Vtbrj8uioCj3KZA1AZBkho7Q5sZA8iHld3c0D3FZBMJUnmhxZAgWD2XcFTpexZB5P8iticTviKDQzHNjPH2wUSpaf87HWZBsYScjXqi6S71UXjBzKaCRaqFJzVJvbTj03nBnszz6c9JmmDMsepkywZDZD'
const USER_DEFINED_PAYLOAD = 'action@getStarted';

const FACEBOOK_MSG_API = 'https://graph.facebook.com/v2.6/me/messages';

//set the port to 8000 (the port we used with ngrok )

app.set('port', (process.env.PORT || 8000 ))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// setup a route 
app.get('/', function (req, res) {
    res.send("Hello , I'm a bot ")
});

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

app.post('/webhook', function (req, res) {
var data = req.body;
//console.debug('Request body',data);

// Make sure this is a page subscription
if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
    var pageID = entry.id;
    var timeOfEvent = entry.time;

    // Iterate over each messaging event
    entry.messaging.forEach(function(event) {
        if (event.message) {
       	 sendMessage(event.sender.id, 'Test message');
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
                msg = "אני לא מזהה את הפקודה הזו יא מניאק"; 
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

