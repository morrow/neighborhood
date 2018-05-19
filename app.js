_fetch = ((url, options={})=> {
  options.method = options.method || 'GET'
  return new Promise ((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = (e)=>{
      if(xhr.status >= 200 && xhr.status < 300){
        resolve(xhr.response)
      } else {
        reject(xhr.status)
      }
    }
    xhr.onerror = reject
    xhr.open(options.method, url)
    xhr.send()
  })
})

const MapView = (parent)=> {
  this.body = 'map'
}

const FilterView = (parent)=> {
  this.body = 'filter'
}

const NavigationView = ()=> {
  this.body = 'navigation'
}

const App = ()=> {
  this.locations = {byId:{},allIds:[]}
  this.filter_input = ko.observable()
  this.hasMatch = (item, query='')=> Object.keys(item).filter(k=>item[k] != undefined && item[k].toString().toLowerCase().match(query.toLowerCase())).length > 0
  this.getAllItems = ()=> this.locations.allIds.map(id=>this.locations.byId[id])
  this.getVisibleItems = ()=> getAllItems().filter(item=> hasMatch(item, filter_input()))
  _fetch('/locations.json').then(JSON.parse).then((data)=>{
    this.locations = data
    this.MapView = ko.applyBindings(MapView(this), document.getElementById('map'))
    this.FilterView = ko.applyBindings(FilterView(this), document.getElementById('filter'))
    this.NavigationView = ko.applyBindings(NavigationView(), document.getElementById('navigation'))
    this.Map = Map(this.getVisibleItems, 'map-target')
    this.filter_input.subscribe((value)=>{
      console.log(value)
      this.Map.setMarkers()
    })
  }).catch((error)=>{console.log(error)})
}

App()