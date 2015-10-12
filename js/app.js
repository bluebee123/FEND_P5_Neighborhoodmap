var INFOTABTITLE = "Pic and Info";
var FLICKRTABTITLE = "Flickr Images";
var initialAnimals=[
	{
		anName: "Southern Right Whale",
		imgSrc: "http://www.australiananimallearningzone.com/wp-content/uploads/2012/09/Southern-Right-Whale-Pictures-300x272.jpg",
		lat: -38.428914,
		lng: 142.521175,
		dateSeen: "02.09.2015",
		myMarkers: []
	},
	{
		anName: "Wallaby",
		imgSrc: "img/kang.jpg",
		lat: -38.698435,
		lng: 143.229360,
		dateSeen: "02.09.2015",
		myMarkers: []
	},
	{
		anName: "Echidna",
		imgSrc: "img/echidna.jpg",
		lat:-37.181397,
		lng: 145.861132,
		dateSeen: "02.10.2015",
		myMarkers: []
	},
	{
		anName: "Little Penguin",
		imgSrc: "img/littlePenguin.jpg",
		lat: -38.514876,
		lng: 145.144377,
		dateSeen: "16.09.2015",
		myMarkers: []
	},
	{
		anName: "Possum",
		imgSrc: "img/possum.jpg",
		lat: -37.930777,
		lng: 145.111319,
		dateSeen: "20.08.2015",
		myMarkers: []
	},
	{
		anName: "Koala",
		imgSrc: "img/koala.jpg",
		lat: -38.805814,
		lng: 143.535075,
		dateSeen: "02.09.2015",
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
	    	panControl: false,
	    	scrollwheel: false
		});
	    this.overlay = new google.maps.OverlayView();
	    this.overlay.draw = function() {};
    	this.overlay.setMap(this.map);



	};


	this.flickrMarkers = [];

	this.resetflickrMarkers = function() {
		this.flickrMarkers.forEach(function(marker) {
			marker.setVisible(false);
		})
		this.flickerMarkers = [];
	}

	this.addFlickrMarker = function(lon, lat, name) {

		var marker = new google.maps.Marker({
 				position: {lat: lat, lng: lon},
             	map: this.map,
				title: name,
				icon: "img/zoo.png"
	         });

		this.flickrMarkers.push(marker);
	}

	this.getMap = function() {
		return this.map;
	}

	this.getOverlay = function() {
		return this.overlay;
	}

	this.getMarker = function(animal) {
		var marker = new google.maps.Marker({
 				position: {lat: animal.lat, lng: animal.lng},
             	map: this.map,
				title: animal.anName,
				animation: google.maps.Animation.DROP
	    });
		marker.active = ko.observable(false);
		marker.animal = animal;
		marker.active.subscribe(function() {
			if(marker.active()) {
				marker.setAnimation(google.maps.Animation.BOUNCE);

			} else {
			//no more animation
				marker.setAnimation(null);

			}
		});

		return marker;
	};
};

