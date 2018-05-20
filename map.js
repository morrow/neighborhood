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
      if (window.info_windows) {
        ref = window.info_windows;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          window_info = ref[j];
          results.push(window_info.close());
        }
        return results;
      }
    })
    google.maps.event.addDomListener(window, 'resize', ()=> google.maps.event.trigger(map, 'resize'))
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
        });
        info_windows[i] = new google.maps.InfoWindow({
          content: `<div class='info_window'><div class='title'>${location.name}</div><div class='description'>${location.description}</div></div>`
        });
        google.maps.event.addListener(markers[i], 'click', function() {
          this.setAnimation(google.maps.Animation.BOUNCE);
          let marker = this
          window.setTimeout(()=>{
            marker.setAnimation(null)
          }, 500)
          var j, len, ref, window_info;
          ref = info_windows;
          for (j = 0, len = ref.length; j < len; j++) {
            window_info = ref[j];
            window_info.close();
          }
          return info_windows[this.id].open(google_map, this);
        });
      }
    }
  }

  initialize()
  setMarkers()

  return { initialize, setMarkers }

}