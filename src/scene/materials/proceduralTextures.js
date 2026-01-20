import * as THREE from 'three'

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

// Very light fractal-ish noise (not Perlin): cheap and good enough for mobile.
function fbm(rand, x, y) {
  let v = 0
  let amp = 0.55
  let freq = 1
  for (let o = 0; o < 4; o++) {
    const nx = x * freq
    const ny = y * freq
    // hash-like smooth noise from sin/cos (cheap)
    const n = 0.5 + 0.5 * Math.sin(nx * 6.283 + Math.cos(ny * 6.283) * 1.7 + rand() * 6.283)
    v += n * amp
    amp *= 0.5
    freq *= 2
  }
  return clamp01(v)
}

export function makePlanetMaps({
  size = 384,
  seed = 1,
  tint = '#0f1a22',
  accent = '#00ffc8',
  contrast = 0.6,
  normalStrength = 1.1,
} = {}) {
  const rand = mulberry32(seed)
  const base = document.createElement('canvas')
  base.width = size
  base.height = size
  const bctx = base.getContext('2d', { willReadFrequently: true })

  const rough = document.createElement('canvas')
  rough.width = size
  rough.height = size
  const rctx = rough.getContext('2d', { willReadFrequently: true })

  const normal = document.createElement('canvas')
  normal.width = size
  normal.height = size
  const nctx = normal.getContext('2d', { willReadFrequently: true })

  const tintRgb = hexToRgb(tint)
  const accRgb = hexToRgb(accent)

  const img = bctx.createImageData(size, size)
  const rimg = rctx.createImageData(size, size)

  // 1) Generate height field and write baseColor + roughness
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1)
      const v = y / (size - 1)

      // spherical-ish banding (subtle)
      const bands = 0.5 + 0.5 * Math.sin((v * 2 - 1) * 3.3 + rand() * 2)
      const n = fbm(rand, u * 2.2, v * 2.2)
      const h = clamp01(0.55 * n + 0.45 * bands)
      height[y * size + x] = h

      // Base color: dark tint + subtle accent flecks
      const fleck = Math.pow(clamp01(n - 0.72) * 3.5, 2.0)
      const mixAcc = clamp01(fleck * 0.35)

      const c = clamp01(Math.pow(h, 1.2) * (0.65 + contrast * 0.35))
      const rr = Math.round(tintRgb.r * (0.75 + 0.5 * c) + accRgb.r * mixAcc)
      const gg = Math.round(tintRgb.g * (0.75 + 0.5 * c) + accRgb.g * mixAcc)
      const bb = Math.round(tintRgb.b * (0.75 + 0.5 * c) + accRgb.b * mixAcc)

      const i = (y * size + x) * 4
      img.data[i + 0] = rr
      img.data[i + 1] = gg
      img.data[i + 2] = bb
      img.data[i + 3] = 255

      // Roughness: more rough in dark areas, smoother in bright flecks
      const roughVal = clamp01(0.85 - 0.45 * c - 0.25 * mixAcc)
      const rv = Math.round(roughVal * 255)
      rimg.data[i + 0] = rv
      rimg.data[i + 1] = rv
      rimg.data[i + 2] = rv
      rimg.data[i + 3] = 255
    }
  }
  bctx.putImageData(img, 0, 0)
  rctx.putImageData(rimg, 0, 0)

  // 2) Normal map from height (Sobel-ish)
  const nimg = nctx.createImageData(size, size)
  const strength = normalStrength
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm1 = (x - 1 + size) % size
      const xp1 = (x + 1) % size
      const ym1 = (y - 1 + size) % size
      const yp1 = (y + 1) % size

      const hL = height[y * size + xm1]
      const hR = height[y * size + xp1]
      const hD = height[ym1 * size + x]
      const hU = height[yp1 * size + x]

      const dx = (hR - hL) * strength
      const dy = (hU - hD) * strength

      // normal approx: (-dx, -dy, 1)
      let nx = -dx
      let ny = -dy
      let nz = 1.0
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      nx /= len
      ny /= len
      nz /= len

      const i = (y * size + x) * 4
      nimg.data[i + 0] = Math.round((nx * 0.5 + 0.5) * 255)
      nimg.data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      nimg.data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255)
      nimg.data[i + 3] = 255
    }
  }
  nctx.putImageData(nimg, 0, 0)

  const map = new THREE.CanvasTexture(base)
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(1.4, 1.1)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4

  const roughnessMap = new THREE.CanvasTexture(rough)
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.repeat.set(1.4, 1.1)

  const normalMap = new THREE.CanvasTexture(normal)
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
  normalMap.repeat.set(1.4, 1.1)

  return { map, roughnessMap, normalMap }
}

export function makeStarMap({ size = 512, seed = 42, accent = '#00ffc8' } = {}) {
  const rand = mulberry32(seed)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const { r, g, b } = hexToRgb(accent)

  // radial gradient core
  const grd = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.48)
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grd.addColorStop(0.25, `rgba(${r},${g},${b},0.65)`)
  grd.addColorStop(0.6, `rgba(${r},${g},${b},0.15)`)
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)

  // add subtle turbulence strokes
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 140; i++) {
    const ang = rand() * Math.PI * 2
    const rad = (0.12 + rand() * 0.34) * size
    const x = size / 2 + Math.cos(ang) * rad
    const y = size / 2 + Math.sin(ang) * rad
    const w = (0.01 + rand() * 0.04) * size
    ctx.fillStyle = `rgba(${r},${g},${b},${0.06 + rand() * 0.10})`
    ctx.beginPath()
    ctx.ellipse(x, y, w * 1.8, w, ang, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
