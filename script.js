import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as d3 from 'd3-geo'
import GeoJsonGeometry from 'three-geojson-geometry'
import NewsMarker from './classes/NewsMarker.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { deltaTime } from 'three/tsl'

console.log("h")

//Converts latitude and longitude data to points on the globe
function latLonToVector3(lat, lon, radius = 1) {
    //console.log(lat + "," + lon)
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (-1 * lon + 90) * (Math.PI / 180);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

const locMap = new Map();

async function buildLocMap() {
    try {
      const response = await fetch("/country-codes-lat-long-alpha3.json");
      const data = await response.json();
      const country_codes = data.ref_country_codes;
  
      country_codes.forEach(country => {
        locMap.set(country.country, { lat: country.latitude, lon: country.longitude });
      });
      //console.log(locmap.has("sudan"));
    } catch (error) {
      console.error("Error fetching or processing JSON data:", error);
    }
  }

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
    {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
        renderer.setSize(sizes.width, sizes.height)
        cssRenderer.setSize(sizes.width, sizes.height)
    })

const scene = new THREE.Scene()
const group = new THREE.Group()
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)

let renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

// Create CSS2DRenderer and set it up
const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight)
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.pointerEvents = 'none';  // Prevent interference with controls
cssRenderer.domElement.style.zIndex = '1';  // Ensure it's behind the WebGLRenderer
document.body.appendChild(cssRenderer.domElement);


fetch('./geojson/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries =>
    {
      const alt = 1;
     //console.log(countries)
  
      const lineObjs = [
        new THREE.LineSegments(
          new GeoJsonGeometry(d3.geoGraticule10(), alt),
          new THREE.LineBasicMaterial({ color: 'white', transparent:true, opacity:0.04 })
        )
      ];
  
      const materials = [
        new THREE.LineBasicMaterial({ color: 'white' }), // outer ring
        new THREE.LineBasicMaterial({ color: 'white' }) // inner holes
      ];
  
      countries.features.forEach(({ properties, geometry }) => {
        lineObjs.push(new THREE.LineSegments(
          new GeoJsonGeometry(geometry, alt),
          materials
        ))
        //console.log('done')
      });
      lineObjs.forEach(obj => group.add(obj));
    });

const globe = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.SphereGeometry(1), 1),
    new THREE.LineBasicMaterial({color: 'white', 
        transparent: true, 
        opacity: 0.2})
)



//To make the globe not completely transparent
const blacksphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.999),
    new THREE.MeshBasicMaterial({color: 'black'})
)

let rad = 1.005;

const infoMap = new Map()

let markersLoaded = false;
let markers = [];

async function fetchNytRSS(){
    await buildLocMap()
    try {
        const remoteURL = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";
        const localURL  = "/testing/World.xml"; //For testing offline
        const response = await fetch(remoteURL)
        const data = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, "text/xml");
        const items = doc.querySelectorAll("item")
        let i = 0
        items.forEach(item => {
            const geoCategories = item.querySelectorAll('category[domain="http://www.nytimes.com/namespaces/keywords/nyt_geo"]');
            const title = item.querySelector("title")?.textContent.trim();
            const link = item.querySelector("link")?.textContent.trim();
            const des = item.querySelector("description")?.textContent.trim();
            const creator = item.querySelector("creator")?.textContent.trim();
            const media = item.querySelector("media\\:content, content")?.getAttribute("url"); // Handles media content
            geoCategories.forEach(geo => {
            const country = geo.textContent
            if (locMap.has(country)) {
                if(infoMap.has(country)){
                    infoMap.get(country).push({ title: title, link: link, des: des, creator: creator, media: media })
                    
                }else{
                    let country_loc = locMap.get(country)
                    infoMap.set(country, [{ title: title, link: link, des: des, creator: creator, media: media }]);
                    i++
                    let newsMarker = new NewsMarker(country, infoMap)
                    newsMarker.position.copy(latLonToVector3(country_loc.lat, country_loc.lon).multiplyScalar(1.01))
                    newsMarker.lookAt(newsMarker.position.clone().setLength(rad + 1));
                    scene.add(newsMarker);
                    markers.push(newsMarker)
                    //scene.add(markers);
                    //markerManager.addMarker(latLonToVector3(country_loc.lat, country_loc.lon).multiplyScalar(1.01))

                }
            }else{
                console.log(country)
            }
            });
          });
          markersLoaded = true;
    } catch (error) {
        console.error("Error fetching or processing RSS data:", error);
    }
    console.log(infoMap)
}


//Controls
camera.position.z = 3
const orbit = new OrbitControls(camera, canvas)
orbit.enableDamping = true
orbit.minDistance = 1.2
orbit.maxDistance = 12
orbit.enablePan = false
//orbit.autoRotate = true;
//orbit.autoRotateSpeed *= 0.1;

scene.add(blacksphere)
group.add(globe)
scene.add(group)
scene.add(camera)

renderer.setSize(sizes.width, sizes.height)

let pointer = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let intersections;

async function intersectionLogic(){
    await fetchNytRSS();
    console.log(markers)
}




let lastIntersected = null; 

window.addEventListener('mousemove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    
    const intersections = raycaster.intersectObjects(markers, true);

    if (intersections.length > 0) {
        const currentObject = intersections[0].object;

        if (currentObject !== lastIntersected) {
            if (lastIntersected) lastIntersected.onPointerOut();
            currentObject.onPointerOver();
            lastIntersected = currentObject; 
        }
    } else {
        if (lastIntersected) {
            lastIntersected.onPointerOut();
            lastIntersected = null; 
        }
    }
});

window.addEventListener('click', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  
  const intersections = raycaster.intersectObjects(markers, true);

  if (intersections.length > 0) {
  intersections[0].object.onClick()
  }
});

intersectionLogic()


const clock = new THREE.Clock()
let camera_dist


const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    //group.rotation.y = elapsedTime * 0.1
    for(const marker of markers){
      marker.updateLabelOpacity(camera, globe);
    }
    //Update controls
    orbit.update()

    camera_dist = Math.hypot(camera.position.x, camera.position.y, camera.position.z);
    document.getElementById("info").style.opacity = camera_dist * 1.5 - 3
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera); // For HTML objects
    window.requestAnimationFrame(animate)
}
animate()