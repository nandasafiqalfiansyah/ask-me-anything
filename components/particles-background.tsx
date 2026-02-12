'use client'

import { useEffect, useState, useMemo } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { type Container, type ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { useTheme } from 'next-themes'

export default function ParticlesBackground() {
  const [init, setInit] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container)
  }

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent'
        }
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          resize: {
            enable: true
          }
        }
      },
      particles: {
        color: {
          value: theme === 'dark' ? '#ffffff' : '#888888'
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out'
          },
          random: true,
          speed: 0.3,
          straight: false
        },
        number: {
          density: {
            enable: true,
            height: 1000,
            width: 1000
          },
          value: 50
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
            sync: false
          }
        },
        shape: {
          type: 'circle'
        },
        size: {
          value: { min: 0.5, max: 2 }
        }
      },
      detectRetina: true
    }),
    [theme]
  )

  if (!init) {
    return null
  }

  return (
    <Particles
      id='tsparticles'
      particlesLoaded={particlesLoaded}
      options={options}
      className='absolute inset-0 -z-10'
    />
  )
}
