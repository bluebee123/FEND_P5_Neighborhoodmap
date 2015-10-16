function initialize(){var a=new Map;a.initialize();var b=new ViewModel(a),c=new InfoboxModel(a);b.setibm(c),ko.bindingHandlers.stopBinding={init:function(){return{controlsDescendantBindings:!0}}},ko.applyBindings(b),ko.applyBindings(c,$("#tabs")[0]),$("#tabs").tabs({active:0})}var INFOTABTITLE="Pic and Info",FLICKRTABTITLE="Flickr Images",initialAnimals=[{anName:"Southern Right Whale",imgSrc:"img/whale.jpg",title:"My horrible pic of a whale",lat:-38.428914,lng:142.521175,dateSeen:"02.09.2015",myMarkers:[]},{anName:"Wallaby",imgSrc:"img/kang.jpg",title:"Feeding the Wallaby",lat:-38.698435,lng:143.22936,dateSeen:"02.09.2015",myMarkers:[]},{anName:"Echidna",imgSrc:"img/echidna.jpg",title:"Lucky find while hiking",lat:-37.181397,lng:145.861132,dateSeen:"02.10.2015",myMarkers:[]},{anName:"Little Penguin",imgSrc:"img/littlePenguin.jpg",title:"© Penguin Parade, http://www.penguins.org.au",lat:-38.514876,lng:145.144377,dateSeen:"16.09.2015",myMarkers:[]},{anName:"Possum",imgSrc:"img/possum.jpg",title:"Possum in a tree",lat:-37.930777,lng:145.111319,dateSeen:"20.08.2015",myMarkers:[]},{anName:"Koala",imgSrc:"img/koala.jpg",title:"Koala by the road",lat:-38.805814,lng:143.535075,dateSeen:"02.09.2015",myMarkers:[]}],Map=function(){var a=this;this.initialize=function(){a.map=new google.maps.Map(document.getElementById("map"),{center:{lat:-37.918,lng:143.976},zoom:8,mapTypeControl:!1,streetViewControl:!1}),a.flickrMarkers=[]},a.panToMarker=function(b){a.map.panTo(b.position)},a.resetflickrMarkers=function(){a.flickrMarkers.forEach(function(a){a.setVisible(!1)}),a.flickerMarkers=[]},a.addFlickrMarker=function(b,c,d){var e=new google.maps.Marker({position:{lat:c,lng:b},map:this.map,title:d,icon:"img/zoo.png"});a.flickrMarkers.push(e)},a.getMap=function(){return this.map},a.getMarker=function(a){var b=new google.maps.Marker({position:{lat:a.lat,lng:a.lng},map:this.map,title:a.anName,animation:google.maps.Animation.DROP});return b.animal=a,b.active=ko.observable(!1),b.active.subscribe(function(){b.active()?b.setAnimation(google.maps.Animation.BOUNCE):b.setAnimation(null)}),b.infowindow=new google.maps.InfoWindow({content:b.animal.title}),google.maps.event.addListener(b,"click",function(){b.active()||b.infowindow.open(this.map,b)}),b}},InfoboxModel=function(a){var b=this;b.mapObject=a,b.map=a.getMap(),b.selectedAnimal=ko.observable(null),b.lastAnimal=null,b.selectedAnimal.subscribe(function(){if(b.selectedAnimal()===b.lastAnimal)b.selectedAnimal(null);else if(null!==b.selectedAnimal()){var a=b.selectedAnimal().anName;b.wikiAjax(a),b.flickrAjax(a),b.mapObject.panToMarker(b.selectedAnimal().myMarkers[0]),b.selectedAnimal().myMarkers.forEach(function(a){a.active(!0)})}b.mapObject.resetflickrMarkers(),b.flickrImages([]),null===b.lastAnimal?b.lastAnimal=b.selectedAnimal():(b.lastAnimal.myMarkers.forEach(function(a){a.active(!1)}),b.lastAnimal=b.selectedAnimal())}),b.setSelectedAnimal=function(a){b.selectedAnimal(a)},b.getSelectedAnimal=function(){return b.selectedAnimal()},b.wikiLink=ko.observable(""),b.wikiParagraph=ko.observable(""),b.wikiAjax=function(a){b.wikiParagraph("Please wait while info is being loaded");var c="http://en.wikipedia.org/w/api.php?action=opensearch&search="+a+"&format=json&callback=wikiCallback";$.ajax({url:c,dataType:"jsonp",success:function(a){b.wikiLink("http://en.wikipedia.org/wiki/"+a[1][0]),b.wikiParagraph(a[2][0])},error:function(a){b.wikiParagraph("There has been an error retrieving data from Wikipedia. Sorry about that!")}})},b.flickrImages=ko.observableArray([]),b.flickrMessage=ko.observable(""),b.flickrAjax=function(a){b.flickrMessage("Please wait while content is being loaded");var c="https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b6c9f7719ed5609ad7c941035ef290f9";c+="&content_type=1",c+="&tags="+a,c+="&bbox=140.740,-39.035,147.019,-36.526",c+="&extras=url_t,url_o,geo",c+="&format=json",c+="&jsoncallback=?",$.getJSON(c,function(a){b.flickrImages([]),a.photos.photo.forEach(function(a){b.mapObject.addFlickrMarker(parseFloat(a.longitude),parseFloat(a.latitude),a.title)});var c=[];if(a.photos.photo.length<15)c=a.photos.photo;else for(var d=0;15>d;d++){var e=Math.floor(Math.random()*a.photos.photo.length);c.push(a.photos.photo[e]),a.photos.photo.splice(e,1)}for(var f=[],g=0;g<c.length;g++){var h={};h.title=c[g].title,h.o_url=c[g].url_o,h.t_url=c[g].url_t,f[g]=h}b.flickrImages(f),b.flickrMessage("")}).error(function(a){b.flickrMessage("There has been an error retrieving data from Flickr. Sorry about that!")})}},ViewModel=function(a){var b=this;b.mapObject=a,b.filteredAnimal=ko.observable(""),b.animalList=ko.observableArray([]),initialAnimals.forEach(function(a){var c=b.mapObject.getMarker(a);c.addListener("click",function(){b.ibm.setSelectedAnimal(c.animal)}),a.myMarkers.push(c),b.animalList().push(a)}),b.filteredItems=ko.computed(function(){var a=b.filteredAnimal().toLowerCase();return ko.utils.arrayFilter(b.animalList(),function(b){var c=b.anName.toLowerCase().indexOf(a)>=0;return b.myMarkers.forEach(function(a){a.setVisible(c),c||a.infowindow.close()}),c})}),b.setibm=function(a){b.ibm=a},b.setSelectedAnimal=function(a){window.innerWidth<400&&b.showFilterList(!1),b.ibm.setSelectedAnimal(a)},b.getSelectedElement=function(){return b.ibm.getSelectedAnimal()},b.showFilterList=ko.observable(!0),b.searchmenuVisible=ko.observable(!0),b.setVisibilities=function(){b.showFilterList(!0),b.searchmenuVisible(!0),window.innerWidth<400&&b.showFilterList(!1),window.innerWidth>window.innerHeight&&window.innerHeight<400&&b.searchmenuVisible(!1)},b.setVisibilities(),b.showList=function(){window.innerWidth<400&&b.showFilterList(!b.showFilterList())},b.landscapetoggle=function(){b.searchmenuVisible(!b.searchmenuVisible())},$(window).resize(function(){b.setVisibilities()})};