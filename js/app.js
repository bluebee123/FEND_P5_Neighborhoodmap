
var initialAnimals=[
	{
		anName: "Southern Right Whale",
		imgSrc: "http://www.australiananimallearningzone.com/wp-content/uploads/2012/09/Southern-Right-Whale-Pictures-300x272.jpg",
		lat: [-38.428914],
		lng: [142.521175],
		myMarkers: []
	},
	{
		anName: "Wallaby",
		imgSrc: "img/kang.jpg",
		lat: [-38.698435,-38.501899],
		lng: [143.229360,145.238695],
		myMarkers: []
	},
	{
		anName: "Echidna",
		imgSrc: "img/echidna.jpg",
		lat: [-37.181397],
		lng: [145.861132],
		myMarkers: []
	},
	{
		anName: "Little Penguin",
		imgSrc: "img/littlePenguin.jpg",
		lat: [-38.514876],
		lng: [145.144377],
		myMarkers: []
	},
	{
		anName: "Possum",
		imgSrc: "img/possum.jpg",
		lat: [-37.930777],
		lng: [145.111319],
		myMarkers: []
	},
	{
		anName: "Koala",
		imgSrc: "img/koala.jpg",
		lat: [-38.805814],
		lng: [143.535075],
		myMarkers: []
	}

]

//initializes and offers methods relating to anything concerning the google map.
var Map = function() {

	this.initialize = function() {
	  // Create a map object and specify the DOM element for display.
	    this.map = new google.maps.Map(document.getElementById('map'), {
	    	center: {lat: -37.8180, lng: 143.9760},
	    	zoom: 8,
	    	mapTypeControl: false,
	    	draggable: false,
	    	panControl: false
		});

		//add some additional elements to the map: filter search box
		var searchControlDiv = document.getElementById('filter');
    	searchControlDiv.index = 1;
    	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchControlDiv);


    	var listv = document.getElementById('listview');
    	listv.index=1;
    	this.map.controls[google.maps.ControlPosition.LEFT].push(listv);


	}

	this.getMap = function() {
		return this.map;
	}

};


// ko Viewmodel
var ViewModel = function(map) {


	var self = this;
	self.map = map.getMap(); //save the actual google map
	self.filteredAnimal=ko.observable("");
	self.selectedAnimal = ko.observable();
	self.lastAnimal = ko.observable();

//set up the info bubble, its content changing based on the selected animal.
	self.infoBubble = ko.observable(new InfoBubble({
		disableAutoPan: true,
		backgroundColor: 'transparent',
		content: $("#infContent").html()
	}));

	self.wikiLink = ko.observable("");
	self.wikiParagraph = ko.observable("");
//add animals to the list
	self.animalList = ko.observableArray([]);
	initialAnimals.forEach( function(animalItem) {
		//add the google maps markers
		for(var i = 0; i < animalItem.lng.length; i++) {
			var alat = animalItem.lat[i];
			var alng = animalItem.lng[i];
			var marker = new google.maps.Marker({
 				position: {lat: alat, lng: alng},
             	map: self.map,
				animation: google.maps.Animation.DROP,
				name: animalItem.anName
	         })
			marker.active = false;
			//add click listeners to the markers, setting the current selected Animal.
			marker.addListener('click', (function(animal) {
    			return function() {
    				self.setSelectedAnimal(animal);
    				self.updateInfo();
    			};
  			})(animalItem));

			animalItem.myMarkers.push(marker);
		}
		self.animalList().push(animalItem);
	});

//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();

		var tmp = ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal.anName.toLowerCase().indexOf(search) >= 0;
        	animal.myMarkers.forEach(function(marker){
        		marker.setVisible(show);
        	});
        	return show;
    	});

    	console.log(tmp);
    	return tmp;
	});


	//set the list size to the amount of animals, or 15 at most
	var sizeVal = self.animalList().length > 15 ? 15 : self.animalList().length;
	$('#listview').attr('size', sizeVal);
	// document.getElementById("listview").size = sizeVal;

//on selecting an animal, the infowindow is displayed and the markers set to bouncing. the last selected animal
//is recorded in order to unbounce their markers.
	self.updateInfo = function() {
		self.wikiAjax(self.selectedAnimal().anName);
		if(self.lastAnimal()) {
			self.bounceMarkers(self.lastAnimal(),null);
			self.toggleInfoWindow(self.lastAnimal(),false);
		}

		self.bounceMarkers(self.selectedAnimal(),google.maps.Animation.BOUNCE);
		self.toggleInfoWindow(self.selectedAnimal(),true);
		self.lastAnimal(self.selectedAnimal());

	};
//helper function which is called when clicking on a marker which are not bound to knockout.
	self.setSelectedAnimal = function(animal) {
		this.selectedAnimal(animal);
	}
//set the bounce animation of an animal marker on or off
	self.bounceMarkers = function(animal, animation) {
		animal.myMarkers.forEach( function(marker) {
			marker.setAnimation(animation);
		});
	};

//toggle the info window for the markers
	self.toggleInfoWindow = function(animal,open) {
		if(open) {
			animal.myMarkers.forEach( function(marker) {
				self.infoBubble().setContent($("#infContent").html());
				self.infoBubble().open(self.map,marker);
			});
		} else {
			animal.myMarkers.forEach( function(marker) {
				self.infoBubble().close(self.map,marker);
			});
		}
	}
	self.wikiAjax = function(query) {
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+query+
    	'&format=json&callback=wikiCallback';

    	$.ajax({
        	url: wikiURL,
        	dataType: "jsonp",
        	success: function ( response ) {
				self.wikiLink('http://en.wikipedia.org/wiki/' + response[1][0]);
				self.wikiParagraph( response[2][0]);

        	}
   		 });
	};


}


var testData = function() {
	var aurl = "http://biocache.ala.org.au/ws/occurrences/search?";
	//find them in the area of my map
	aurl+="q=wallaby";
	aurl+="&facets=names_and_lsid";

	//find all occurences from the current month
	var d = new Date();
  var mon = d.getMonth();
  var yr = d.getFullYear();
	/*url+="&fq=month:";
	var monStr = mon>9? mon : "0" + mon;
	url+=monStr;
	*/	//and current year
   //	url+="&fq=year:'"+yr+"'";
   aurl+="&pageSize=0";
   	aurl+="&fq=year:" + yr;
   	aurl+="&wtk=POLYGON((142.59910583496094+-37.00693943418585,146.47178649902344%20-37.00693943418585,146.47178649902344%20-38.83970761354512,142.59910583496094%20-38.83970761354512,142.59910583496094%20-37.00693943418585))";

   	console.log(aurl);
   	$.ajax({
        url: "http://cors.io/?u="+aurl,
        dataType: "json",
        jsonCallback: 'callback',
        success: function ( response ) {
            console.log(response);

        }
    }).error(function(e) {
       console.log("ERROR" + e);
    });
}

//AIzaSyBvSyOJDU2J8YelkMVS4LGsuI0KVNGqu-I
$(window).load(function() {
  var map = new Map();
  map.initialize();
  ko.applyBindings(new ViewModel(map));
  //testData();


});