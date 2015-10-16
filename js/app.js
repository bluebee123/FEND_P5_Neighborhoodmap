var INFOTABTITLE = "Pic and Info";
var FLICKRTABTITLE = "Flickr Images";

//some initial Animal data, hard coded
var initialAnimals=[
	{
		anName: "Southern Right Whale",
		imgSrc: "img/whale.jpg",
		title: "My horrible pic of a whale",
		lat: -38.428914,
		lng: 142.521175,
		dateSeen: "02.09.2015",
		myMarkers: []
	},
	{
		anName: "Wallaby",
		imgSrc: "img/kang.jpg",
		title: "Feeding the Wallaby",
		lat: -38.698435,
		lng: 143.229360,
		dateSeen: "02.09.2015",
		myMarkers: []
	},
	{
		anName: "Echidna",
		imgSrc: "img/echidna.jpg",
		title: "Lucky find while hiking",
		lat:-37.181397,
		lng: 145.861132,
		dateSeen: "02.10.2015",
		myMarkers: []
	},
	{
		anName: "Little Penguin",
		imgSrc: "img/littlePenguin.jpg",
		title: "© Penguin Parade, http://www.penguins.org.au",
		lat: -38.514876,
		lng: 145.144377,
		dateSeen: "16.09.2015",
		myMarkers: []
	},
	{
		anName: "Possum",
		imgSrc: "img/possum.jpg",
		title: "Possum in a tree",
		lat: -37.930777,
		lng: 145.111319,
		dateSeen: "20.08.2015",
		myMarkers: []
	},
	{
		anName: "Koala",
		imgSrc: "img/koala.jpg",
		title: "Koala by the road",
		lat: -38.805814,
		lng: 143.535075,
		dateSeen: "02.09.2015",
		myMarkers: []
	}

];

