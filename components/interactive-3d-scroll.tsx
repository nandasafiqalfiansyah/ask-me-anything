'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Sun,
  Eye,
  Sparkles,
  Zap,
  Compass,
  Play,
  Pause,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react'

type ThemeMode = 'dark' | 'light'
type VisualMode = 'realistic' | 'wireframe' | 'cosmic'

interface PlanetData {
  id: string
  name: string
  nameId: string
  color: string
  emissive?: string
  size: number
  distance: number
  speed: number
  rotationSpeed: number
  tilt: number
  description: string
  details: {
    type: string
    moons: number
    orbitalPeriod: string
    dayLength: string
  }
}

const PLANETS_CONFIG: PlanetData[] = [
  {
    id: 'sun',
    name: 'The Sun',
    nameId: 'Matahari',
    color: '#ffaa00',
    emissive: '#ff7700',
    size: 1.6,
    distance: 0,
    speed: 0,
    rotationSpeed: 0.004,
    tilt: 0.1,
    description: 'Pusat tata surya, bintang katai kuning sumber energi kehidupan.',
    details: {
      type: 'Yellow Dwarf (G2V)',
      moons: 8,
      orbitalPeriod: 'N/A',
      dayLength: '27 Earth Days'
    }
  },
  {
    id: 'mercury',
    name: 'Mercury',
    nameId: 'Merkurius',
    color: '#a3a3a3',
    size: 0.28,
    distance: 3.0,
    speed: 0.8,
    rotationSpeed: 0.01,
    tilt: 0.03,
    description: 'Planet terdekat dari matahari dengan permukaan kawah berbatu.',
    details: {
      type: 'Terrestrial Planet',
      moons: 0,
      orbitalPeriod: '88 Days',
      dayLength: '59 Earth Days'
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    nameId: 'Venus',
    color: '#eab308',
    size: 0.48,
    distance: 4.4,
    speed: 0.6,
    rotationSpeed: -0.006,
    tilt: 0.05,
    description: 'Planet terpanas dengan atmosfer tebal gas rumah kaca.',
    details: {
      type: 'Terrestrial Planet',
      moons: 0,
      orbitalPeriod: '225 Days',
      dayLength: '243 Earth Days'
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    nameId: 'Bumi',
    color: '#3b82f6',
    size: 0.52,
    distance: 6.0,
    speed: 0.45,
    rotationSpeed: 0.015,
    tilt: 0.41,
    description: 'Planet tempat tinggal kita yang kaya air dan kehidupan dengan 1 bulan.',
    details: {
      type: 'Terrestrial Planet',
      moons: 1,
      orbitalPeriod: '365.25 Days',
      dayLength: '24 Hours'
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    nameId: 'Mars',
    color: '#ef4444',
    size: 0.38,
    distance: 7.6,
    speed: 0.35,
    rotationSpeed: 0.014,
    tilt: 0.44,
    description: 'Planet Merah berdebu besi oksida dengan gunung tertinggi Olympus Mons.',
    details: {
      type: 'Terrestrial Planet',
      moons: 2,
      orbitalPeriod: '687 Days',
      dayLength: '24.6 Hours'
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    nameId: 'Yupiter',
    color: '#d97706',
    size: 1.1,
    distance: 10.2,
    speed: 0.22,
    rotationSpeed: 0.025,
    tilt: 0.05,
    description: 'Raksasa gas terbesar dengan badai raksasa Bintik Merah Besar.',
    details: {
      type: 'Gas Giant',
      moons: 95,
      orbitalPeriod: '11.86 Years',
      dayLength: '9.9 Hours'
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    nameId: 'Saturnus',
    color: '#f59e0b',
    size: 0.95,
    distance: 13.0,
    speed: 0.16,
    rotationSpeed: 0.022,
    tilt: 0.47,
    description: 'Permata tata surya dengan sistem cincin es dan batu yang megah.',
    details: {
      type: 'Gas Giant',
      moons: 146,
      orbitalPeriod: '29.45 Years',
      dayLength: '10.7 Hours'
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    nameId: 'Uranus',
    color: '#06b6d4',
    size: 0.65,
    distance: 15.6,
    speed: 0.11,
    rotationSpeed: -0.018,
    tilt: 1.7,
    description: 'Raksasa es dengan rotasi miring 98 derajat berwarna biru kehijauan.',
    details: {
      type: 'Ice Giant',
      moons: 28,
      orbitalPeriod: '84 Years',
      dayLength: '17.2 Hours'
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    nameId: 'Neptunus',
    color: '#2563eb',
    size: 0.62,
    distance: 18.0,
    speed: 0.08,
    rotationSpeed: 0.019,
    tilt: 0.5,
    description: 'Planet terjauh dari matahari dengan angin badai supersonik super kencang.',
    details: {
      type: 'Ice Giant',
      moons: 16,
      orbitalPeriod: '164.8 Years',
      dayLength: '16.1 Hours'
    }
  }
]

// Procedural Canvas Texture Generator Helpers
function createSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 512, 256)
  grad.addColorStop(0, '#fffbeb')
  grad.addColorStop(0.2, '#fde047')
  grad.addColorStop(0.5, '#f59e0b')
  grad.addColorStop(0.8, '#ea580c')
  grad.addColorStop(1, '#dc2626')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // Solar flares / granulation noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    const r = Math.random() * 8 + 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Deep ocean base
  ctx.fillStyle = '#0f3a68'
  ctx.fillRect(0, 0, 512, 256)

  // Continents (Green/Brown)
  ctx.fillStyle = '#226b38'
  const drawContinent = (cx: number, cy: number, w: number, h: number) => {
    ctx.beginPath()
    ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Eurasia / Africa / Americas / Oceania approximations
  drawContinent(320, 90, 80, 50)
  drawContinent(310, 150, 45, 60)
  drawContinent(140, 90, 60, 45)
  drawContinent(165, 170, 40, 55)
  drawContinent(410, 180, 35, 25)

  // Polar ice caps
  ctx.fillStyle = '#e2f1fc'
  ctx.fillRect(0, 0, 512, 18)
  ctx.fillRect(0, 238, 512, 18)

  // Atmosphere swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512
    const y = 30 + Math.random() * 190
    ctx.beginPath()
    ctx.ellipse(x, y, 40 + Math.random() * 30, 8, Math.random() * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}

function createJupiterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const bands = [
    '#e7cfb0', '#c89363', '#a75d28', '#e7cfb0', '#b97a44',
    '#edd5bc', '#9d5225', '#e7cfb0', '#c2854e', '#ddc1a3'
  ]

  const bandH = 256 / bands.length
  bands.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(0, i * bandH, 512, bandH + 2)
  })

  // Great Red Spot
  ctx.fillStyle = '#b91c1c'
  ctx.beginPath()
  ctx.ellipse(320, 160, 35, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Turbulent storm wisps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    ctx.fillRect(x, y, Math.random() * 60 + 20, 4)
  }

  return new THREE.CanvasTexture(canvas)
}

function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 1
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, 'rgba(200, 170, 130, 0)')
  grad.addColorStop(0.15, 'rgba(220, 190, 140, 0.7)')
  grad.addColorStop(0.45, 'rgba(240, 210, 160, 0.85)')
  grad.addColorStop(0.55, 'rgba(30, 20, 10, 0.05)') // Cassini Division
  grad.addColorStop(0.65, 'rgba(210, 180, 130, 0.75)')
  grad.addColorStop(0.9, 'rgba(180, 150, 110, 0.4)')
  grad.addColorStop(1, 'rgba(150, 120, 80, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 1)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

export default function Interactive3DScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visualMode, setVisualMode] = useState<VisualMode>('realistic')
  const [showControls, setShowControls] = useState(false)
  const [showOrbits, setShowOrbits] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('Tata Surya')
  const { resolvedTheme } = useTheme()

  const isPausedRef = useRef(false)
  isPausedRef.current = isPaused

  const visualModeRef = useRef<VisualMode>('realistic')
  visualModeRef.current = visualMode

  const themeRef = useRef<ThemeMode>('dark')
  themeRef.current = (resolvedTheme === 'light' ? 'light' : 'dark') as ThemeMode

  const showOrbitsRef = useRef(true)
  showOrbitsRef.current = showOrbits

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const isDark = themeRef.current === 'dark'
    
    // Deep space fog
    scene.fog = new THREE.FogExp2(isDark ? 0x05070f : 0xf1f5f9, 0.02)

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    )
    camera.position.set(0, 12, 22)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    container.appendChild(renderer.domElement)

    // 2. Solar Illumination & Ambient Starlight
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.35 : 0.9)
    scene.add(ambientLight)

    // Omnidirectional Sunlight originating from center
    const sunLight = new THREE.PointLight(0xfff7ed, isDark ? 4.5 : 3.0, 50, 0.5)
    sunLight.position.set(0, 0, 0)
    scene.add(sunLight)

    const sunCoronaLight = new THREE.PointLight(0xffa500, isDark ? 2.5 : 1.5, 20)
    sunCoronaLight.position.set(0, 0, 0)
    scene.add(sunCoronaLight)

    // 3. Solar System Hierarchy
    const solarSystemGroup = new THREE.Group()
    scene.add(solarSystemGroup)

    // A. The Sun (Matahari)
    const sunGeo = new THREE.SphereGeometry(1.6, 48, 48)
    const sunTexture = createSunTexture()
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: 0xffffff
    })
    const sunMesh = new THREE.Mesh(sunGeo, sunMat)
    solarSystemGroup.add(sunMesh)

    // Sun Outer Pulsating Corona Atmosphere
    const coronaGeo = new THREE.SphereGeometry(1.85, 32, 32)
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat)
    solarSystemGroup.add(coronaMesh)

    // Sun Rays Flare Ring
    const sunFlareGeo = new THREE.RingGeometry(1.6, 2.8, 64)
    const sunFlareMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const sunFlareMesh = new THREE.Mesh(sunFlareGeo, sunFlareMat)
    sunFlareMesh.rotation.x = Math.PI / 2
    solarSystemGroup.add(sunFlareMesh)

    // B. Planets & Orbiting Moons
    const planetMeshes: {
      id: string
      pivot: THREE.Group
      mesh: THREE.Mesh
      material: THREE.Material
      wireframeMaterial: THREE.MeshBasicMaterial
      cloudsMesh?: THREE.Mesh
      ringMesh?: THREE.Mesh
      moonPivot?: THREE.Group
      config: PlanetData
    }[] = []

    const orbitLinesGroup = new THREE.Group()
    solarSystemGroup.add(orbitLinesGroup)

    // Pre-create textures
    const earthTexture = createEarthTexture()
    const jupiterTexture = createJupiterTexture()
    const saturnRingTexture = createSaturnRingTexture()

    PLANETS_CONFIG.filter(p => p.id !== 'sun').forEach(planet => {
      // 1. Orbit Path Ring Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        planet.distance, planet.distance,
        0, 2 * Math.PI,
        false,
        0
      )
      const points = orbitCurve.getPoints(120)
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      )
      const orbitMat = new THREE.LineBasicMaterial({
        color: isDark ? 0x38bdf8 : 0x0284c7,
        transparent: true,
        opacity: isDark ? 0.25 : 0.35
      })
      const orbitLine = new THREE.Line(orbitGeo, orbitMat)
      orbitLinesGroup.add(orbitLine)

      // 2. Planet Pivot Group (Handles Orbital Revolution around Sun)
      const pivot = new THREE.Group()
      // Give initial random angle so planets don't line up in a single straight row
      const initialAngle = Math.random() * Math.PI * 2
      pivot.rotation.y = initialAngle
      solarSystemGroup.add(pivot)

      // 3. Planet Mesh Geometry & Material
      const planetGeo = new THREE.SphereGeometry(planet.size, 32, 32)
      let realisticMat: THREE.Material

      if (planet.id === 'earth') {
        realisticMat = new THREE.MeshStandardMaterial({
          map: earthTexture,
          roughness: 0.6,
          metalness: 0.1
        })
      } else if (planet.id === 'jupiter') {
        realisticMat = new THREE.MeshStandardMaterial({
          map: jupiterTexture,
          roughness: 0.7,
          metalness: 0.05
        })
      } else {
        realisticMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planet.color),
          roughness: 0.65,
          metalness: 0.2
        })
      }

      const wireframeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.color),
        wireframe: true
      })

      const planetMesh = new THREE.Mesh(planetGeo, realisticMat)
      planetMesh.position.set(planet.distance, 0, 0)
      planetMesh.rotation.z = planet.tilt
      pivot.add(planetMesh)

      let cloudsMesh: THREE.Mesh | undefined
      let ringMesh: THREE.Mesh | undefined
      let moonPivot: THREE.Group | undefined

      // Earth Cloud Layer & Moon
      if (planet.id === 'earth') {
        const cloudGeo = new THREE.SphereGeometry(planet.size * 1.025, 32, 32)
        const cloudMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        })
        cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat)
        planetMesh.add(cloudsMesh)

        // Moon Orbit
        moonPivot = new THREE.Group()
        planetMesh.add(moonPivot)

        const moonGeo = new THREE.SphereGeometry(0.12, 16, 16)
        const moonMat = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.9
        })
        const moonMesh = new THREE.Mesh(moonGeo, moonMat)
        moonMesh.position.set(1.0, 0.2, 0)
        moonPivot.add(moonMesh)
      }

      // Saturn Rings
      if (planet.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(1.3, 2.4, 64)
        // Correct UVs for radial ring texture mapping
        const pos = ringGeo.attributes.position
        const uvs = ringGeo.attributes.uv
        const v3 = new THREE.Vector3()
        for (let i = 0; i < pos.count; i++) {
          v3.fromBufferAttribute(pos, i)
          const radius = v3.length()
          const u = (radius - 1.3) / (2.4 - 1.3)
          uvs.setXY(i, u, 0)
        }

        const ringMat = new THREE.MeshStandardMaterial({
          map: saturnRingTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          roughness: 0.5
        })
        ringMesh = new THREE.Mesh(ringGeo, ringMat)
        ringMesh.rotation.x = Math.PI / 2 + 0.35
        planetMesh.add(ringMesh)
      }

      // Uranus Tilted Ring
      if (planet.id === 'uranus') {
        const uRingGeo = new THREE.RingGeometry(0.9, 1.2, 48)
        const uRingMat = new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35
        })
        const uRing = new THREE.Mesh(uRingGeo, uRingMat)
        uRing.rotation.y = Math.PI / 2
        planetMesh.add(uRing)
      }

      planetMeshes.push({
        id: planet.id,
        pivot,
        mesh: planetMesh,
        material: realisticMat,
        wireframeMaterial: wireframeMat,
        cloudsMesh,
        ringMesh,
        moonPivot,
        config: planet
      })
    })

    // C. Asteroid Belt (Sabuk Asteroid between Mars & Jupiter, dist 8.6 - 9.4)
    const asteroidCount = 450
    const asteroidGeo = new THREE.DodecahedronGeometry(0.04, 0)
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x78716c : 0xa8a29e,
      roughness: 0.9,
      metalness: 0.1
    })
    const asteroidInstanced = new THREE.InstancedMesh(
      asteroidGeo,
      asteroidMat,
      asteroidCount
    )
    const dummy = new THREE.Object3D()

    for (let i = 0; i < asteroidCount; i++) {
      const radius = 8.6 + Math.random() * 1.0
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 0.6

      dummy.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      const scale = 0.5 + Math.random() * 1.5
      dummy.scale.set(scale, scale, scale)
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      dummy.updateMatrix()
      asteroidInstanced.setMatrixAt(i, dummy.matrix)
    }
    solarSystemGroup.add(asteroidInstanced)

    // D. Starfield Dust Constellation (1,200 twinkling stars)
    const starsCount = 1200
    const starsGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starsCount * 3)
    const starColors = new Float32Array(starsCount * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#fda4af'),
      new THREE.Color('#a78bfa')
    ]

    for (let i = 0; i < starsCount * 3; i += 3) {
      const dist = 35 + Math.random() * 55
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      starPositions[i] = dist * Math.sin(phi) * Math.cos(theta)
      starPositions[i + 1] = dist * Math.sin(phi) * Math.sin(theta)
      starPositions[i + 2] = dist * Math.cos(phi)

      const col = palette[Math.floor(Math.random() * palette.length)]
      starColors[i] = col.r
      starColors[i + 1] = col.g
      starColors[i + 2] = col.b
    }

    starsGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    )
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starsMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.85 : 0.55,
      blending: THREE.AdditiveBlending
    })

    const starField = new THREE.Points(starsGeo, starsMat)
    scene.add(starField)

    // 4. Mouse Coordinates & Parallax Damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // 5. Scroll Listener & Celestial Trajectory Navigation
    let targetScrollProgress = 0
    const onScroll = () => {
      const currentScrollY = window.scrollY
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
      const progress = Math.min(Math.max(currentScrollY / maxScroll, 0), 1)
      targetScrollProgress = progress
      setScrollProgress(progress)

      if (progress < 0.15) setActiveSection('Matahari & Venus')
      else if (progress < 0.35) setActiveSection('Bumi & Mars')
      else if (progress < 0.55) setActiveSection('Sabuk Asteroid')
      else if (progress < 0.75) setActiveSection('Yupiter & Saturnus')
      else if (progress < 0.9) setActiveSection('Uranus & Neptunus')
      else setActiveSection('Tepi Tata Surya')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // 6. Window Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    window.addEventListener('resize', onResize)

    // 7. Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const delta = clock.getDelta()
      const elapsedTime = clock.getElapsedTime()
      const currentMode = visualModeRef.current
      const isCurrentlyDark = themeRef.current === 'dark'

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Orbit Visibility Toggle
      orbitLinesGroup.visible = showOrbitsRef.current

      // Sun Animations
      sunMesh.rotation.y += 0.003
      coronaMesh.rotation.z += 0.002
      const pulseScale = 1.0 + Math.sin(elapsedTime * 2.0) * 0.04
      coronaMesh.scale.set(pulseScale, pulseScale, pulseScale)
      sunFlareMesh.rotation.z += 0.001

      // Planet Orbital Revolutions & Axial Rotations
      if (!isPausedRef.current) {
        planetMeshes.forEach(({ pivot, mesh, cloudsMesh, moonPivot, config }) => {
          // Orbital revolution
          pivot.rotation.y += config.speed * delta * 0.6

          // Planet axial rotation
          mesh.rotation.y += config.rotationSpeed

          // Earth Cloud rotation
          if (cloudsMesh) {
            cloudsMesh.rotation.y += 0.008
          }

          // Moon revolution around Earth
          if (moonPivot) {
            moonPivot.rotation.y += delta * 1.5
          }
        })

        // Asteroid belt revolution
        asteroidInstanced.rotation.y += delta * 0.08
      }

      // Starfield subtle slow drift
      starField.rotation.y = elapsedTime * 0.005 + targetScrollProgress * 0.5

      // Camera Cinematic Trajectory along Scroll
      // Trajectory moves smoothly from Sun -> Earth -> Gas Giants as user scrolls down
      const scrollAngle = targetScrollProgress * Math.PI * 1.5
      const cameraDist = 20 - targetScrollProgress * 8
      const cameraHeight = 12 - targetScrollProgress * 6 + Math.sin(targetScrollProgress * Math.PI) * 4

      const targetCamX = Math.sin(scrollAngle) * cameraDist + mouse.x * 2.5
      const targetCamZ = Math.cos(scrollAngle) * cameraDist + mouse.y * 1.5
      const targetCamY = cameraHeight + mouse.y * 2.0

      camera.position.x += (targetCamX - camera.position.x) * 0.05
      camera.position.y += (targetCamY - camera.position.y) * 0.05
      camera.position.z += (targetCamZ - camera.position.z) * 0.05

      // Solar system tilt towards viewer
      solarSystemGroup.rotation.x = 0.25 + mouse.y * 0.1
      solarSystemGroup.rotation.z = mouse.x * 0.05

      camera.lookAt(
        Math.sin(scrollAngle) * (targetScrollProgress * 5),
        0,
        Math.cos(scrollAngle) * (targetScrollProgress * 5)
      )

      // Visual Modes
      const isWireframe = currentMode === 'wireframe'
      planetMeshes.forEach(({ mesh, material, wireframeMaterial }) => {
        mesh.material = isWireframe ? wireframeMaterial : material
      })

      if (currentMode === 'cosmic') {
        starsMat.size = 0.2
        starsMat.opacity = isCurrentlyDark ? 0.95 : 0.7
        sunCoronaLight.intensity = isCurrentlyDark ? 4.5 : 2.5
      } else {
        starsMat.size = 0.12
        starsMat.opacity = isCurrentlyDark ? 0.8 : 0.5
        sunCoronaLight.intensity = isCurrentlyDark ? 2.5 : 1.5
      }

      renderer.render(scene, camera)
    }

    animate()

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <>
      {/* 3D WebGL Solar System Canvas */}
      <div
        ref={containerRef}
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden opacity-90 transition-opacity duration-700'
      />

      {/* Floating Solar System Controller & Planet Explorer */}
      <div className='fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8'>
        {/* Planet Detail Card Modal */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='mb-2 w-72 rounded-2xl border border-primary/30 bg-background/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-inset ring-foreground/5 dark:bg-zinc-950/90'
            >
              <div className='flex items-center justify-between border-b border-border/60 pb-2.5'>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3.5 w-3.5 rounded-full ring-2 ring-foreground/20'
                    style={{ backgroundColor: selectedPlanet.color }}
                  />
                  <div>
                    <h4 className='text-sm font-bold text-foreground'>
                      {selectedPlanet.nameId}
                    </h4>
                    <p className='text-[10px] text-muted-foreground'>
                      {selectedPlanet.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  ✕
                </button>
              </div>

              <p className='mt-2.5 text-xs leading-relaxed text-muted-foreground'>
                {selectedPlanet.description}
              </p>

              <div className='mt-3 grid grid-cols-2 gap-2 border-t border-border/40 pt-2.5 text-[11px]'>
                <div className='rounded-lg bg-muted/50 p-2'>
                  <span className='block text-[9px] text-muted-foreground'>Tipe</span>
                  <span className='font-semibold text-foreground'>
                    {selectedPlanet.details.type}
                  </span>
                </div>
                <div className='rounded-lg bg-muted/50 p-2'>
                  <span className='block text-[9px] text-muted-foreground'>Satelit Alami</span>
                  <span className='font-semibold text-foreground'>
                    {selectedPlanet.details.moons} Bulan
                  </span>
                </div>
                <div className='rounded-lg bg-muted/50 p-2'>
                  <span className='block text-[9px] text-muted-foreground'>Periode Orbit</span>
                  <span className='font-semibold text-foreground'>
                    {selectedPlanet.details.orbitalPeriod}
                  </span>
                </div>
                <div className='rounded-lg bg-muted/50 p-2'>
                  <span className='block text-[9px] text-muted-foreground'>Panjang Hari</span>
                  <span className='font-semibold text-foreground'>
                    {selectedPlanet.details.dayLength}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Solar System Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className='flex w-80 flex-col gap-3 rounded-2xl border border-border/80 bg-background/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-inset ring-foreground/5 dark:bg-zinc-950/90'
            >
              {/* Header / Active Zone */}
              <div className='flex items-center justify-between border-b border-border/60 pb-2 text-xs'>
                <span className='flex items-center gap-1.5 font-bold text-foreground'>
                  <Sun className='h-4 w-4 text-amber-500 animate-spin-slow' />
                  Tata Surya 3D
                </span>
                <span className='rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary'>
                  {activeSection} ({Math.round(scrollProgress * 100)}%)
                </span>
              </div>

              {/* Quick Planet Explorer Grid */}
              <div className='flex flex-col gap-1.5'>
                <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  Jelajahi Planet
                </span>
                <div className='grid grid-cols-4 gap-1.5'>
                  {PLANETS_CONFIG.map(planet => (
                    <button
                      key={planet.id}
                      onClick={() => setSelectedPlanet(planet)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[10px] font-medium transition-all ${
                        selectedPlanet?.id === planet.id
                          ? 'border-primary bg-primary/15 text-primary shadow-xs'
                          : 'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span
                        className='h-2.5 w-2.5 rounded-full shadow-xs'
                        style={{ backgroundColor: planet.color }}
                      />
                      <span className='truncate text-[9px]'>{planet.nameId}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Modes Selector */}
              <div className='flex flex-col gap-1.5 pt-1'>
                <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  Mode Tampilan
                </span>
                <div className='grid grid-cols-3 gap-1.5'>
                  <button
                    onClick={() => setVisualMode('realistic')}
                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      visualMode === 'realistic'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Globe className='h-3 w-3' />
                    Realistis
                  </button>

                  <button
                    onClick={() => setVisualMode('wireframe')}
                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      visualMode === 'wireframe'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Layers className='h-3 w-3' />
                    Holo-Grid
                  </button>

                  <button
                    onClick={() => setVisualMode('cosmic')}
                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      visualMode === 'cosmic'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Sparkles className='h-3 w-3' />
                    Kosmik
                  </button>
                </div>
              </div>

              {/* Simulation Controls: Orbits & Pause */}
              <div className='flex items-center justify-between border-t border-border/40 pt-2 text-xs'>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className='flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted'
                >
                  {isPaused ? (
                    <>
                      <Play className='h-3 w-3 text-emerald-500' /> Lanjutkan
                    </>
                  ) : (
                    <>
                      <Pause className='h-3 w-3 text-amber-500' /> Jeda Orbit
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowOrbits(!showOrbits)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    showOrbits
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  <Compass className='h-3 w-3' />
                  {showOrbits ? 'Orbit Aktif' : 'Orbit Mati'}
                </button>
              </div>

              {/* Scroll Depth Progress Gauge */}
              <div className='flex flex-col gap-1 pt-0.5'>
                <div className='flex justify-between text-[10px] text-muted-foreground'>
                  <span>Kedalaman Penjelajahan</span>
                  <span className='font-mono font-medium'>
                    {Math.round(scrollProgress * 100)}%
                  </span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-full bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500 transition-all duration-150'
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Toggle Floating Pill Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowControls(!showControls)}
          className='group flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-2.5 shadow-xl backdrop-blur-md transition-colors hover:border-primary/50 hover:bg-background dark:bg-zinc-900/85'
          title='Kontrol Tata Surya 3D'
        >
          <div className='relative flex h-2.5 w-2.5 items-center justify-center'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75' />
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500' />
          </div>

          <span className='text-xs font-semibold tracking-tight text-foreground'>
            Tata Surya 3D
          </span>

          <motion.div
            animate={{ rotate: showControls ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Eye className='h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground' />
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}
