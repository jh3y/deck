import gsap from "gsap"
import { Draggable } from "gsap/Draggable"

gsap.registerPlugin(Draggable)

const cover = document.querySelector(".playing")
Draggable.create(cover, {
  type: "top,left",
})
