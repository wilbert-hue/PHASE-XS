"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    const spacing = 40
    const dotBaseRadius = 1
    const waveSpeed = 0.0004
    const waveAmplitude = 8
    const connectionDistance = 80

    // Full 5-color palette
    const palette = [
      "27, 73, 101",   // #1B4965
      "30, 96, 128",   // #1E6080
      "42, 143, 156",  // #2A8F9C
      "58, 175, 169",  // #3AAFA9
      "79, 189, 186",  // #4FBDBA
    ]

    const animate = (time: number) => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const cols = Math.ceil(w / spacing) + 2
      const rows = Math.ceil(h / spacing) + 2

      // Precompute dot positions with wave distortion
      const dots: { x: number; y: number; opacity: number; radius: number; color: string }[] = []

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const baseX = col * spacing
          const baseY = row * spacing

          // Multiple overlapping sine waves for organic movement
          const wave1 = Math.sin(baseX * 0.008 + time * waveSpeed) * waveAmplitude
          const wave2 = Math.cos(baseY * 0.006 + time * waveSpeed * 0.7) * waveAmplitude * 0.6
          const wave3 = Math.sin((baseX + baseY) * 0.004 + time * waveSpeed * 1.3) * waveAmplitude * 0.4

          const x = baseX + wave2 + wave3 * 0.5
          const y = baseY + wave1 + wave3 * 0.5

          // Pulsing opacity based on position and time
          const pulse = Math.sin(baseX * 0.01 + baseY * 0.01 + time * 0.0008) * 0.5 + 0.5
          const opacity = 0.08 + pulse * 0.18

          // Subtle radius variation
          const radius = dotBaseRadius + pulse * 0.6

          // Cycle through palette based on position + time
          const colorIdx = Math.floor((baseX * 0.005 + baseY * 0.005 + time * 0.0002) % palette.length + palette.length) % palette.length
          const color = palette[colorIdx]

          dots.push({ x, y, opacity, radius, color })
        }
      }

      // Draw connections between nearby dots
      ctx.lineWidth = 0.5
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]
        // Only check right neighbor and below neighbor for efficiency
        const rightIdx = i + 1
        const belowIdx = i + cols

        if (rightIdx < dots.length && (i + 1) % cols !== 0) {
          const b = dots[rightIdx]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const alpha = Math.min(a.opacity, b.opacity) * 0.3 * (1 - dist / connectionDistance)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${a.color}, ${alpha})`
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        if (belowIdx < dots.length) {
          const b = dots[belowIdx]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const alpha = Math.min(a.opacity, b.opacity) * 0.3 * (1 - dist / connectionDistance)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${a.color}, ${alpha})`
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Draw dots
      for (const dot of dots) {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dot.color}, ${dot.opacity})`
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
