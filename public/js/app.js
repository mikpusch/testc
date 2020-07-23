var app = angular.module("IdeApp", []);

function makeJsonString(string1, string2){
	var jsonstring = '{\"' + string1 + '\": \"' + string2 + '\"}';
	return jsonstring;
}

app.factory('WebSiteService', function ($http){
	var findAll = function(callback)
	{
		$http.get("/api/website")
			.then(callback);
			//function(response){
			//	$scope.websites=response.data;

	};
	var create = function(site, callback)
	{
			$http.post('api/website', site)//jsonstring)
			.then(callback);
	};
	
	var remove = function(id, callback){
		$http.delete('/api/website/'+id)
		.then(callback);
	};
	
	return {
		findAll : findAll,
		create : create,
		remove : remove	
	};
	
});

app.controller("IdeController", function($scope, $http, WebSiteService)
{
//	$scope.hello2 = "Hello from ideController";
		
	$http.get("/rest/developer")
	.then(function(response){
		$scope.developers=response.data;
	});
	
    WebSiteService.findAll( function(response){
		$scope.websites=response.data;
	});

//	$http.get("/api/website")
//	.then(function(response){
//		$scope.websites=response.data;
//	});
	
	$scope.remove = function(index){
		$http.delete('/rest/developer/'+index)
		.then(function(response){
		  $scope.developers=response.data;
		});

	};
	
	$scope.select = function(index){
		$scope.selectedIndex = index;
		$scope.applications = $scope.developers[index].apps;
	};

	
	$scope.showindex = function(index){
		$scope.MyIndex = $index;
	};
	
	$scope.add = function(dev){
		$http.post('/rest/developer/', dev)
		.then(function(response){
		  $scope.developers=response.data;
		});
	};
	

	$scope.clickbutton = function(){
		$scope.developers = [
			{firstName : "A", lastName : "B"},
			{firstName : "C", lastName : "D"},
			{firstName : "Mik", lastName : "Pusch"}
		];
	};
	
	$scope.remove = function(id){
		WebSiteService.remove(id, function(response){
			$scope.websites = response.data;
		});
	}
	
	$scope.addsite = function(site){
//		alert(JSON.stringify(site));
//		var jsonstring = makeJsonString("name", name);
//		var jsonstring = "{\"name\" : \" " + name + "\"}";
//		alert(jsonstring);
		WebSiteService.create(site, function(response){
			$scope.websites = response.data;});
	}

		
});