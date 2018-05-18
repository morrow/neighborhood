
const MapView = ()=> {
  this.body = 'map'
}

const FilterView = ()=> {
  this.body = 'filter'
}

const NavigationView = ()=> {
  this.body = 'navigation'
}

ko.applyBindings(new MapView(), document.getElementById('map'))
ko.applyBindings(new FilterView(), document.getElementById('filter'))
ko.applyBindings(new NavigationView(), document.getElementById('navigation'))