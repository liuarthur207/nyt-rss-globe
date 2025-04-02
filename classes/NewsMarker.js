import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default class NewsMarker extends THREE.Mesh {
    constructor(country, newsMap) {
        super();
        this.geometry = new THREE.CircleGeometry(0.015);
        this.material = new THREE.MeshBasicMaterial({ color: 'red' });
        this.size = 0;
        this.active = false;
        this.country = country;
        this.newsMap = newsMap;
        this.cssVisible = false; 
        this.htmlObject = null;  // Store the CSS2DObject for later use
        this.window = window; // Use passed window object or fallback to global window

        // Bind the event listener to this instance
        this.window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    close(){
      if(this.htmlObject) this.htmlObject.visible = false;
      this.material.color.set('red');
    }

    onPointerOver(e) {
        if (!this.material.color.equals(new THREE.Color('white'))) {
            this.material.color.set('orange');
        }
        console.log(this.country);
        console.log(this.newsMap.get(this.country));
    }

    onPointerOut(e) {
        if (!this.material.color.equals(new THREE.Color('white'))) {
            this.material.color.set('red');
        }
    }

    onClick(e) {
        this.material.color.set('white');

        if (this.htmlObject) {
            this.htmlObject.visible = true;
            return;
        }

        // Create the HTML element and CSS2DObject for displaying country news
        const el = document.createElement('div');
        el.innerHTML += "<b>" + this.country + "</b>"+ "<br>";
        for(let i = 0; i < this.newsMap.get(this.country).length; i++){
          el.innerHTML += "- " + this.newsMap.get(this.country)[i].title + "<br>";
        }
        
        
        
        //styling
        el.style.fontFamily = "'Courier New', Courier, monospace";
        el.style.color = "white";
        el.style.background = "black";
        el.style.padding = "5px";
        el.style.border = "2px solid white"
        el.style.borderRadius = "5px";
        el.style.fontSize = '12px';

        const objectCSS = new CSS2DObject(el);
        objectCSS.position.set(0, 0.02, 0); 
        this.add(objectCSS); 
        this.htmlObject = objectCSS; 
        this.htmlObject.visible = true;
    }

    onKeyDown(event) {
        if (event.key === 'Escape') {
          this.close()
        }
    }
}
