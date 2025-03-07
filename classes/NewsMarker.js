import * as THREE from 'three'

export default class NewsMarker extends THREE.Mesh {
    constructor(country) {
      super()
      this.geometry = new THREE.PlaneGeometry(0.1, 0.1)
      this.material = new THREE.MeshBasicMaterial({ color: 'orange'})
      this.size = 0
      this.active = false
      this.country = country
    }
  
    onResize(width, height, aspect) {
      this.cubeSize = width / 5 // 1/5 of the full width
      this.scale.setScalar(this.size * (this.active ? 1.5 : 1))
    }
  
    onPointerOver(e) {
      this.material.color.set('hotpink')
    }
  
    onPointerOut(e) {
      this.material.color.set('orange')
    }
  
    onClick(e) {
      this.active = !this.active
      this.scale.setScalar(this.size * (this.active ? 1.5 : 1))
    }
  }