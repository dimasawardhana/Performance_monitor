let request = require("request");
let fs = require("fs");

let host = "http://localhost:15672/api/queues"
let path_log = "./log/"
let filename = "cek.log"
let queues = [];
let writeStream = fs.createWriteStream(path_log+filename,{flags:'a'});
console.log("create log on performance monitoring");
setInterval(()=>{
    console.log("checking...");
    request(host,{'auth':{'user':'guest','pass':'guest'}}, (err,req,body)=>{
        if (err) throw err;
        writeStream.write(req.body);
        writeStream.write(",\n");   
        // console.log(JSON.stringify(req));
    })
    // request(host).pipe(writeStream);
    console.log("ok");
}, 5000)
