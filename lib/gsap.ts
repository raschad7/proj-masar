import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

// Single registration point for the whole app — import gsap from here only.
gsap.registerPlugin(
  ScrollTrigger,
  MotionPathPlugin,
  DrawSVGPlugin,
  SplitText,
  useGSAP,
)

export {
  gsap,
  ScrollTrigger,
  MotionPathPlugin,
  DrawSVGPlugin,
  SplitText,
  useGSAP,
}
