import * as THREE from 'three'

export default class NewsMarker extends THREE.Mesh {
    constructor(country) {
      super()
      this.geometry = new THREE.CircleGeometry(0.015)
      this.material = new THREE.MeshBasicMaterial({ color: 'red'})
      this.size = 0
      this.active = false
      this.country = country
    }
  
    onResize(width, height, aspect) {
      this.size = width / 5 // 1/5 of the full width
      this.scale.setScalar(this.size * (this.active ? 1.5 : 1))
    }
  
    onPointerOver(e) {
      this.material.color.set('orange')
    }
  
    onPointerOut(e) {
      this.material.color.set('red')
    }
  
    onClick(e) {
      this.active = !this.active
      this.scale.setScalar(this.size * (this.active ? 1.5 : 1))
    }
  }