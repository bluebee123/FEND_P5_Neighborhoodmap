
var initialAnimals=[
	{
		anName: "Southern Right Whale",
		imgSrc: "http://www.australiananimallearningzone.com/wp-content/uploads/2012/09/Southern-Right-Whale-Pictures-300x272.jpg",
		lat: [-38.290435],
		lng: [142.474970 ]
	},
	{
		anName: "Wallaby",
		imgSrc: "img/kang.jpg",
		lat: [-38.698435,-38.501899],
		lng: [143.229360,145.238695]
	},
	{
		anName: "Echidna",
		imgSrc: "img/echidna.jpg",
		lat: [-37.181397],
		lng: [145.861132]
	},
	{
		anName: "Little Penguin",
		imgSrc: "img/littlePenguin.jpg",
		lat: [-38.514876],
		lng: [145.144377]
	},
	{
		anName: "Possum",
		imgSrc: "img/possum.jpg",
		lat: [-37.930777],
		lng: [145.111319]
	},
	{
		anName: "Koala",
		imgSrc: "img/koala.jpg",
		lat: [-38.805814],
		lng: [143.535075]
	}

]

//the map
var Map = function() {
	this.markers = [];
	this.initialize = function() {
		console.log("initMap");
	  // Create a map object and specify the DOM element for display.
	    this.map = new google.maps.Map(document.getElementById('map'), {
	    	center: {lat: -37.8180, lng: 143.9760},
	    	zoom: 8
		});

		//add searchbox
		var searchControlDiv = document.getElementById('filter');
    	searchControlDiv.index = 1;
    	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchControlDiv);

    	var filterButton = document.getElementById('showInfo');
    	filterButton.index=1;
    	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(filterButton);

    	var animImage = document.getElementById('infoImage');
    	animImage.index=1;
    	this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(animImage);
	}

	//add some hard-coded markers
	this.addInitialMarkers = function(data) {
		for( var i = 0 ; i < data.lng.length; i++) {
			this.markers.push(new google.maps.Marker({
				position: { lat: data.lat[i], lng: data.lng[i] },
				map: this.map,
				title: data.anName
			}));
		}
	}

};

//animals are theo bjects which are bound to the markers.
var Animal = function(data) {
	this.anName = data.anName;
	this.imgSrc = data.imgSrc;
	this.lngLat = data.lngLat;
}

//hardcode some animals

// ko Viewmodel
var ViewModel = function() {
	var self = this;
	self.filteredAnimal = ko.observable("Brumm");
	self.selectedAnimal = ko.observable();
	self.animalList = ko.observableArray([]);
	self.animalNames = ko.observableArray([]);
	initialAnimals.forEach( function(animalItem) {
		self.animalList.push( new Animal(animalItem));
		self.animalNames.push(animalItem.anName);
	});
	console.log(self.animalNames());
	$( "#filter").autocomplete({
      source: self.animalNames()
    });


	self.updateInfo = function() {
		var index = self.animalNames().indexOf(self.filteredAnimal());
		if ( index > -1){
			console.log("Selected: " + self.filteredAnimal() );
			self.selectedAnimal(self.animalList()[index]);
			console.log(self.selectedAnimal());

		} else {
			console.log("No valid animal selected.");
			console.log(self.filteredAnimal());
		}
	}
}

//AIzaSyBvSyOJDU2J8YelkMVS4LGsuI0KVNGqu-I
$(window).load(function() {
  var map = new Map();
  map.initialize();
  initialAnimals.forEach( function(animalItem) {
  	map.addInitialMarkers(animalItem);
  })
  ko.applyBindings(new ViewModel());
});