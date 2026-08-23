import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
          borderRadius: 40,
          border: '2px solid rgba(255, 255, 255, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* macOS Gloss sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '48%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        />
        {/* Center glowing letter N */}
        <span
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: -4
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
