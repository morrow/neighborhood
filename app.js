const MapView = ()=> {
  return mapConfig = {
    restaurants: {
      strokeColor: 'black',
      fillColor: '#ffffff',
    },
    breweries: {
      strokeColor: 'black',
      fillColor: 'orange',
    },
    parks: {
      strokeColor: 'black',
      fillColor: '#00aa00',
    },
    museums: {
      strokeColor: 'black',
      fillColor: '#993399',
    },
  }
}

const SidebarView = ()=> {
  sidebarClick = (id)=>{
    app.GoogleMap && app.GoogleMap.showWindow ? app.GoogleMap.showWindow(id) : 1
  }
  sidebarAccessClick = ()=> {
    sidebar_is_extended(!sidebar_is_extended())
  }
}

const NavigationView = (data)=> {
  categoryClick = (category, e)=> {
    toggleCategory(category)
  }
  toggleCategory = (category)=> {
    if(visible_categories.indexOf(category)>=0){
      visible_categories.remove(category)
    } else {
      visible_categories.push(category)
    }
  }
  getCategoryIconCss = (category)=>{
    let icons = {
      breweries: 'fas fa-beer',
      parks: 'fas fa-tree',
      restaurants: 'fas fa-utensils',
      museums: 'fas fa-university',
    }
    return icons[category]
  }
}

const App = ()=> {
  locations = {
    byId: {},
    allIds: []
  }
  filter_input = ko.observable()
  visible_categories = ko.observableArray()
  sidebar_is_extended = ko.observable(false)
  hasMatch = (item, query='')=> Object.keys(item).filter(k=>item[k] != undefined && item[k].toString().toLowerCase().match(query.toLowerCase())).length > 0
  getAllItems = ()=> locations.allIds.map(id=>locations.byId[id])
  getVisibleItems = ()=> getAllItems().filter(item=> visible_categories().indexOf(item.category) >= 0 && hasMatch(item, filter_input()))
  // fetch location data via XHR
  var that = this
  _fetch('/locations.json').then(JSON.parse).then((data)=>{
    // update locations
    locations = data
    // populate categories from location data
    categories = data.allIds.map((id)=>data.byId[id].category).filter((c,i,a)=> a.indexOf(c) == i)
    // visible categories is initially all categories
    that.visible_categories(categories)
    // apply bindings to views
    that.MapView = ko.applyBindings(MapView(), document.getElementById('map'))
    that.SidebarView = ko.applyBindings(SidebarView(), document.getElementById('sidebar'))
    that.NavigationView = ko.applyBindings(NavigationView(data), document.getElementById('navigation'))
  }).catch((error)=>{
    // error loading location data, load empty map
    alert('Error loading location data. Please try again.')
    that.SidebarView = ko.applyBindings(SidebarView(), document.getElementById('sidebar'))
    that.NavigationView = ko.applyBindings(NavigationView({}), document.getElementById('navigation'))
    that.MapView = ko.applyBindings(MapView(), document.getElementById('map'))
    mapError()
  })
  return { getVisibleItems, getAllItems, MapView, SidebarView, NavigationView, filter_input, visible_categories }
}

const app = App()

window.mapLoad = ()=>{
  app.GoogleMap = GoogleMap(app.getVisibleItems, app.getAllItems, 'map', app.MapView())
  // update map when filter input is changed
    app.filter_input.subscribe((value)=>{
      app.GoogleMap.setMarkers()
    })
    // update map when categories are enabled/disabled
    app.visible_categories.subscribe((value)=>{
      app.GoogleMap.setMarkers()
    })
}

window.mapError = ()=>{
  console.log(GoogleMap)
  app.GoogleMap = GoogleMap(()=>[], ()=>[], 'map', app.MapView.mapConfig)
}