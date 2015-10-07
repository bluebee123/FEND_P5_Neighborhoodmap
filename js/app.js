
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
	    	draggable: false
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

//set up the info window, its content changing based on the selected animal.
	self.infoWindow = ko.observable(new google.maps.InfoWindow());
	self.infoContent = ko.computed(function() {
		if( self.selectedAnimal()!==undefined) {
			var retString = "<h4>" + self.selectedAnimal().anName + "</h4>";
			retString +="<img id='infoImage'  src='"+ self.selectedAnimal().imgSrc +'" alt="Animal image">';
			retString +="Wikipedia " + "placeholder";
			return retString;
		} else {
			return "nocontent";
		}
	})

//add animals to the list
	self.animalList = ko.observableArray([]);
	initialAnimals.forEach( function(animalItem) {
		//add the google maps markers
		var tmp = ko.observable(animalItem);
		for(var i = 0; i < animalItem.lng.length; i++) {
			var alat = animalItem.lat[i];
			var alng = animalItem.lng[i];
			var marker = new google.maps.Marker({
 				position: {lat: alat, lng: alng},
             	map: self.map,
				animation: google.maps.Animation.DROP,
				name: animalItem.anName
	         })
			//add click listeners to the markers, setting the current selected Animal.
			marker.addListener('click', (function(animal) {
    			return function() {
    				self.setSelectedAnimal(animal);
    			};
  			})(tmp()));

			tmp().myMarkers.push(marker);
		}
		self.animalList().push(tmp);
	});

//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();
		return ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal().anName.toLowerCase().indexOf(search) >= 0;
        	animal().myMarkers.forEach(function(marker){
        		marker.setVisible(show);
        	});
        	return show;
    	});
	});


	//set the list size to the amount of animals, or 15 at most
	var sizeVal = self.animalList().length > 15 ? 15 : self.animalList().length;
	$('#listview').attr('size', sizeVal);
	// document.getElementById("listview").size = sizeVal;

//on selecting an animal, the infowindow is displayed and the markers set to bouncing. the last selected animal
//is recorded in order to unbounce their markers.
	self.updateInfo = function() {
		if(self.lastAnimal()) {
			self.bounceMarkers(self.lastAnimal(),null);
			self.toggleInfoWindow(self.lastAnimal(),false);
		}
		self.bounceMarkers(self.selectedAnimal(),google.maps.Animation.BOUNCE);
		self.toggleInfoWindow(self.selectedAnimal(),true);
		self.lastAnimal(self.selectedAnimal());
		self.infoWindow().setContent(self.infoContent());
	};
//helper function which is called when clicking on a marker which are not bound to knockout.
	self.setSelectedAnimal = function(animal) {
		this.selectedAnimal(animal);
		self.updateInfo();
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
				self.infoWindow().open(self.map,marker);
			});
		} else {
			animal.myMarkers.forEach( function(marker) {
				self.infoWindow().close(self.map,marker);
			});
		}
	}
}

//AIzaSyBvSyOJDU2J8YelkMVS4LGsuI0KVNGqu-I
$(window).load(function() {
  var map = new Map();
  map.initialize();
  ko.applyBindings(new ViewModel(map));
});