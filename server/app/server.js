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

    }); 
    client.on('disconnect', function(){ sys.puts("client disconnect"); }) ;
}); 

app.get('/', function(req, res){                
    db.spatial("geocats/points",
{"bbox":bbox, "descending": "true"},
});
function(er, docs) {
if(er){sys.puts("Error: "+sys.inspect(er));
res.send("error");return;} res.send(docs);
});
        res.render('index.ejs', { layout: false});
    });
app.use('/static', express.static(__dirname + '/static')); 



app.put('/api/location', function(req, res){                
    var lat = req.param("lat");
    var lng = req.param("lng");

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