var InfoboxModel = function(mapobject) {
	var self = this;
		self.mapObject = mapobject;
	self.map = mapobject.getMap(); //save the actual google map


	self.flickrDone = ko.observable(false);
	self.wikiDone = ko.observable(false);
	self.ajaxDone = ko.computed( function() {
		return self.wikiDone() && self.flickrDone();
	})


	self.showInfo = ko.computed(function() {
		if(self.ajaxDone() && self.selectedAnimal()!== null) {
			console.log("setting content...");
			self.infowindow.setContent($("#infoWindow").html());
			self.infowindow.open(self.map,self.selectedAnimal().myMarkers[0]);
			  $("#tabs").tabs({
			  		active:0
			  });
		}
		return true;
	})

	self.infowindow = new google.maps.InfoWindow({
        	content: $("#infoWindow").html(),
        	disableAutoPan: true,
        	maxwidth: 300
    });

    google.maps.event.addListener(self.infowindow, 'domready', function() {

   // Reference to the DIV which receives the contents of the infowindow using jQuery
   var iwOuter = $('.gm-style-iw');

   /* The DIV we want to change is above the .gm-style-iw DIV.
    * So, we use jQuery and create a iwBackground variable,
    * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
    */
   var iwBackground = iwOuter.prev();
   // Remove the background shadow DIV
   iwBackground.children(':nth-child(2)').css({'display' : 'none'});
   // Remove the white background DIV
   iwBackground.children(':nth-child(4)').css({'display' : 'none'});

   var test = iwOuter.children(':nth-child(1)').css({'width' : '100%'});
	var iwCloseBtn = iwOuter.next();

	iwCloseBtn.css({'display': 'none'});


	});
	//Wikipedia data which is bound to a display:none div which is the content of the infoBubble
	self.selectedAnimal = ko.observable(null);
	self.lastAnimal =null;
	//subscribe to changes of selectedAnimal manually in order to update the google map markers
	self.selectedAnimal.subscribe(function() {

		$(".activeElement").toggleClass("activeElement");
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

				//TODO: only set content of bubble, not draw whole bubble?!
				//remove the class activeElement from current ones
				var element = $( "a:contains(" + aniName + ")" );
				element.toggleClass('activeElement');
				self.selectedAnimal().myMarkers.forEach(function(marker) {
					marker.active(true);
				});
			}
		}

		//self.mapObject.resetflickrMarkers();


		//all the markers of this animal are set to active

		if(self.lastAnimal===null) {
			self.lastAnimal=self.selectedAnimal();

		} else {
			//all markers of last animal need to be deactivated
			self.lastAnimal.myMarkers.forEach(function(marker) {
				self.infowindow.close();
				marker.active(false);
			})
			self.lastAnimal=self.selectedAnimal();
		}
	});

	self.clearSelection = function() {
		self.selectedAnimal(null);
	}
	self.setSelectedAnimal = function(data) {
		self.selectedAnimal(data);
	}


    self.wikiLink = ko.observable("");
	self.wikiParagraph = ko.observable("");
    self.wikiAjax = function(query) {
    	self.wikiDone(false);
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+query+
    	'&format=json&callback=wikiCallback';

    	$.ajax({
        	url: wikiURL,
        	dataType: "jsonp",
        	success: function ( response ) {
				self.wikiLink('http://en.wikipedia.org/wiki/' + response[1][0]);
				self.wikiParagraph( response[2][0]);
				self.wikiDone(true);
        	}
   		 });
	};


	//flickrImage data gets saved in an array. bound to a hidden div, which becomes part of Infobubble
	self.flickrImages = ko.observableArray([]);
	self.flickrAjax = function(query) {
		// key b6c9f7719ed5609ad7c941035ef290f9
		//secret  56a751a4c0def0eeio
		self.flickrDone(false);
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
       	 	for(var i = 0; i < showArray.length; i++) {
       	 		var photoItem = {};
       	 		photoItem.title = showArray[i].title;
       	 		photoItem.o_url = showArray[i].url_o;
       	 		photoItem.t_url = showArray[i].url_t;
       	 		helperArray[i]=photoItem;
       	 	}

       	 	self.flickrImages(helperArray);

       	 	self.flickrDone(true);

    	}).error(function(e) {
    		console.log(e);
    	});
	}
}

// ko Viewmodel
var ViewModel = function(map) {


	var self = this;
	self.mapObject = map;
	self.filteredAnimal=ko.observable("");



	//save all animals in an obserable array, the list gets updated accordingly
	self.animalList = ko.observableArray([]);
	initialAnimals.forEach( function(animalItem) {
		//add the google maps markers
			var marker = self.mapObject.getMarker(animalItem);
			marker.addListener('click', function() {

				console.log(marker.animal);
				self.ibm.setSelectedAnimal(marker.animal);
			});
			animalItem.myMarkers.push(marker);
		//add active subscriptions to each marker, which will toggle animation and close infoBubbles if active(false)
		self.animalList().push(animalItem);
	});

//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();

		var tmp=  ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal.anName.toLowerCase().indexOf(search) >= 0;
        	animal.myMarkers.forEach(function(marker){
        		marker.setVisible(show);
        	});
        	return show;
    	});
		return tmp;
	});

	self.setibm = function(ibm){
		self.ibm=ibm;
	}

	self.setSelectedAnimal = function(data){
		self.ibm.setSelectedAnimal(data);
	};
	// document.getElementById("listview").size = sizeVal;

//on selecting an animal, the infowindow is displayed and the markers set to bouncing. the last selected animal
//is recorded in order to unbounce their markers.

//helper function which is called when clicking on a marker which are not bound to knockout.



}

function calculateListSize(){
	//font: 15px
	var font = 15+4;
	var offset = 48;
	var height = window.innerHeight;
	var calc = Math.floor((height - offset)/font);
	$("#listview").attr("size",calc);
}
//AIzaSyBvSyOJDU2J8YelkMVS4LGsuI0KVNGqu-I
$(window).load(function() {
  var map = new Map();
  map.initialize();
  var vm = new ViewModel(map);

  var ibm = new InfoboxModel(map);
  vm.setibm(ibm);
   ko.applyBindings(vm,$("#searchmenu")[0]);
  ko.applyBindings(ibm, $("#infoWindow")[0]);

  //testData();
  //calculateListSize();
});

