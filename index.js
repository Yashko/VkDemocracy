const VK = require('simplevk');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('./config.json');

if (config.time.length != config.likes.length) throw new Error("config error");

VK.setToken(config.token);
VK.setLang('ru');
VK.setVersion('5.33');

VK.events.on('httpError', function(err) {
    console.log("http error: " + err);
})

app.use(bodyParser.json());

app.post('/', function(req, res) {
    if (req.body.type == 'confirmation') return res.send(config.confirm);
    if (req.body.secret && (req.body.secret != config.secret)) return console.log('wrong secret');
    res.send('ok');
    if (req.body.type != "wall_reply_new") return; //ignoring all events, expect the new comment event
    if (unixtime > (req.body.object.date + config.time[0])) return; //expired
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
    }, config.time[comment.loop] * 1000);
    
});

app.listen(config.port, function() {
    console.log('VK democracy started. port ' + config.port);
});

let APPDATA = {
    checkComment: function(comment) {
        APPDATA.queue.tasks.push({
            method: "wall.getComments",
            args: {
                owner_id: config.watch,
                post_id: comment.post_id,
                start_comment_id: comment.id,
                count: 1,
                need_likes: 1
            },
            callback: function(err, res) { 
                if (err) return console.log(err);
                if (!res) return;
                if ((res.response.items.length == 0) || (res.response.items[0].likes.count < config.likes[comment.loop])) {
                    APPDATA.queue.tasks.push({
                        method: "wall.deleteComment",
                        args: {
                            owner_id: config.watch,
                            comment_id: comment.id
                        },
                        callback: function(err, res) {
                            if (err) return console.log(err);
                            //comment deleted
                        }
                    })
                } else {
                	if (comment.loop == (config.time.length-1)) return;
			comment.loop += 1;
			setTimeout(function() {
				APPDATA.checkComment(comment)
			}, config.time[comment.loop] * 1000);
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

APPDATA.queue.timeout.set();
