import * as BABYLON from 'babylonjs'

import {Experience} from '../Experience';

export class Mouse {
  experience: any
  canvas: any
  scene: any
  camera: any

  startingPoint: BABYLON.Vector3 | null = null
  currentMesh: any
  dragPlane: any

  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.scene.onPointerObservable.add((pointerInfo: any) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != this.dragPlane) {
            this.onPointerDown(pointerInfo.pickInfo.pickedMesh)
          }

          break;
        case BABYLON.PointerEventTypes.POINTERUP:
          this.onPointerUp();
          break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
          this.onPointerMove();
          break;
      }
    });
  }

  getGroundPosition() {
    if (!this.dragPlane) {
      return null
    }

    var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh: any) => {return mesh === this.dragPlane});

    if (pickInfo.hit) {
      return pickInfo.pickedPoint;
    }

    return null;
  }

  onPointerDown(mesh: any) {
    console.log('Mouse#onPointerDown: mesh: ', mesh)
    this.currentMesh = mesh;
    this.startingPoint = this.getGroundPosition();

    if (this.startingPoint) {
      setTimeout(() => {
        this.camera.detachControl(this.canvas);
      }, 0);
    }
  }

  onPointerUp() {
    if (this.startingPoint) {
      this.camera.attachControl(this.canvas, true);
      this.startingPoint = null;
      return;
    }
  }

  onPointerMove() {
    if (!this.startingPoint) {
      return;
    }

    const current = this.getGroundPosition();

    if (!current) {
      return;
    }

    const diff = current.subtract(this.startingPoint);
    this.currentMesh.position.addInPlace(diff);
    this.startingPoint = current;
  }
};