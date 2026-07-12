"use client"

import { useEffect, useMemo, useRef, type ReactNode } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Lightformer } from "@react-three/drei"

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
const BODY_R = 40
const BEVEL = 3
//  thin, uniform 6px bezel on every side (was 12px) for a modern look
const SCREEN_W = 224
const SCREEN_H = 468
const SCREEN_R = 34
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

type Painter = (ctx: CanvasRenderingContext2D, font: string, ext?: any) => void

const setFont = (
  ctx: CanvasRenderingContext2D,
  weight: number,
  px: number,
  font: string,
) => {
  ctx.font = `${weight} ${px}px ${font}`
}

//  pill-shaped Dynamic Island, floating just below the top edge
const dynamicIsland = (ctx: CanvasRenderingContext2D) => {
  const w = 82
  const h = 24
  const x = SCREEN_W / 2 - w / 2
  const y = 11
  ctx.fillStyle = "#050506"
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, h / 2)
  ctx.fill()
  //  hint of the front camera at the right of the island
  ctx.fillStyle = "#1B2430"
  ctx.beginPath()
  ctx.arc(x + w - 15, y + h / 2, 4.5, 0, Math.PI * 2)
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
  const cx = SCREEN_W / 2
  //  dark reporting UI
  ctx.fillStyle = "#15181D"
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)

  //  header: back chevron + title
  ctx.strokeStyle = C.white
  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(24, 48)
  ctx.lineTo(18, 53)
  ctx.lineTo(24, 58)
  ctx.stroke()
  ctx.fillStyle = C.white
  ctx.textAlign = "right"
  setFont(ctx, 700, 13, font)
  ctx.fillText("إبلاغ عن مشكلة", SCREEN_W - 16, 58)

  //  camera viewport
  const vx = 12
  const vy = 70
  const vw = SCREEN_W - 24
  const vh = 250
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(vx, vy, vw, vh, 18)
  ctx.clip()
  //  asphalt
  const road = ctx.createLinearGradient(0, vy, 0, vy + vh)
  road.addColorStop(0, "#575D66")
  road.addColorStop(1, "#3C424B")
  ctx.fillStyle = road
  ctx.fillRect(vx, vy, vw, vh)
  //  faint lane markings
  ctx.strokeStyle = "rgba(255,255,255,0.10)"
  ctx.lineWidth = 6
  ctx.setLineDash([16, 14])
  ctx.beginPath()
  ctx.moveTo(cx - 46, vy + vh)
  ctx.lineTo(cx - 20, vy + 40)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 46, vy + vh)
  ctx.lineTo(cx + 20, vy + 40)
  ctx.stroke()
  ctx.setLineDash([])
  //  pothole — irregular dark blob with a lighter rim
  const pcy = vy + vh * 0.54
  ctx.fillStyle = "#20242A"
  ctx.beginPath()
  ctx.ellipse(cx, pcy, 42, 27, -0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#111318"
  ctx.beginPath()
  ctx.ellipse(cx + 3, pcy + 3, 30, 18, -0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "rgba(0,0,0,0.35)"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, pcy, 42, 27, -0.15, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  //  AI focus corner brackets around the pothole
  const fw = 112
  const fh = 84
  const fx = cx - fw / 2
  const fy = pcy - fh / 2
  const seg = 16
  ctx.strokeStyle = C.informative
  ctx.lineWidth = 3
  ctx.lineCap = "round"
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath()
    ctx.moveTo(x + dx * seg, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * seg)
    ctx.stroke()
  }
  corner(fx, fy, 1, 1)
  corner(fx + fw, fy, -1, 1)
  corner(fx, fy + fh, 1, -1)
  corner(fx + fw, fy + fh, -1, -1)

  //  accuracy chip (top-right inside the viewport)
  setFont(ctx, 700, 10, font)
  const acc = "٩٦٪ الدقة"
  const aw = ctx.measureText(acc).width + 24
  ctx.fillStyle = "rgba(10,12,16,0.62)"
  ctx.beginPath()
  ctx.roundRect(vx + vw - aw - 8, vy + 8, aw, 20, 10)
  ctx.fill()
  ctx.fillStyle = C.positive
  ctx.beginPath()
  ctx.arc(vx + vw - 16, vy + 18, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.textAlign = "right"
  ctx.fillText(acc, vx + vw - 24, vy + 22)

  //  overlay result card (severity + location), overlapping the viewport
  const cardX = 20
  const cardW = SCREEN_W - 40
  const cardY = 248
  const cardH = 96
  ctx.fillStyle = C.white
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, cardW, cardH, 18)
  ctx.fill()
  //  severity label + value
  ctx.fillStyle = C.subtext
  ctx.textAlign = "right"
  setFont(ctx, 700, 10, font)
  ctx.fillText("الخطورة", cardX + cardW - 16, cardY + 24)
  ctx.fillStyle = C.negative
  ctx.textAlign = "left"
  setFont(ctx, 700, 11, font)
  ctx.fillText("عالية", cardX + 16, cardY + 24)
  //  segmented severity meter (4/5 filled = high)
  const segs = 5
  const gap = 4
  const barX = cardX + 16
  const barW = cardW - 32
  const sw = (barW - gap * (segs - 1)) / segs
  for (let i = 0; i < segs; i++) {
    ctx.fillStyle = i < 4 ? C.negative : "#E6E7EA"
    ctx.beginPath()
    ctx.roundRect(barX + i * (sw + gap), cardY + 34, sw, 6, 3)
    ctx.fill()
  }
  //  location row with a pin
  const py = cardY + 68
  ctx.fillStyle = C.informative
  ctx.beginPath()
  ctx.arc(cardX + cardW - 20, py - 3, 5, Math.PI, 0)
  ctx.lineTo(cardX + cardW - 20, py + 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.beginPath()
  ctx.arc(cardX + cardW - 20, py - 3, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.ink
  ctx.textAlign = "right"
  setFont(ctx, 400, 11, font)
  ctx.fillText("الخليل، شارع الشهداء", cardX + cardW - 32, py + 4)

  //  bottom control bar: gallery · shutter · camera
  const by = SCREEN_H - 52
  //  gallery (left)
  ctx.strokeStyle = "rgba(255,255,255,0.75)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(38, by - 13, 26, 26, 7)
  ctx.stroke()
  ctx.fillStyle = "rgba(255,255,255,0.75)"
  ctx.beginPath()
  ctx.arc(46, by - 5, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(42, by + 10)
  ctx.lineTo(50, by)
  ctx.lineTo(60, by + 10)
  ctx.closePath()
  ctx.fill()
  //  shutter (center)
  ctx.strokeStyle = C.white
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, by, 23, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = C.informative
  ctx.beginPath()
  ctx.arc(cx, by, 17, 0, Math.PI * 2)
  ctx.fill()
  //  camera glyph (right)
  ctx.strokeStyle = "rgba(255,255,255,0.75)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(SCREEN_W - 64, by - 9, 26, 20, 5)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(SCREEN_W - 51, by + 1, 5, 0, Math.PI * 2)
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

/* Back cover details — visible while the phone spins. */
const drawBack: Painter = (ctx, font, logoImg?: HTMLImageElement) => {
  // Space-gray matte-glass back cover with a soft top-down sheen
  const grad = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H)
  grad.addColorStop(0, "#3A3E45")
  grad.addColorStop(0.5, "#2B2E34")
  grad.addColorStop(1, "#1F2226")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)

  // camera island (top-right of the back = top-left as drawn,
  // since the back plane is rotated 180° around Y)
  ctx.fillStyle = "#15171B"
  ctx.beginPath()
  ctx.roundRect(16, 16, 66, 66, 20)
  ctx.fill()
  const lens = (lx: number, ly: number) => {
    ctx.fillStyle = "#0B0D10"
    ctx.beginPath()
    ctx.arc(lx, ly, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#2E3846"
    ctx.beginPath()
    ctx.arc(lx, ly, 6, 0, Math.PI * 2)
    ctx.fill()
    //  glass glint
    ctx.fillStyle = "rgba(255,255,255,0.35)"
    ctx.beginPath()
    ctx.arc(lx - 3, ly - 3, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  lens(37, 37)
  lens(63, 63)

  if (logoImg) {
    //  crisp white masar mark, centered (engraved-brand look)
    const w = 104
    const h = (logoImg.height / logoImg.width) * w
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.drawImage(logoImg, SCREEN_W / 2 - w / 2, SCREEN_H / 2 - h / 2, w, h)
    ctx.restore()
  }
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
  if (withNotch) dynamicIsland(ctx)
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
      made.screens.forEach(({ tex, canvas, painter, withNotch }) => {
        paintTexture(canvas, painter, font, withNotch)
        tex.needsUpdate = true
      })
      paintTexture(made.back.canvas, made.back.painter, font, made.back.withNotch)
      made.back.tex.needsUpdate = true
    })

    const img = new window.Image()
    img.src = "/logo/mark-white.svg"
    img.onload = () => {
      if (!alive) return
      const font = resolveFont()
      const boundPainter = (c: CanvasRenderingContext2D, f: string) => drawBack(c, f, img)
      paintTexture(made.back.canvas, boundPainter as Painter, font, false)
      made.back.tex.needsUpdate = true
    }
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
      //  index 0: front/back faces — near-black ceramic shield with a
      //  glossy clearcoat, so the bezel around the screen reads as a
      //  thin dark frame and a highlight sweeps the glass during spins
      new THREE.MeshPhysicalMaterial({
        color: "#111318",
        metalness: 0.2,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
      //  index 1: side rails — polished, reflective space-gray aluminum
      new THREE.MeshPhysicalMaterial({
        color: "#52565E",
        metalness: 0.95,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.4,
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
      <ambientLight intensity={0.85} />
      <directionalLight position={[250, 320, 500]} intensity={1.1} />
      <directionalLight
        position={[-350, -150, 250]}
        intensity={0.5}
        color="#dfe9f0"
      />
      {/* Self-contained studio environment (no network HDR) so the
          space-gray aluminum rails pick up soft, directional reflections */}
      <Environment resolution={256}>
        <Lightformer
          intensity={2.2}
          position={[0, 4, 3]}
          scale={[10, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={1.1}
          position={[-5, 1, 2]}
          scale={[3, 8, 1]}
          color="#cdd8e2"
        />
        <Lightformer
          intensity={1.1}
          position={[5, -1, 2]}
          scale={[3, 8, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={0.6}
          position={[0, -4, 2]}
          scale={[10, 3, 1]}
          color="#8b93a0"
        />
      </Environment>
      <PhoneBody pose={pose} />
    </Canvas>
  )
}