//initializes and offers methods relating to anything concerning the google map.
var Map = function() {
	var self = this;
	this.initialize = function() {
	  // Create a map object and specify the DOM element for display.
	    self.map = new google.maps.Map(document.getElementById('map'), {
	    	center: {lat: -37.9180, lng: 143.9760},
	    	zoom: 8,
	    	mapTypeControl: false,
	    	streetViewControl: false
		});
	    self.flickrMarkers = [];
  	};

  	//centers the map on a marker
  	self.panToMarker = function(marker){
  		self.map.panTo(marker.position);
  	};
  	//flickrMarkers are markers at positions where other people took a photo of an animal

	//removes all flickr MArkers
	self.resetflickrMarkers = function() {
		self.flickrMarkers.forEach(function(marker) {
			marker.setVisible(false);
		});
		self.flickerMarkers = [];
	};
	//adds a flickr Marker at the given lon, lat with the name as title.
	self.addFlickrMarker = function(lon, lat, name) {

		var marker = new google.maps.Marker({
 				position: {lat: lat, lng: lon},
             	map: this.map,
				title: name,
				icon: "img/zoo.png"
	         });
		self.flickrMarkers.push(marker);
	};


	self.getMap = function() {
		return this.map;
	};

	//returns a new marker
	self.getMarker = function(animal) {
		var marker = new google.maps.Marker({
 				position: {lat: animal.lat, lng: animal.lng},
             	map: this.map,
				title: animal.anName,
				animation: google.maps.Animation.DROP
	    });

	    marker.animal = animal;
	    //when the active parameter changes, the animation is set accordingly.
		marker.active = ko.observable(false);
		marker.active.subscribe(function() {
			if(marker.active()) {
				marker.setAnimation(google.maps.Animation.BOUNCE);

			} else {
			//no more animation
				marker.setAnimation(null);

			}
		});
		//simple infoWindow with the title as content
		marker.infowindow = new google.maps.InfoWindow({
  			content: marker.animal.title
  		});
		//which gets open when the marker is clicked.
	   google.maps.event.addListener(marker, 'click', function() {
	   	if(!marker.active()){
  			marker.infowindow.open(this.map,marker);
  		}
  		});
		return marker;
	};


};
//The Infoboxmodel deals with the info displayed on the page, which contains the information retrieved
//from the ajax calls, as well as more information on the marker clicked.
var InfoboxModel = function(mapobject) {
	var self = this;
	self.mapObject = mapobject;
	self.map = mapobject.getMap(); //save the actual google map

	self.selectedAnimal = ko.observable(null);
	self.lastAnimal =null;
	/*subscribe to changes of selectedAnimal manually in order to update the google map markers, fire ajax when the
	selected animal has changed, pan to the marker belonging to the animal.

	*/
	self.selectedAnimal.subscribe(function() {
		if(self.selectedAnimal()===self.lastAnimal) {
			//this means, the button or the marker has been clicked again, hence we close infoBubble and set to inactive
			self.selectedAnimal(null);
		} else {
			if(self.selectedAnimal()!==null){

				var aniName = self.selectedAnimal().anName;

				//whenever the selected Animal changes, we fire the ajax
				//Wikipedia
				self.wikiAjax(aniName);
				//Flickr
				self.flickrAjax(aniName);
				//self.mapObject.openInfoBubble(self.selectedAnimal().myMarkers[0]);

				self.mapObject.panToMarker(self.selectedAnimal().myMarkers[0]);
				self.selectedAnimal().myMarkers.forEach(function(marker) {
					marker.active(true);
				});
			}
		}
		//remove old flickrMarkers
		self.mapObject.resetflickrMarkers();
		self.flickrImages([]);

		//save this animal even on change, ...
		if(self.lastAnimal===null) {
			self.lastAnimal=self.selectedAnimal();

		} else {
			//... becauseall markers of last animal need to be deactivated
			self.lastAnimal.myMarkers.forEach(function(marker) {
				marker.active(false);
			});
			self.lastAnimal=self.selectedAnimal();
		}
	});

	/*self.clearSelection = function() {
		self.selectedAnimal(null);
	};*/
	//this needs to be called fromm the marker as well as the filter list
	self.setSelectedAnimal = function(data) {
		self.selectedAnimal(data);
	};
	self.getSelectedAnimal = function() {
		return self.selectedAnimal();
	};


//the ajax calls, whose results are directly pumped into ko observables
    self.wikiLink = ko.observable("");
	self.wikiParagraph = ko.observable("");
    self.wikiAjax = function(query) {
    	self.wikiParagraph( "Please wait while info is being loaded");
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+query+
    	'&format=json&callback=wikiCallback';

    	$.ajax({
        	url: wikiURL,
        	dataType: "jsonp",
        	success: function ( response ) {
				self.wikiLink('http://en.wikipedia.org/wiki/' + response[1][0]);
				self.wikiParagraph( response[2][0]);
        	},
        	error: function (e) {
        		self.wikiParagraph("There has been an error retrieving data from Wikipedia. Sorry about that!");
        	}
   		 });
	};


	//flickrImage data gets saved in an array. bound to a hidden div, which becomes part of Infobubble
	self.flickrImages = ko.observableArray([]);
	self.flickrMessage = ko.observable("");
	self.flickrAjax = function(query) {
		// key b6c9f7719ed5609ad7c941035ef290f9
		//secret  56a751a4c0def0eeio
		self.flickrMessage("Please wait while content is being loaded");
		var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b6c9f7719ed5609ad7c941035ef290f9';

		flickrURL += "&content_type=1";
		flickrURL+="&tags=" + query;

		//search only for pics in the area of my map!
		//-39.035283, 140.740863
		//-36.526291, 147.019550
		flickrURL+="&bbox=140.740,-39.035,147.019,-36.526";
		//get the URL to the image thumbnail and original as well, and the geo information
		flickrURL+="&extras=url_t,url_o,geo";
		flickrURL+="&format=json";

		flickrURL+="&jsoncallback=?";
		$.getJSON( flickrURL, function( data ) {

			self.flickrImages([]);
			data.photos.photo.forEach(function(flick) {
       	 		self.mapObject.addFlickrMarker(parseFloat(flick.longitude),parseFloat(flick.latitude),flick.title);
       	 	});
			var showArray = [];
			if(data.photos.photo.length < 15) {
				showArray = data.photos.photo;
			} else {
				//pick 15 random pictures from the original array;
				for(var i = 0; i < 15; i++ ) {
					var index = Math.floor(Math.random() * data.photos.photo.length);
 					showArray.push(data.photos.photo[index]);
 					data.photos.photo.splice(index,1);
				}
			}

			var helperArray = [];
       	 	for(var j = 0; j < showArray.length; j++) {
       	 		var photoItem = {};
       	 		photoItem.title = showArray[j].title;
       	 		photoItem.o_url = showArray[j].url_o;
       	 		photoItem.t_url = showArray[j].url_t;
       	 		helperArray[j]=photoItem;
       	 	}

       	 	self.flickrImages(helperArray);
       	 	self.flickrMessage("");
    	}).error(function(e) {
    		self.flickrMessage("There has been an error retrieving data from Flickr. Sorry about that!");
    	});
	};
};

