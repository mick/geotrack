var express = require("express"),
    app = express.createServer(),
    cradle = require("cradle"),
    sys = require("sys"),
    io = require("socket.io"),
    settings = require("./settings");


var connection = new(cradle.Connection)(settings.COUCHDB_HOST, settings.COUCHDB_PORT, 
                                        {auth: settings.COUCHDB_AUTH});
var db = connection.database(settings.COUCHDB_DATABASE);


app.use(express.bodyParser());

socket = io.listen(app);
var subs = [];
socket.on('connection', function(client){ 
        sys.puts("new client connect");

    subs.push(client);
    client.on('message', function(msg){ 
        // no client messages yet.
        console.log("get initial: ", msg);
        if(msg.type == "fetchinitial"){
            bbox = msg.bbox.join(",");
            db.spatial("gc-utils/geomsFull",
                       {"bbox":bbox, "descending": "true"},
                       function(er, docs) {
                           if(er){
                               sys.puts("Error: "+sys.inspect(er));
                               return;
                           }
                           startdate = new Date();
                           for(d in docs){
                               startdate.setTime(startdate.getTime() - (1000*60*60));
                               messagedate = new Date(docs[d].value.date);
                               if(messagedate < startdate){
                                   delete docs[d];
                               }
                               
                           }

                           console.log("docs", docs);
                           client.send({type:"initial", data:docs});
                       });
        }
        
    }); 

    client.on('disconnect', function(){ sys.puts("client disconnect"); }) ;
}); 

app.get('/', function(req, res){                
    res.render('index.ejs', { layout: false});
});

app.use('/static', express.static(__dirname + '/static')); 



app.put('/api/location', function(req, res){                
    var lat = parseFloat(req.param("lat"));
    var lng = parseFloat(req.param("lng"));

    console.log("new location posted");
    var newlocation = {date:(new Date()),
                       geometry: {"type":"Point", "coordinates":[lng, lat]}};

    db.save(newlocation, function (err, rs) {
        if(err){
            sys.puts("error: "+sys.inspect(err));
            res.send({status:"error"});
        }else{
            res.send({status:"ok"});
        }
    });
    for( s in subs){
        subs[s].send(newlocation.geometry);
    }    

});


app.listen(settings.PORT);