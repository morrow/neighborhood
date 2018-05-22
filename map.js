const MAP_STYLES = [
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

GoogleMap = (getVisibleItems, getAllItems, target='map', map_config={})=> {
  var markers = []
  var info_windows = []
  var bounds = new google.maps.LatLngBounds();
  var map_options = {
    zoom: 14,
    center: new google.maps.LatLng(32.7915092,-79.9407845),
    styles: MAP_STYLES,
    mapTypeControlOptions: { mapTypeIds: [] }
  }

  const initialize = ()=>{
    // create map
    google_map = new google.maps.Map(document.getElementById(target), map_options);
    // close info windows when map is clicked
    google.maps.event.addListener(google_map, 'click', function() {
      info_windows.map(w=>w.close())
    })
    // resize map when window resizes
    google.maps.event.addDomListener(window, 'resize', ()=> {
      google.maps.event.trigger(map, 'resize')
      google_map.fitBounds(bounds)
    })
  }

  const showWindow = (marker)=>{
    // get marker if index supplied instead of marker object
    if(typeof marker == "number"){
      marker =  markers[marker]
    }
    // give marker a bounce animation
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(()=>{
      marker.setAnimation(null)
    }, 1000)
    // close all info windows
    info_windows.map(w=>w.close())
    let info = info_windows[marker.id]
    // load and append yelp info if not already added
    if(info.getContent().indexOf('yelp-info')<0){
      getYelpInfo(getAllItems()[marker.id]).then((data)=>{
        info.setContent(info.getContent().replace("<div class='loading'>loading yelp info...</div>", '') + processYelpContent(data))
        google_map.panTo(new google.maps.LatLng(info.getPosition().lat() + 0.0075, info.getPosition().lng()))
      }).catch((error)=>{
        info.setContent(info.getContent().replace("<div class='loading'>loading yelp info...</div>", '<div class="loading">Error loading yelp content.</div>'))
      })
    }
    // open info window
    return info.open(google_map, marker);
  }

  const getStars = (rating)=> {
    let stars = ''
    for(var i = 0; i < 5; i++){
      stars += i < parseFloat(rating) ? '★' : '☆'
    }
    return stars
  }

  const processYelpContent = (content)=>{
    let business = content.businesses[0]
    if(business == undefined){
      return ''
    }
    return `<div class='yelp-info'>
              <div class='image'><img src='${business.image_url}' /></div>`
              + (business.price ? `<div class='price'>${business.price}</div>` : '')
              + (business.rating ? `<div class='rating'>${getStars(Math.round(business.rating))}</div>` : '')
              + (business.location ? `<div class='address'><a href='https://www.google.com/maps/place/${business.name}/@${business.coordinates.latitude + ',' + business.coordinates.longitude}' target='_blank'>${business.location.display_address.join(' ')}</a></div>` : '')
              + (business.display_phone ? `<div class='phone'><a href='tel:business.phone'>${business.display_phone}</a></div>` : '')
              + `<div class='powered-by'>Powered by <a href='${business.url}' target='_blank'>yelp</a></div>
            </div>`
  }


  const setMarkers = function(animate=true) {
    // get items
    let all_items = getAllItems()
    let visible_items = getVisibleItems()
    // get ids
    let all_ids = Object.keys(all_items).map(k=>parseInt(k))
    let visible_ids = Object.values(visible_items).map(k=>parseInt(k.id))
    // loop through all ids and add markers if not already added
    for(var i = 0; i < all_ids.length; i++){
      // marker exists and should be visible
      if(visible_ids.indexOf(i) >= 0 && markers[i] != undefined){
        // marker is not currently on map so add it
        if(markers[i].getMap() == null){
          markers[i].setMap(google_map)
        }
      }
      // hide marker
      else if(markers[i] != undefined){
        markers[i].setMap(null)
      }
      // create marker
      else {
        var location = all_items[i];
        // create icon for marker
        let icon = {
          path: fontawesome.markers[location.icon.toUpperCase().replace(/-/g, '_')],
          scale: 0.5,
          strokeWeight: 0.5,
          strokeColor: map_config[location.category].strokeColor,
          strokeOpacity: 1,
          fillColor: map_config[location.category].fillColor,
          fillOpacity: 0.95,
        }
        // set marker coordinates to location coordinates
        var coordinates = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
        // create marker and add to markers
        markers[i] = new google.maps.Marker({
          animation: animate ? google.maps.Animation.DROP : null,
          id: i,
          position: coordinates,
          map: google_map,
          icon: icon,
          shape: fontawesome.markers[location.icon.toUpperCase().replace(/-/g, '_')],
          title: location.name,
          _location: location,
        });
        // extend map bounds to marker position
        bounds.extend(markers[i].getPosition())
        // create info window and add to info windows
        info_windows[i] = new google.maps.InfoWindow({
          content: `<div id='${i}' class='info_window'>
                      <div class='title'>${location.name}</div>
                      <div class='description'>${location.description}</div>
                      <div class='loading'>loading yelp info...</div>
                    </div>`
        });
        // show window when marker is clicked
        google.maps.event.addListener(markers[i], 'click', function() {
          let that = this
          showWindow(that)
        });
      }
    }
  }

  initialize()
  setMarkers()
  google_map.fitBounds(bounds)

  return { initialize, setMarkers, showWindow }

}