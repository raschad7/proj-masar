import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

// Single registration point for the whole app — import gsap from here only.
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, useGSAP);

export { gsap, ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, useGSAP };
