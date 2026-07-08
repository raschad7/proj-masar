"use client"

import { useEffect, useMemo, useRef, type ReactNode } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"

/* ── True-3D phone ──────────────────────────────────────────────
   Scene units are CSS pixels: the body is a 236×480×26 extruded
   slab. The screens are drawn with the 2D canvas API (which shapes
   Arabic correctly using the page's loaded fonts) and applied as
   textures to a plane on the front face — so they can spin with
   the body and swap instantly while the phone faces away.

   The camera distance makes the phone fill 78.125% of the canvas
   height, so a canvas sized 128% of the phone box renders the
   phone at exactly the box's size (2 · 1146 · tan(15°) ≈ 614 ≈
   480 / 0.78125). The GSAP timeline in PhoneSection drives `pose`
   (CSS-transform sign conventions); useFrame converts per frame. */

const BODY_W = 236
const BODY_H = 480
const BODY_D = 26
const BODY_R = 36
const BEVEL = 3
const SCREEN_W = 212
const SCREEN_H = 456
const SCREEN_R = 26
const CAMERA_Z = 1146
const TEX_SCALE = 2 //  texture backing resolution multiplier

export type PhonePose = {
  rx: number //      deg, CSS rotateX convention (+ tips the top back)
  ry: number //      deg, CSS rotateY convention (+ faces viewer's right)
  rz: number //      deg, CSS rotate convention (+ clockwise)
  z: number //       px, CSS translateZ convention (- recedes)
  screen: number //  index into the screen textures (swapped mid-spin)
}

const D2R = Math.PI / 180

/* Brand tokens (locked spec — mirror of globals.css) */
const C = {
  informative: "#0072DA",
  notice: "#FFAB00",
  positive: "#088A20",
  negative: "#CC3931",
  peacock: "#34A8D8",
  sportsTeal: "#16668E",
  whitesmoke: "#F7F7F7",
  seashell: "#F0F0F0",
  ink: "#191919",
  subtext: "#6E6E6E",
  white: "#FFFFFF",
}

/* ── 2D screen painters (212×456 logical space, RTL) ──────────── */

type Painter = (ctx: CanvasRenderingContext2D, font: string) => void

const setFont = (
  ctx: CanvasRenderingContext2D,
  weight: number,
  px: number,
  font: string,
) => {
  ctx.font = `${weight} ${px}px ${font}`
}

const notch = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = C.seashell
  ctx.beginPath()
  ctx.roundRect(SCREEN_W / 2 - 32, 8, 64, 6, 3)
  ctx.fill()
}

const drawBrand: Painter = (ctx, font) => {
  ctx.fillStyle = C.whitesmoke
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  //  faint map grid
  ctx.strokeStyle = "rgba(52,168,216,0.12)"
  ctx.lineWidth = 1
  for (let x = 20; x < SCREEN_W; x += 44) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, SCREEN_H)
    ctx.stroke()
  }
  for (let y = 30; y < SCREEN_H; y += 44) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(SCREEN_W, y)
    ctx.stroke()
  }
  ctx.fillStyle = C.peacock
  ctx.beginPath()
  ctx.arc(SCREEN_W / 2, SCREEN_H / 2 - 42, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.ink
  ctx.textAlign = "center"
  //  display font (Rubbama) for the wordmark, like the DOM screens
  const display = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-rubbama")
    .trim()
  ctx.font = `400 26px ${display ? `${display}, ` : ""}${font}`
  ctx.fillText("مسار", SCREEN_W / 2, SCREEN_H / 2 + 8)
  ctx.fillStyle = C.subtext
  setFont(ctx, 400, 11, font)
  ctx.fillText("بلاغٌ واحد، طريقٌ واحد", SCREEN_W / 2, SCREEN_H / 2 + 32)
}

