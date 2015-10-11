var INFOTABTITLE = "Pic and Info";
var FLICKRTABTITLE = "Flickr Images";
var initialAnimals=[
	{
		anName: "Southern Right Whale",
		imgSrc: "http://www.australiananimallearningzone.com/wp-content/uploads/2012/09/Southern-Right-Whale-Pictures-300x272.jpg",
		lat: [-38.428914],
		lng: [142.521175],
		dateSeen: ["02.09.2015"],
		myMarkers: []
	},
	{
		anName: "Wallaby",
		imgSrc: "img/kang.jpg",
		lat: [-38.698435,-38.501899],
		lng: [143.229360,145.238695],
		dateSeen: ["02.09.2015","16.09.2015"],
		myMarkers: []
	},
	{
		anName: "Echidna",
		imgSrc: "img/echidna.jpg",
		lat: [-37.181397],
		lng: [145.861132],
		dateSeen: ["02.10.2015"],
		myMarkers: []
	},
	{
		anName: "Little Penguin",
		imgSrc: "img/littlePenguin.jpg",
		lat: [-38.514876],
		lng: [145.144377],
		dateSeen: ["16.09.2015"],
		myMarkers: []
	},
	{
		anName: "Possum",
		imgSrc: "img/possum.jpg",
		lat: [-37.930777],
		lng: [145.111319],
		dateSeen: ["20.08.2015"],
		myMarkers: []
	},
	{
		anName: "Koala",
		imgSrc: "img/koala.jpg",
		lat: [-38.805814],
		lng: [143.535075],
		dateSeen: ["02.09.2015"],
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
	    this.overlay = new google.maps.OverlayView();
	    this.overlay.draw = function() {};
    	this.overlay.setMap(this.map);
    /*google.maps.event.addListenerOnce(map, 'idle', function() {
        callback();
    });*/
		//add some additional elements to the map: filter search box
		var searchControlDiv = document.getElementById('filter');
    	searchControlDiv.index = 1;
    	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchControlDiv);

    	//and the list view
    	var listv = document.getElementById('listview');
    	listv.index=0;
    	this.map.controls[google.maps.ControlPosition.LEFT].push(listv);


	}

	this.getMap = function() {
		return this.map;
	}

	this.getOverlay = function() {
		return this.overlay;
	}

};


// ko Viewmodel
var ViewModel = function(map, overlay) {


	var self = this;
	self.map = map; //save the actual google map
	self.overlay = overlay;
	self.filteredAnimal=ko.observable("");
	self.selectedAnimal = ko.observable();
	self.lastAnimal =null;
	self.selectedAnimal.subscribe(function() {
		//whenever the selected Animal changes, we fire the ajax
		//Wikipedia
		self.wikiAjax(self.selectedAnimal().anName);
		//Flickr

		//all the markers of this animal are set to active
		self.selectedAnimal().myMarkers.forEach(function(marker) {
			marker.active(true);
		});
		if(self.lastAnimal===null) {
			self.lastAnimal=self.selectedAnimal();

		} else {
			//all markers of last animal need to be deactivated
			self.lastAnimal.myMarkers.forEach(function(marker) {
				marker.active(false);
			})
			self.lastAnimal=self.selectedAnimal();
		}
	});


//set up the info bubble, its content changing based on the selected animal.
	self.infoBubble = new InfoBubble({
		disableAutoPan: true,
		borderRadius: 0,
		arrowSize: 0

	});
	self.infoBubble.addTab(INFOTABTITLE, $("#infContent").html());
	self.infoBubble.addTab(FLICKRTABTITLE, $("#flickrContent").html());
	self.wikiLink = ko.observable("");
	self.wikiParagraph = ko.observable("");

	self.flickrImages = ko.observableArray([]);
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
				name: animalItem.anName,
				animation: google.maps.Animation.DROP
	         });
			marker.active = ko.observable(false);
			marker.id = i + "-" + marker.name;
			//add click listeners to the markers, setting the current selected Animal.
			marker.addListener('click', (function(animal) {
    			return function() {

    				self.selectedAnimal(animalItem);
    			};
  			})(animalItem));
			animalItem.myMarkers.push(marker);
		}
		//add active subscriptions to each marker, which will toggle animation and close infoBubbles if active(false)
		animalItem.myMarkers.forEach( function(marker) {
			marker.active.subscribe(function() {

				if(marker.active()) {
					marker.setAnimation(google.maps.Animation.BOUNCE);

				} else {
					//no more animation
					marker.setAnimation(null);
					//the infobubble get closed as well
					self.infoBubble.close(self.map,marker);
				}

			});
		});
		self.animalList().push(animalItem);
	});

