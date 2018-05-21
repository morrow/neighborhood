const MapView = (parent)=> {
  this.mapConfig = {
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

const SidebarView = (parent)=> {
  this.sidebarClick = (id)=>{
    this.Map && this.Map.showWindow ? this.Map.showWindow(id) : 1
  }
}

const NavigationView = (parent, data)=> {
  this.categoryClick = (category, e)=> {
    parent.toggleCategory(category)
  }
  this.toggleCategory = (category)=> {
    if(this.visible_categories.indexOf(category)>=0){
      this.visible_categories.remove(category)
    } else {
      this.visible_categories.push(category)
    }
  }
  this.getCategoryIconCss = (category)=>{
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
  this.locations = {
    byId: {},
    allIds: []
  }
  this.filter_input = ko.observable()
  this.hasMatch = (item, query='')=> Object.keys(item).filter(k=>item[k] != undefined && item[k].toString().toLowerCase().match(query.toLowerCase())).length > 0
  this.getAllItems = ()=> this.locations.allIds.map(id=>this.locations.byId[id])
  this.getVisibleItems = ()=> getAllItems().filter(item=> this.visible_categories().indexOf(item.category) >= 0 && hasMatch(item, filter_input()))
  // fetch location data via XHR
  _fetch('/locations.json').then(JSON.parse).then((data)=>{
    // update locations
    this.locations = data
    // populate categories from location data
    this.categories = data.allIds.map((id)=>data.byId[id].category).filter((c,i,a)=> a.indexOf(c) == i)
    // visible categories is initially all categories
    this.visible_categories = ko.observableArray(this.categories)
    // apply bindings to views
    this.MapView = ko.applyBindings(MapView(this), document.getElementById('map'))
    this.SidebarView = ko.applyBindings(SidebarView(this), document.getElementById('sidebar'))
    this.NavigationView = ko.applyBindings(NavigationView(this, data), document.getElementById('navigation'))
    // create map
    this.Map = Map(this.getVisibleItems, this.getAllItems, 'map', this.mapConfig)
    // update map when filter input is changed
    this.filter_input.subscribe((value)=>{
      this.Map.setMarkers()
    })
    // update map when categories are enabled/disabled
    this.visible_categories.subscribe((value)=>{
      this.Map.setMarkers()
    })
  }).catch((error)=>{
    // error loading location data, load empty map
    alert('Error loading location data. Please try again.')
    this.SidebarView = ko.applyBindings(SidebarView(this), document.getElementById('sidebar'))
    this.NavigationView = ko.applyBindings(NavigationView(this, {}), document.getElementById('navigation'))
    this.MapView = ko.applyBindings(MapView(this), document.getElementById('map'))
    this.Map = Map(()=>[], ()=>[], 'map', this.mapConfig)
  })
}

App()