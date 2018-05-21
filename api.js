_fetch = ((url, options={})=> {
  options.method = options.method || 'GET'
  return new Promise ((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    if(options.request_headers){
      Object.keys(options.request_headers).map((header)=>{
        xhr.setRequestHeader(header, options.request_headers[header])
      })
    }
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

const getYelpInfo = async(place)=> {
  const url_base = 'https://yelp.terrencemorrow.com'
  let options = {
    term: place.name,
    longitude: place.coordinates[1],
    latitude: place.coordinates[0],
  }
  let url = [url_base, Object.keys(options).map(key=>[key, encodeURIComponent(options[key])].join('=')).join('&')].join('?')
  return _fetch(url).then(JSON.parse)
}