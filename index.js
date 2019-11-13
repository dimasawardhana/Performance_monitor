let request = require("request");
let fs = require("fs");

<<<<<<< HEAD
let host = "http://localhost:15672/api/queues/"
let path_log = "./log/"
let now = new Date()
let filename = "cek_"+now.getDate()+"-"+now.getMonth()+"-"+now.getFullYear()+"-"+now.getHours()+"-"+now.getMinutes()+".json"
let queues = [];
let writeStream = fs.createWriteStream(path_log+filename,{flags:'a'});
console.log("create log on performance monitoring");
writeStream.write("[");

setInterval(()=>{
    console.log("checking...");
    request(host,{'auth':{'user':'guest','pass':'guest'}}, (err,req,body)=>{
        if (err) throw err;
        datax = JSON.parse(req.body);
        if(!datax.hasOwnProperty("error")){
            writeStream.write("\n[");
            for(data in datax){
                dataToWrite = {
                    message_stats : datax[data].message_stats,
                    consumers : datax[data].consumers,
                    message_bytes : datax[data].message_bytes,
                    message_bytes_ram : datax[data].message_bytes_ram,
                    memory : datax[data].memory,
                    messages_ready : datax[data].messages_ready,
                    name : datax[data].name,
                    node : datax[data].node,
                }
                writeStream.write(JSON.stringify(dataToWrite));
                if(data !== datax.length){
                    writeStream.write(",\n");   
                }
            }
            writeStream.write("]");
            writeStream.write(",");   
        }
        // console.log(JSON.stringify(req));
    })
    // request(host).pipe(writeStream);
    console.log("ok");
}, 1000)
process.on("SIGINT", async ()=>{
    console.log("Gracefully shutdown on keyboard interruption");
    await writeStream.write("]");
    process.exit();
})
