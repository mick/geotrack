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

socket.on('connection', function(client){ 
        sys.puts("new client connect");

        client.on('message', function(msg){ 
            // no client messages yet.

            }); 
        client.on('disconnect', function(){ sys.puts("client disconnect"); }) 
    }); 

app.get('/', function(req, res){                
        res.render('index.ejs', { layout: false});
    });
app.use('/static', express.static(__dirname + '/static')); 



app.put('/api/location', function(req, res){                
    var lat = req.param("lat");
    var lng = req.param("lng");

    //var lat = req.body['lat'];
    //var lng = req.body['lng'];

    var newlocation = {date:(new Date()),
                       geom: {"type":"Point", "coordinates":[lng, lat]}};

    db.save(newlocation, function (err, rs) {
        if(err){
            sys.puts("error: "+sys.inspect(err));
            res.send({status:"error"});
        }else{
            res.send({status:"ok"});
        }
    });
    socket.emit('newlocation', newlocation.geom);

});


app.listen(settings.PORT);