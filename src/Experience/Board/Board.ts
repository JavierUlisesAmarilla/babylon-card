import * as BABYLON from 'babylonjs'

import {LAYER_PICK_Z, LAYER_SLOT_Z} from '../../utils/constants'

import {Arrow} from '../Utils/Arrow/Arrow'
import {Cards} from './Cards'
import {EmptySlot} from './EmptySlot'
import {Experience} from '../Experience'
import {LeftSidebar} from './LeftSidebar'
import {Slot} from './Slot'
import {Wolf} from './Wolf'

export class Board {
  experience
  scene
  drag
  root
  topLeftSlot
  topRightSlot
  bottomLeftSlot
  bottomRightSlot
  cards
  leftSidebar
  wolf
  arrow
  size = 10
  slotWidth = 0.471
  slotHeight = 0.77

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.drag = this.experience.drag
    this.root = BABYLON.MeshBuilder.CreatePlane('board', {width: this.size, height: this.size, sideOrientation: 2}, this.scene)
    const material = new BABYLON.StandardMaterial('board')
    material.diffuseTexture = new BABYLON.Texture('assets/images/background.jpg')
    this.root.material = material
    this.root.actionManager = new BABYLON.ActionManager(this.scene)
    this.root.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnPickTrigger}, (e: BABYLON.ActionEvent) => this.onPick(e)))

    // Pick layer
    const layerPick = BABYLON.MeshBuilder.CreatePlane('layerPick', {width: this.size, height: this.size}, this.scene)
    layerPick.setEnabled(false)
    layerPick.position.set(0, 0, LAYER_PICK_Z)
    this.drag.dragPlane = layerPick

    // Top slots
    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const position = new BABYLON.Vector3(x * this.slotWidth + this.slotWidth / 2 - 1.16, y * this.slotHeight + this.slotHeight / 2 + 0.1, LAYER_SLOT_Z)
      new Slot({name: `t-slot${i}`, width: this.slotWidth, height: this.slotHeight, position})
    }

    // Bottom slots
    for (let i = 0; i < 10; i++) {
      const x = i % 5
      const y = Math.floor(i / 5)
      const position = new BABYLON.Vector3(x * this.slotWidth + this.slotWidth / 2 - 1.16, y * this.slotHeight + this.slotHeight / 2 - 1.64, LAYER_SLOT_Z)
      new Slot({name: `b-slot${i}`, width: this.slotWidth, height: this.slotHeight, position})
    }

    // Side slots
    this.topLeftSlot = new EmptySlot({name: 'topLeftSlot', width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, 0.9, LAYER_SLOT_Z)})
    this.topRightSlot = new EmptySlot({name: 'topLeftSlot', width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, 0.9, LAYER_SLOT_Z)})
    this.bottomLeftSlot = new EmptySlot({name: 'topLeftSlot', width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(-1.2 - this.slotWidth / 2, -0.9, LAYER_SLOT_Z)})
    this.bottomRightSlot = new EmptySlot({name: 'topLeftSlot', width: this.slotWidth, height: this.slotHeight, position: new BABYLON.Vector3(1.24 + this.slotWidth / 2, -0.9, LAYER_SLOT_Z)})

    // Cards
    this.cards = new Cards()

    // Left sidebar
    this.leftSidebar = new LeftSidebar({name: 'leftSidebar'})

    // Wolf
    this.wolf = new Wolf()

    // Arrow
    this.arrow = new Arrow({})
  }

  update() {
    this.cards.update()
  }

  onPick(e: BABYLON.ActionEvent) {
    const pickedPoint = e.additionalData.pickedPoint
    this.wolf.moveTo(pickedPoint)
  }
}