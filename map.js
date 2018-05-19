Map = (locations, target='map')=> {
  const markers = []
  const info_windows = []
  const map_options = {
    zoom: 12,
    center: new google.maps.LatLng(32.7932092,-79.9407845),
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

  const setMarkers = function() {
    markers.map(m=>m.setMap(null))
    var i, image, location, myLatLng, results, shape;
    image = {
      url: '/marker.png',
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    };
    shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: 'poly'
    };
    i = 0;
    results = [];
    while (i < locations().length) {
      location = locations()[i];
      myLatLng = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
      markers[i] = new google.maps.Marker({
        id: i,
        position: myLatLng,
        map: google_map,
        icon: image,
        shape: shape,
        title: location.name
      });
      info_windows[i] = new google.maps.InfoWindow({
        content: `
<div class='info_window'>
  <div class='title'>${location.title}</div>
  <div class='description'>${location.description}</div>
</div>
`
      });
      google.maps.event.addListener(markers[i], 'click', function() {
        var j, len, ref, window_info;
        ref = info_windows;
        for (j = 0, len = ref.length; j < len; j++) {
          window_info = ref[j];
          window_info.close();
        }
        return info_windows[this.id].open(google_map, this);
      });
      results.push(i++);
    }
    return results;
  }

  initialize()
  setMarkers()

  return { initialize, setMarkers }

}