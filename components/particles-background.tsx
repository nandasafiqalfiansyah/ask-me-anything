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
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: 'push'
          },
          onHover: {
            enable: true,
            mode: 'repulse'
          },
          resize: {
            enable: true
          }
        },
        modes: {
          push: {
            quantity: 4
          },
          repulse: {
            distance: 100,
            duration: 0.4
          }
        }
      },
      particles: {
        color: {
          value: theme === 'dark' ? '#ffffff' : '#000000'
        },
        links: {
          color: theme === 'dark' ? '#ffffff' : '#000000',
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce'
          },
          random: false,
          speed: 1,
          straight: false
        },
        number: {
          density: {
            enable: true,
            height: 800,
            width: 800
          },
          value: 80
        },
        opacity: {
          value: 0.3
        },
        shape: {
          type: 'circle'
        },
        size: {
          value: { min: 1, max: 3 }
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