//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();

		return  ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal.anName.toLowerCase().indexOf(search) >= 0;
        	animal.myMarkers.forEach(function(marker){
        		marker.setVisible(show);
        	});
        	return show;
    	});

	});

	// document.getElementById("listview").size = sizeVal;

//on selecting an animal, the infowindow is displayed and the markers set to bouncing. the last selected animal
//is recorded in order to unbounce their markers.

//helper function which is called when clicking on a marker which are not bound to knockout.
	self.wikiAjax = function(query) {
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+query+
    	'&format=json&callback=wikiCallback';

    	$.ajax({
        	url: wikiURL,
        	dataType: "jsonp",
        	success: function ( response ) {
				self.wikiLink('http://en.wikipedia.org/wiki/' + response[1][0]);
				self.wikiParagraph( response[2][0]);
				//only after success open the info bubble
				self.flickrAjax(self.selectedAnimal().anName);


        	}
   		 });
	};

	self.flickrAjax = function(query) {
		// key b6c9f7719ed5609ad7c941035ef290f9
		//secret  56a751a4c0def0eeio
		var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b6c9f7719ed5609ad7c941035ef290f9';

		flickrURL += "&content_type=1";
		flickrURL+="&tags=" + query;

		//search only for pics in the area of my map!
		flickrURL+="&bbox=142,-39,146,-36";
		//get the URL to the image thumbnail and original as well, and the geo information
		flickrURL+="&extras=url_t,url_o,geo";
		flickrURL+="&format=json";

		flickrURL+="&jsoncallback=?";
		$.getJSON( flickrURL, function( data ) {
			var photoItem = {};
			self.flickrImages([]);
			var showArray = [];
			if(data.photos.photo.length < 15) {
				showArray = data.photos.photo;
			} else {
				//pick 15 random pictures from the original array;
				for(var i = 0; i < 15; i++ ) {
					console.log(data.photos.photo.length);
					var index = Math.floor(Math.random() * data.photos.photo.length);
 					showArray.push(data.photos.photo[index]);
 					data.photos.photo.splice(index,1);
				}
			}
       	 	showArray.forEach( function(photo) {
       	 		photoItem.title = photo.title;
       	 		photoItem.o_url = photo.url_o;
       	 		photoItem.t_url = photo.url_t;
       	 		photoItem.lon = photo.longitude;
       	 		photoItem.lat = photo.latitude;
       	 		self.flickrImages.push(photoItem);
       	 	});
         self.openInfoBubble();

    	}).error(function(e) {
    		console.log(e);
    	});
	}

	self.openInfoBubble = function() {
		//only one infoBubble, even if more markers are present, so only the first marker
		var marker = self.selectedAnimal().myMarkers[0];
		var pixPosition = self.overlay.getProjection().fromLatLngToDivPixel(marker.getPosition());
		var xPix = pixPosition.x;
		var yPix = pixPosition.y;
		var contentWidth = $("#infContent").width();
		var contentHeight = $("#infContent").height();
		if(xPix > window.innerWidth-contentWidth/2) {
			//we are too close to the right edge
			xPix = window.innerWidth - contentWidth/2 -20;
		}
		if(xPix < contentWidth/2) {
			//too close to the left edge
			xPix = contentWidth/2 + 20;
		}

		if(yPix < contentHeight) {
			yPix = yPix+ contentHeight + 30;
		} else {
			yPix = yPix - 50;
		}

		var tmp = new google.maps.Point(xPix,yPix);

		var lngLatPos = self.overlay.getProjection().fromDivPixelToLatLng(new google.maps.Point(xPix,yPix));
		self.infoBubble.updateTab(0,INFOTABTITLE,$("#infContent").html());
		self.infoBubble.updateTab(1,FLICKRTABTITLE,$("#flickrContent").html());
		self.infoBubble.open(self.map);
		//self.infoBubble().open(self.map,self.selectedAnimal().myMarkers[0]());
		self.infoBubble.setPosition(lngLatPos);
		self.infoBubble.setZIndex(2000);
	};


}



//AIzaSyBvSyOJDU2J8YelkMVS4LGsuI0KVNGqu-I
$(window).load(function() {
  var map = new Map();
  map.initialize();
  ko.applyBindings(new ViewModel(map.getMap(), map.getOverlay()));
  //testData();


});