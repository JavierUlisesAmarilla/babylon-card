import {Experience} from "../Experience";

export default class World {
    experience
    scene

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
    }

    update() {
    }
}