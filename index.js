'use strict';
const VK = require('simplevk');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let SETTINGS = {
    watch: '-123',
    token: '123qwe',
    time: [60, 60, 60], //in seconds
    likes: [1, 2, 3], 
    secret: '', //Secret key from callback api settings group page 
    port: 3003,
    confirm: '' //confirmation code to verify the server endpoint
};

if (SETTINGS.time.length != SETTINGS.likes.length) throw new Error("Settings error");

VK.setToken(SETTINGS.token);
VK.setLang('ru');
VK.setVersion('5.33');

VK.events.on('httpError', function(err) {
    console.log("http error: " + err);
})

app.use(bodyParser.json());

app.post('/', function(req, res) {
    if (req.body.type == 'confirmation') return res.send(SETTINGS.confirm);
    if (req.body.secret && (req.body.secret != SETTINGS.secret)) return console.log('wrong secret');
    res.send('ok');
    if (req.body.type != "wall_reply_new") return; //ignoring all events, expect the new comment event
    if (unixtime > (req.body.object.date + SETTINGS.time[0])) return; //expired
    let obj = req.body.object;
    let comment = {
        id: obj.id,
        author: obj.from_id,
        date: obj.date,
        post_id: obj.post_id,
        loop: 0
    }
    setTimeout(function() {
        APPDATA.checkComment(comment)
    }, SETTINGS.time[comment.loop] * 1000);
    
});

app.listen(SETTINGS.port, function() {
    console.log('VK democracy started. port ' + SETTINGS.port);
});

let APPDATA = {
    checkComment: function(comment) {
        APPDATA.queue.tasks.push({
            method: "wall.getComments",
            args: {
                owner_id: SETTINGS.watch,
                post_id: comment.post_id,
                start_comment_id: comment.id,
                count: 1,
                need_likes: 1
            },
            callback: function(err, res) { 
                if (err) return console.log(err);
                if (!res) return;
                if ((res.response.items.length == 0) || (res.response.items[0].likes.count < SETTINGS.likes[comment.loop])) {
                    APPDATA.queue.tasks.push({
                        method: "wall.deleteComment",
                        args: {
                            owner_id: SETTINGS.watch,
                            comment_id: comment.id
                        },
                        callback: function(err, res) {
                            if (err) return console.log(err);
                            //comment deleted
                        }
                    })
                } else {
                	if (comment.loop == (SETTINGS.time.length-1)) return;
			comment.loop += 1;
			setTimeout(function() {
				APPDATA.checkComment(comment)
			}, SETTINGS.time[comment.loop] * 1000);
                }
            }
        });
    },
    queue: {
        proceed: function() {
            let self = APPDATA.queue;
            if (self.tasks.length == 0) return self.timeout.set();
            let task = self.tasks.shift();
            VK.api(task.method, task.args, task.callback);
            self.timeout.set();
        },
        tasks: [],
        timeout: {
            set: function() {
                setTimeout(APPDATA.queue.proceed, 334); //vk allows to perform 3 requests per second
            }
        }
    }
}

let unixtime = () => { return Date.now() / 1000 | 0; }

function test() {
    APPDATA.queue.tasks.push({
        method: "wall.get",
        args: {
		    owner_id: SETTINGS.watch,
		    count: SETTINGS.count
		},
        callback: function(err, res) {
            if (err) return console.log(err);
		    return console.log(res);
        }
    })
}

APPDATA.queue.timeout.set();
