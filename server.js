var local = false;

var express = require('express');

var app = express();

var bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
//app.use(multer());

app.use(express.static(__dirname + '/public'));

var mongoose = require('mongoose');

if (process.env.SystemRoot){
	console.log(process.env.SystemRoot.toUpperCase());

	if (process.env.SystemRoot.toUpperCase() == 'C:\\WINDOWS'){
		console.log("LOCAL");
		local = true;
	}
}
else{
	console.log("Remote");
	local = false;
}

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = mongoURL;

if (!local){
	var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
	var mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
	var mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
	var mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
	var mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
	var mongoUser = process.env[mongoServiceName + '_USER'];
	if (mongoHost && mongoPort && mongoDatabase) {
		mongoURLLabel = mongoURL = 'mongodb://';
		if (mongoUser && mongoPassword) {
		mongoURL += mongoUser + ':' + mongoPassword + '@';
		}
    // Provide UI label that excludes user id and pw
		mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
		mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
	}
}


if (local){
	ip='127.0.0.1';
	port = 3000;
	mongoURL = 'mongodb://localhost/playground';
	mongoURLLabel = mongoURL;
}
var connectMongoose = function () {
	mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});
};

connectMongoose();

var dbMongoose = mongoose.connection;
//mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});

var WebSiteSchema = new mongoose.Schema({
	name : String,
	created :  {type : Date, default: Date.now}},
	{collection : 'website'}
);

var WebSiteModel = mongoose.model('WebSite', WebSiteSchema);
var website1 = new WebSiteModel({name: "WebSite 1"});
//website1.save();

var developer = [
	{firstName : "Alice", lastName : "Wonderland", apps : [ {name : "Word"}, {name: "Excel"}	]},
	{firstName : "Bob", lastName : "Marley", apps : [ {name : "PowerPoint"}, {name: "Excel"} 	]},
	{firstName : "Mik", lastName : "Pusch",  apps : [ {name : "GePulse"}, {name: "Ana"} ]}
];

app.get('/process', function(req, res){
	res.json(process.env);
	
});

app.get('/url', function(req, res){
	res.json(mongoURL);
});

app.get('/rest/developer', function (req, res){
	res.json(developer);
	
});

app.get('/rest/developer/:index', function (req, res){
	res.json(developer[req.params.index]);
	
});

app.post('/rest/developer/', function (req, res){
//	var newDeveloper = req.body;
	console.log(req.body);
	developer.push(req.body);
	res.json(developer);

});

app.delete('/rest/developer/:index', function(req, res){
	var index = req.params.index;
	if (index<developer.length){
		developer.splice(index,1);
	}
	res.json(developer);
		
});


app.get('/api/website/:name/create', function(req, res){
	var newWebsite = new WebSiteModel({name: req.params.name});
	newWebsite.save(function (err, doc){
		res.json(doc);
	});
	console.log(newWebsite);
	
});

app.get('/api/website/:id', function(req, res){
	WebSiteModel.findById(function (err, site){
		res.json(site);
		console.log(site);

	});
	
});
app.get('/api/website', function(req, res){
	WebSiteModel.find(function (err, sites){
		res.json(sites);
		console.log(sites);

	});
	
});

/*
app.delete('/api/website/:id', function(req, res){
	var id = req.params.id;
	
	WebSiteModel.remove({_id: id}, function(err,count) {
			console.log(count+' sites removed');
			WebSiteModel.find(function (err, sites){
			   res.json(sites);
			   console.log(sites);
		  }
	  );
		  });
});
*/


app.post("/api/website/", function(req, res){

	var newWebsite = new WebSiteModel(req.body);
	newWebsite.save(function (err, doc){
		WebSiteModel.find(function (err, sites){
			res.json(sites);
		});
	});
	console.log("CREATED " +newWebsite);

	
});


app.delete('/api/website/:id', function(req, res)
{
	var id = req.params.id;
	console.log(id);
	
	WebSiteModel.deleteOne({_id: id}, (err) => {
        if (err){
            throw err;
		}
        else {
            console.log(id, 'is deleted');
				WebSiteModel.find(function (err, sites){
			   res.json(sites);
				console.log(sites);});
		}

	});
});

	

app.listen(port, ip);
