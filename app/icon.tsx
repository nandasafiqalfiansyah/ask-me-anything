import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* macOS Gloss sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        />
        {/* Monogram N */}
        <span
          style={{
            fontWeight: 900,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: -0.5
          }}
        >
          N
        </span>
      </div>
    ),
    {
      ...size
    }
  )
}
