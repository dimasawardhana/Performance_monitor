let request = require("request");
let host = "http://localhost:15672/api/queues/";
let rbmq = "amqp://localhost"
var amqp = require('amqplib/callback_api');
var argv = require('minimist')(process.argv.slice(2));
let username = "guest";
let password = "guest";
let threshold = argv.threshold || 1000;
let queuesNode = argv._

setInterval(()=>{
    console.log("checking...");
    request(host,{'auth':{'user':'guest','pass':'guest'}}, (err,req,body)=>{
        if (err) throw err;
        let busy_queues = [];
        let under_loaded = [];
        let data = JSON.parse(req.body);
        for(i of data){
            // console.log(i);
            if(queuesNode.indexOf(i.name)!== -1){

                
                let body = {
                    consumers : i.consumers,
                    messages_ready :i.messages_ready,
                    state : i.state,
                    name : i.name,
                    vhost : i.vhost == "/" ? "%2F" : i.vhost
                }
                if(i.messages_ready > threshold){
                    busy_queues.push(body);
                }else{
                    under_loaded.push(body);
                }    
            }
        } 
        console.log("b",busy_queues);
        console.log("u",under_loaded);
        while(under_loaded.length != 0 && busy_queues.length != 0){
            
            let asks = under_loaded.pop();
            let asked = busy_queues.pop();
            let message_to_send = (asks.messages_ready + asked.messages_ready) /2 - asks.messages_ready;
            let url = host+asked.vhost+"/"+asked.name+"/get";
            let Authorize = Buffer.from(username +":"+ password).toString('base64');
            let headers = {
                "Authorization" : 'Basic '+ Authorize,
                "Content-Type": "application/json"
            }
            let body = {
                "count" : message_to_send,
                "encoding" : "auto",
                "ackmode" : "ack_requeue_false"
            }
            let options = {
                method : "POST",
                url,headers, body, json:true
            }
            console.log(options);
            // consumes

            request(options,(error,response,bodoamat)=>{
                let container = response.body;
                amqp.connect(rbmq, (err, connection)=>{
                    if(err){
                        throw err;
                    }
                    connection.createChannel((error,channel)=>{
                        if(error){
                            throw error;
                        }
                        var queue = asks.name;// nama queuenya apa.
                        channel.assertQueue(queue,{
                            durable:true // to let you know that queue isn't durable when it's off the message will be erased
                        });
                        for(data in container)    {
                            let toSend = container[data].payload;
                            let jsonData = JSON.parse(toSend);
                            channel.sendToQueue(queue,Buffer.from(toSend));
                            console.log("[x]Move %s from %s to %s", jsonData.id, asked.name, asks.name);
                        }
                        console.log("ok");
                    });
                })
            })
        }
        
        
        

    })
    
}, 5000)