// ko Viewmodel, this one deals with the searchmenu and filter list
var ViewModel = function(map) {


	var self = this;
	self.mapObject = map;
	self.filteredAnimal=ko.observable("");

	/*self.filteredAnimal.subscribe( function() {
		self.setSelectedAnimal(null);
	})*/

	//save all animals in an obserable array, the list gets updated accordingly
	self.animalList = ko.observableArray([]);
	initialAnimals.forEach( function(animalItem) {
		//add the google maps markers
		var marker = self.mapObject.getMarker(animalItem);
		//the listener is added here, because ViewModel knows the infoboxmodel, while map does not
		marker.addListener('click', function() {
			self.ibm.setSelectedAnimal(marker.animal);
		});
		//also, I wanted to have everything togethere, therefore the marker is saved in the animalitem. ibm can then handle active of the marker.
		animalItem.myMarkers.push(marker);
		//add active subscriptions to each marker, which will toggle animation and close infoBubbles if active(false)
		self.animalList().push(animalItem);
	});

//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();
		//arrayFilter just compares the list with the given string
		return   ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal.anName.toLowerCase().indexOf(search) >= 0;
        	animal.myMarkers.forEach(function(marker){
        		marker.setVisible(show);
        		if(!show) {
        			marker.infowindow.close();
        		}
        	});
        	return show;
    	});

	});

	self.setibm = function(ibm){
		self.ibm=ibm;
	};

	self.setSelectedAnimal = function(data){
		if(window.innerWidth < 400) {
			self.showFilterList(false);
		}
		self.ibm.setSelectedAnimal(data);
	};

	self.getSelectedElement = function() {
		return self.ibm.getSelectedAnimal();

	};


		self.showFilterList = ko.observable(true);
		self.searchmenuVisible = ko.observable(true);

		//here, some more or leess rather ugly queries must be made in order to set the variables according to the
		//media querys which handle css on different devices.
		self.setVisibilities = function() {
			self.showFilterList(true);
			self.searchmenuVisible(true);
			if(window.innerWidth < 400 ) {
				self.showFilterList(false);
			}
			//workaround to see if landscape on a small screen...
			if(window.innerWidth > window.innerHeight && window.innerHeight < 400) {
				self.searchmenuVisible(false);
			}
		};

		self.setVisibilities();
		self.showList = function() {
			if(window.innerWidth < 400 ) {
				self.showFilterList(!self.showFilterList());
			}
		};

		self.landscapetoggle = function() {
			self.searchmenuVisible(!self.searchmenuVisible());

		};
		//on each resize, the visibilites need to be set new, so the knockout bindings get updated correctly, and it is
		//in synch with the css media queries.
		$(window).resize(function(){
    		self.setVisibilities();
		});
};



function initialize() {
  var map = new Map();
  map.initialize();


  var vm = new ViewModel(map);

  var ibm = new InfoboxModel(map);
  vm.setibm(ibm);

  //here, a section of the html is excluded from binding, this was necessary because otherwise i couldn't divide it into two
  //parts due to the structure, see html
  ko.bindingHandlers.stopBinding = {
    init: function() {
        return { controlsDescendantBindings: true };
    }
  };

  ko.applyBindings(vm); //whole doc except when data-bind stopBinding is found , its descendants are ignored
  ko.applyBindings(ibm, $("#tabs")[0]); //only #tabs and its descendants which is a descendant of the element with stopBinding

  //only call this once, so jquerys tabs are displayed nicely.
	$("#tabs").tabs({
			  active:0
	});


}


/*

comments
readme file

*/