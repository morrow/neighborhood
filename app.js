const MapView = (parent)=> {
  this.body = 'map'
}

const SidebarView = (parent)=> {
  this.body = 'filter'
}

const NavigationView = (parent, data)=> {
  this.body = 'navigation'
  this.categoryClick = (category, e)=> {
    parent.toggleCategory(category)
  }
}

const App = ()=> {
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
  this.locations = {byId:{},allIds:[]}
  this.filter_input = ko.observable()
  this.getCategoryIconCss = (category)=>{
    let icons = {
      breweries: 'fas fa-beer',
      parks: 'fas fa-tree',
      restaurants: 'fas fa-utensils',
      museums: 'fas fa-university',
    }
    return icons[category]
  }
  this.toggleCategory = (category)=> {
    if(this.visible_categories.indexOf(category)>=0){
      this.visible_categories.remove(category)
    } else {
      this.visible_categories.push(category)
    }
  }
  this.sidebarClick = (id)=>{
    this.Map && this.Map.showWindow ? this.Map.showWindow(id) : 1
  }
  this.hasMatch = (item, query='')=> Object.keys(item).filter(k=>item[k] != undefined && item[k].toString().toLowerCase().match(query.toLowerCase())).length > 0
  this.getAllItems = ()=> this.locations.allIds.map(id=>this.locations.byId[id])
  this.getVisibleItems = ()=> getAllItems().filter(item=> this.visible_categories().indexOf(item.category) >= 0 && hasMatch(item, filter_input()))
  _fetch('/locations.json').then(JSON.parse).then((data)=>{
    this.locations = data
    this.categories = data.allIds.map((id)=>data.byId[id].category).filter((c,i,a)=> a.indexOf(c) == i)
    this.visible_categories = ko.observableArray(this.categories)
    this.MapView = ko.applyBindings(MapView(this), document.getElementById('map'))
    this.SidebarView = ko.applyBindings(SidebarView(this), document.getElementById('sidebar'))
    this.NavigationView = ko.applyBindings(NavigationView(this, data), document.getElementById('navigation'))
    this.Map = Map(this.getVisibleItems, this.getAllItems, 'map', this.mapConfig)
    this.filter_input.subscribe((value)=>{
      this.Map.setMarkers()
    })
    this.visible_categories.subscribe((value)=>{
      this.Map.setMarkers()
    })
  }).catch((error)=>{console.log(error)})
}

App()