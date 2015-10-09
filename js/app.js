
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


    	var listv = document.getElementById('listview');
    	listv.index=1;
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
	self.selectedAnimal.subscribe(function() {
		//whenever the selected Animal changes, we fire the ajax
		//Wikipedia
		self.wikiAjax(self.selectedAnimal().anName);
		//all the markers of this animal are set to active
		self.selectedAnimal().myMarkers.forEach(function(marker) {
			marker().active(true);
		});
		if(self.lastAnimal()===null) {
			self.lastAnimal(self.selectedAnimal());

		} else {
			//all markers of last animal need to be deactivated
			self.lastAnimal().myMarkers.forEach(function(marker) {
				marker().active(false);
			})
			self.lastAnimal(self.selectedAnimal());
		}
	});
	self.lastAnimal = ko.observable(null);

//set up the info bubble, its content changing based on the selected animal.
	self.infoBubble = ko.observable(new InfoBubble({
		disableAutoPan: true,
		content: $("#infContent").html(),
		borderRadius: 0,

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
			var marker = ko.observable(new google.maps.Marker({
 				position: {lat: alat, lng: alng},
             	map: self.map,
				name: animalItem.anName,
				animation: google.maps.Animation.DROP
	         }));
			marker().active = ko.observable(false);
			marker().id = i + "-" + marker().name;
			//add click listeners to the markers, setting the current selected Animal.
			marker().addListener('click', (function(animal) {
    			return function() {

    				self.selectedAnimal(animalItem);
    			};
  			})(animalItem));
			animalItem.myMarkers.push(marker);
		}
		//add active subscriptions to each marker, which will toggle animation and close infoBubbles if active(false)
		animalItem.myMarkers.forEach( function(marker) {
			marker().active.subscribe(function() {
				console.log("Marker active has been changed: " + marker().active() + " -  " + marker().id);
				if(marker().active()) {
					marker().setAnimation(google.maps.Animation.BOUNCE);

				} else {
					//no more animation
					marker().setAnimation(null);
					//the infobubble get closed as well
					self.infoBubble().close(self.map,marker());
				}

			});
		});
		self.animalList().push(animalItem);
	});

	self.listSize = ko.computed(function() {
		return self.animalList().length;
	});
//the list shows only the entrys matching the content of the search box
	self.filteredItems = ko.computed(function() {
		var search  = self.filteredAnimal().toLowerCase();

		var tmp = ko.utils.arrayFilter(self.animalList(), function (animal) {
        	var show = animal.anName.toLowerCase().indexOf(search) >= 0;
        	animal.myMarkers.forEach(function(marker){
        		marker().setVisible(show);
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
				self.openInfoBubble();

        	}
   		 });
	};

	self.openInfoBubble = function() {
		//only one infoBubble, even if more markers are present, so only the first marker
		var marker = self.selectedAnimal().myMarkers[0];
		console.log("initial pos: " + marker().getPosition());
		var pixPosition = self.overlay.getProjection().fromLatLngToDivPixel(marker().getPosition());

		var xPix = pixPosition.x;
		var yPix = pixPosition.y;
		var contentWidth = $("#infContent").width();
		var contentHeight = $("#infContent").height();
		if(xPix > window.innerWidth-contentWidth/2) {
			//we are too close to the right edge
			console.log("a");
			xPix = window.innerWidth - contentWidth/2 -20;
		}
		if(xPix < contentWidth/2) {
			console.log("b");
			//too close to the left edge
			xPix = contentWidth/2;
		}

		if(yPix < contentHeight) {
			yPix = yPix+ contentHeight + 30;
		} else {
			yPix = yPix - 50;
		}

		var tmp = new google.maps.Point(xPix,yPix);

		var lngLatPos = self.overlay.getProjection().fromDivPixelToLatLng(new google.maps.Point(xPix,yPix));
		console.log("new pos" + lngLatPos);
		self.infoBubble().setContent($("#infContent").html());
		self.infoBubble().open(self.map);
		//self.infoBubble().open(self.map,self.selectedAnimal().myMarkers[0]());
		self.infoBubble().setPosition(lngLatPos);
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
  ko.applyBindings(new ViewModel(map.getMap(), map.getOverlay()));
  //testData();


});