const drawScanner: Painter = (ctx, font) => {
  ctx.fillStyle = "#20242A"
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  //  camera viewport
  const vx = 12
  const vy = 22
  const vw = SCREEN_W - 24
  const vh = SCREEN_H - 100
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(vx, vy, vw, vh, 16)
  ctx.clip()
  ctx.fillStyle = "#3A4048"
  ctx.fillRect(vx, vy, vw, vh)
  //  road receding from the bottom third
  ctx.fillStyle = "#4A5058"
  ctx.beginPath()
  ctx.roundRect(vx + 22, vy + vh / 3, vw - 44, vh, 52)
  ctx.fill()
  ctx.restore()
  //  AI focus box on the pothole
  const fw = 96
  const fh = 64
  const fx = SCREEN_W / 2 - fw / 2
  const fy = vy + vh / 2 - fh / 2
  ctx.strokeStyle = C.informative
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(fx, fy, fw, fh, 8)
  ctx.stroke()
  //  classification pill
  setFont(ctx, 700, 9, font)
  const label = "حفرة · خطورة عالية"
  const tw = ctx.measureText(label).width
  ctx.fillStyle = C.informative
  ctx.beginPath()
  ctx.roundRect(fx + fw - tw - 16, fy - 20, tw + 16, 16, 8)
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.textAlign = "right"
  ctx.fillText(label, fx + fw - 8, fy - 8)
  //  shutter button with camera glyph
  const cy = SCREEN_H - 40
  ctx.fillStyle = C.informative
  ctx.beginPath()
  ctx.arc(SCREEN_W / 2, cy, 24, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = C.white
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(SCREEN_W / 2 - 11, cy - 7, 22, 15, 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(SCREEN_W / 2, cy + 1, 4.5, 0, Math.PI * 2)
  ctx.stroke()
}

const drawDispatcher: Painter = (ctx, font) => {
  ctx.fillStyle = C.whitesmoke
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  //  live map with severity pins
  const mh = SCREEN_H * 0.42
  ctx.fillStyle = C.seashell
  ctx.beginPath()
  ctx.roundRect(12, 22, SCREEN_W - 24, mh, 16)
  ctx.fill()
  ctx.strokeStyle = "rgba(110,110,110,0.18)"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(24, 22 + mh * 0.7)
  ctx.bezierCurveTo(
    SCREEN_W * 0.35,
    22 + mh * 0.3,
    SCREEN_W * 0.6,
    22 + mh * 0.9,
    SCREEN_W - 24,
    22 + mh * 0.45,
  )
  ctx.stroke()
  const pins: Array<[number, number, string]> = [
    [0.72, 0.3, C.informative],
    [0.42, 0.55, C.notice],
    [0.28, 0.25, C.negative],
    [0.58, 0.72, C.positive],
  ]
  pins.forEach(([px, py, color]) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(12 + (SCREEN_W - 24) * px, 22 + mh * py, 6, 0, Math.PI * 2)
    ctx.fill()
  })
  //  prioritized report list
  const rows: Array<[string, string]> = [
    [C.negative, "شارع القدس — حفرة"],
    [C.notice, "دوار المنارة — تشقّق"],
    [C.informative, "شارع ركب — هبوط"],
  ]
  rows.forEach(([color, text], i) => {
    const y = 22 + mh + 14 + i * 52
    ctx.fillStyle = C.white
    ctx.beginPath()
    ctx.roundRect(12, y, SCREEN_W - 24, 42, 12)
    ctx.fill()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(SCREEN_W - 30, y + 21, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = C.ink
    ctx.textAlign = "right"
    setFont(ctx, 700, 11, font)
    ctx.fillText(text, SCREEN_W - 44, y + 25)
  })
}

const drawCrew: Painter = (ctx, font) => {
  ctx.fillStyle = C.whitesmoke
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  //  assignment card
  ctx.fillStyle = C.white
  ctx.beginPath()
  ctx.roundRect(12, 22, SCREEN_W - 24, 64, 16)
  ctx.fill()
  ctx.fillStyle = C.sportsTeal
  ctx.beginPath()
  ctx.arc(SCREEN_W - 34, 44, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.ink
  ctx.textAlign = "right"
  setFont(ctx, 700, 11, font)
  ctx.fillText("مهمة: حفرة — شارع القدس", SCREEN_W - 52, 48)
  ctx.fillStyle = C.subtext
  setFont(ctx, 400, 9, font)
  ctx.fillText("الأولوية: عالية · ٨٠٠م", SCREEN_W - 52, 68)
  //  evidence-upload action
  ctx.fillStyle = C.sportsTeal
  ctx.beginPath()
  ctx.roundRect(12, 100, SCREEN_W - 24, 36, 18)
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.textAlign = "center"
  setFont(ctx, 700, 11, font)
  ctx.fillText("رفع دليل مصوّر", SCREEN_W / 2, 123)
  //  closed-report check
  const cy = SCREEN_H * 0.62
  ctx.fillStyle = C.positive
  ctx.beginPath()
  ctx.arc(SCREEN_W / 2, cy, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = C.white
  ctx.lineWidth = 5
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(SCREEN_W / 2 - 12, cy + 1)
  ctx.lineTo(SCREEN_W / 2 - 3, cy + 10)
  ctx.lineTo(SCREEN_W / 2 + 13, cy - 9)
  ctx.stroke()
}

/* Back cover details — visible while the phone spins. Transparent
   background so the body's own white shows through. */
const drawBack: Painter = (ctx, font) => {
  //  camera island (top-right of the back = top-left as drawn,
  //  since the back plane is rotated 180° around Y)
  ctx.fillStyle = "#ECEDEF"
  ctx.beginPath()
  ctx.roundRect(16, 16, 62, 62, 18)
  ctx.fill()
  const lens = (lx: number, ly: number) => {
    ctx.fillStyle = "#2A2E33"
    ctx.beginPath()
    ctx.arc(lx, ly, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#4A5058"
    ctx.beginPath()
    ctx.arc(lx, ly, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  lens(35, 35)
  lens(59, 59)
  //  brand mark
  ctx.fillStyle = C.peacock
  ctx.beginPath()
  ctx.roundRect(SCREEN_W / 2 - 21, SCREEN_H / 2 - 21, 42, 42, 12)
  ctx.fill()
  ctx.strokeStyle = C.white
  ctx.lineWidth = 4
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  ctx.moveTo(SCREEN_W / 2 - 9, SCREEN_H / 2 + 5)
  ctx.lineTo(SCREEN_W / 2, SCREEN_H / 2 - 6)
  ctx.lineTo(SCREEN_W / 2 + 9, SCREEN_H / 2 + 5)
  ctx.stroke()
  ctx.fillStyle = C.subtext
  ctx.textAlign = "center"
  setFont(ctx, 700, 10, font)
  ctx.fillText("مسار", SCREEN_W / 2, SCREEN_H - 24)
}

/* ── Texture plumbing ───────────────────────────────────────────── */

function resolveFont() {
  const fam = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-almarai")
    .trim()
  return fam ? `${fam}, sans-serif` : "sans-serif"
}

function paintTexture(
  canvas: HTMLCanvasElement,
  painter: Painter,
  font: string,
  withNotch: boolean,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(TEX_SCALE, 0, 0, TEX_SCALE, 0, 0)
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H)
  ctx.direction = "rtl"
  //  rounded-corner alpha mask
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, SCREEN_W, SCREEN_H, SCREEN_R)
  ctx.clip()
  painter(ctx, font)
  if (withNotch) notch(ctx)
  ctx.restore()
}

const PAINTERS: Painter[] = [drawBrand, drawScanner, drawDispatcher, drawCrew]

function useScreenTextures() {
  const made = useMemo(() => {
    const font = resolveFont()
    const make = (painter: Painter, withNotch: boolean) => {
      const canvas = document.createElement("canvas")
      canvas.width = SCREEN_W * TEX_SCALE
      canvas.height = SCREEN_H * TEX_SCALE
      paintTexture(canvas, painter, font, withNotch)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      return { tex, canvas, painter, withNotch }
    }
    return {
      screens: PAINTERS.map((p) => make(p, true)),
      back: make(drawBack, false),
    }
  }, [])

  useEffect(() => {
    //  repaint once webfonts are ready so Arabic renders in Almarai
    let alive = true
    document.fonts.ready.then(() => {
      if (!alive) return
      const font = resolveFont()
      const all = [...made.screens, made.back]
      all.forEach(({ tex, canvas, painter, withNotch }) => {
        paintTexture(canvas, painter, font, withNotch)
        tex.needsUpdate = true
      })
    })
    return () => {
      alive = false
      made.screens.forEach(({ tex }) => tex.dispose())
      made.back.tex.dispose()
    }
  }, [made])

  return made
}

/* ── Meshes ─────────────────────────────────────────────────────── */

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

function PhoneBody({ pose }: { pose: PhonePose }) {
  const group = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const { screens, back } = useScreenTextures()

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(
      roundedRectShape(BODY_W, BODY_H, BODY_R),
      {
        depth: BODY_D - BEVEL * 2,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
        bevelSegments: 4,
        curveSegments: 24,
      },
    )
    //  extrusion spans z ∈ [-bevel, depth+bevel] — center it
    geo.translate(0, 0, -(BODY_D - BEVEL * 2) / 2)
    return geo
  }, [])

  const bodyMaterials = useMemo(
    () => [
      //  index 0: front/back faces — near-white with a clearcoat so a
      //  highlight sweeps across the shell during the spin
      new THREE.MeshPhysicalMaterial({
        color: "#f6f7f8",
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.35,
      }),
      //  index 1: side walls — a shade darker so thickness reads
      new THREE.MeshPhysicalMaterial({
        color: "#dfe2e6",
        roughness: 0.28,
        clearcoat: 0.8,
        clearcoatRoughness: 0.25,
      }),
    ],
    [],
  )

  useFrame(() => {
    const g = group.current
    if (!g) return
    //  CSS is y-down, three is y-up: rotateX and rotate flip sign
    g.rotation.set(-pose.rx * D2R, pose.ry * D2R, -pose.rz * D2R)
    g.position.z = pose.z
    //  texture swap — the timeline flips `screen` while the phone
    //  faces away, so the change is never seen head-on
    const mat = screenMat.current
    const idx = Math.min(
      screens.length - 1,
      Math.max(0, Math.round(pose.screen)),
    )
    if (mat && mat.map !== screens[idx].tex) mat.map = screens[idx].tex
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={bodyMaterials} />
      {/* screen — self-lit, unaffected by scene lighting */}
      <mesh position={[0, 0, BODY_D / 2 + 0.4]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial
          ref={screenMat}
          map={screens[0].tex}
          transparent
          toneMapped={false}
        />
      </mesh>
      {/* back cover details */}
      <mesh position={[0, 0, -(BODY_D / 2 + 0.4)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={back.tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function PhoneCanvas({
  pose,
  fallback,
}: {
  pose: PhonePose
  fallback?: ReactNode
}) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      fallback={fallback}
      camera={{ fov: 30, position: [0, 0, CAMERA_Z], near: 100, far: 4000 }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[250, 320, 500]} intensity={0.9} />
      <directionalLight
        position={[-350, -150, 250]}
        intensity={0.4}
        color="#dfe9f0"
      />
      <PhoneBody pose={pose} />
    </Canvas>
  )
}
