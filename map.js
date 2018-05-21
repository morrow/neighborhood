Map = (getVisibleItems, getAllItems, target='map', map_config={})=> {
  var markers = []
  var info_windows = []
  var map_options = {
    zoom: 14,
    center: new google.maps.LatLng(32.7915092,-79.9407845),
    styles: [
      {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
          { "visibility": "off" }
        ]
      },
      {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#193341"
              }
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#2c5a71"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#29768a"
              },
              {
                  "lightness": -37
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#406d80"
              }
          ]
      },
      {
          "featureType": "transit",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#406d80"
              }
          ]
      },
      {
          "elementType": "labels.text.stroke",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#3e606f"
              },
              {
                  "weight": 2
              },
              {
                  "gamma": 0.84
              }
          ]
      },
      {
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "color": "#999999"
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [
              {
                  "weight": 0.6
              },
              {
                  "color": "#1a3541"
              }
          ]
      },
      {
          "elementType": "labels.icon",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#2c5a71"
              }
          ]
      }
  ]
  }
  const initialize = ()=>{
    google_map = new google.maps.Map(document.getElementById(target), map_options);
    google.maps.event.addListener(google_map, 'click', function() {
      var j, len, ref, results, window_info;
      if (info_windows) {
        ref = info_windows;
        for (j = 0, len = ref.length; j < len; j++) {
          window_info = ref[j];
          window_info.close();
        }
      }
    })
    google.maps.event.addDomListener(window, 'resize', ()=> google.maps.event.trigger(map, 'resize'))
  }

  const showWindow = (marker)=>{
    if(typeof marker == "number"){
      marker =  markers[marker]
    }
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(()=>{
      marker.setAnimation(null)
    }, 500)
    var j, len, ref, window_info;
    ref = info_windows;
    for (j = 0, len = ref.length; j < len; j++) {
      window_info = ref[j];
      window_info.close();
    }
    if(info_windows[marker.id].getContent().indexOf('yelp-info')<0){
      getYelpInfo(getAllItems()[marker.id]).then((data)=>{
        info_windows[marker.id].setContent(info_windows[marker.id].getContent().replace("<div class='loading'>loading yelp info...</div>", '') + processYelpContent(data))
        google_map.panTo(new google.maps.LatLng(info_windows[marker.id].getPosition().lat() + 0.005, info_windows[marker.id].getPosition().lng()))
      })
    }
    return info_windows[marker.id].open(google_map, marker);
  }

  const getStars = (rating)=> {
    let stars = ''
    for(var i = 0; i < 5; i++){
      stars += i < parseFloat(rating) ? '★' : '☆'
    }
    if(rating % 1 > 0){
      // stars += '☆'
    }
    return stars
  }

  const processYelpContent = (content)=>{
    let business = content.businesses[0]
    if(business == undefined){
      return ''
    }
    console.log(business)
    return `<div class='yelp-info'>
              <div class='image'><img src='${business.image_url}' /></div>`
              + (business.price ? `<div class='price'>${business.price}</div>` : '')
              + (business.rating ? `<div class='rating'>${getStars(Math.round(business.rating))}</div>` : '')
              + (business.location ? `<div class='address'><a href='https://www.google.com/maps/place/${business.location.display_address.join('+')}' target='_blank'>${business.location.display_address.join(' ')}</div>` : '')
              + (business.display_phone ? `<div class='phone'><a href='tel:business.phone'>${business.display_phone}</a></div>` : '')
              + `<div class='powered-by'>Powered by <a href='${business.url}' target='_blank'>yelp</a></div>
            </div>`
  }


  const setMarkers = function(animate=true) {
    var i, location, myLatLng, results, shape;
    let visible_items = getVisibleItems()
    let all_items = getAllItems()
    let visible_ids = Object.values(visible_items).map(k=>parseInt(k.id))
    let all_ids = Object.keys(all_items).map(k=>parseInt(k))
    for(i = 0; i < all_ids.length; i++){
      if(visible_ids.indexOf(i) >= 0 && markers[i] != undefined){
        if(markers[i].getMap() == null){
          markers[i].setMap(google_map)
        }
      } else if(markers[i] != undefined){
        markers[i].setMap(null)
      } else {
        location = all_items[i];
        let icon = {
          path: fontawesome.markers[location.icon.toUpperCase().replace(/-/g, '_')],
          scale: 0.5,
          strokeWeight: 0.5,
          strokeColor: map_config[location.category].strokeColor,
          strokeOpacity: 1,
          fillColor: map_config[location.category].fillColor,
          fillOpacity: 0.95,
        }
        myLatLng = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
        markers[i] = new google.maps.Marker({
          animation: animate ? google.maps.Animation.DROP : null,
          id: i,
          position: myLatLng,
          map: google_map,
          icon: icon,
          shape: fontawesome.markers[location.icon.toUpperCase().replace(/-/g, '_')],
          title: location.name,
          _location: location,
        });
        info_windows[i] = new google.maps.InfoWindow({
          content: `
<div id='${i}' class='info_window'>
  <div class='title'>${location.name}</div>
  <div class='description'>${location.description}</div>
  <div class='loading'>loading yelp info...</div>
</div>`
        });
        google.maps.event.addListener(markers[i], 'click', function() {
          let that = this
          showWindow(that)
        });
      }
    }
  }

  initialize()
  setMarkers()

  return { initialize, setMarkers, showWindow }

}