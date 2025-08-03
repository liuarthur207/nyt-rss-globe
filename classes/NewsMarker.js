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
    
        const el = document.createElement('div');
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = "absolute";
        closeButton.style.right = "0px";
        closeButton.style.top = "0px";
        closeButton.style.background = "transparent";
        closeButton.style.color = "white";
        closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            console.log("click");
            this.close();
        });
        el.appendChild(closeButton);
    
        const countryLabel = document.createElement('b');
        countryLabel.textContent = this.country;
        el.appendChild(countryLabel);
        el.appendChild(document.createElement('br'));
    
        const news = this.newsMap.get(this.country);
        for (let i = 0; i < news.length; i++) {
            const a = document.createElement('a');
            a.href = news[i].link;
            a.textContent = "- " + news[i].title;
            a.target = "_blank";
            a.classList.add('news-link');
            
            //a.style.
            el.appendChild(a);
            el.appendChild(document.createElement('br'));
        }
        el.style.pointerEvents = 'auto';
        el.style.fontFamily = "'Courier New', Courier, monospace";
        el.style.color = "white";
        el.style.background = "black";
        el.style.padding = "5px";
        el.style.border = "2px solid white";
        el.style.borderRadius = "5px";
        el.style.fontSize = '12px';
        el.style.position = "relative"; 


    
        const label = new CSS2DObject(el);
        label.position.set(0, 0.02, 0);
        this.add(label);
        this.htmlObject = label;
        this.htmlObject.visible = true;
    }
    
    updateLabelOpacity(camera) {
        if (!this.htmlObject) return;
        const normal = this.position.clone().normalize();
        const viewDir = camera.position.clone().normalize();
    
        const dot = normal.dot(viewDir);
    
        const opacity = smoothstep(0.2, 0.8, dot);
        this.htmlObject.element.style.opacity = opacity.toFixed(2);
        this.htmlObject.element.style.display = opacity < 0.01 ? 'none' : 'block';
    
        function smoothstep(min, max, v) {
            const x = Math.max(0, Math.min(1, (v - min) / (max - min)));
            return x * x * (3 - 2 * x);
        }
    }
    
    
    
    

    onKeyDown(event) {
        if (event.key === 'Escape') {
          this.close()
        }
    }
}
