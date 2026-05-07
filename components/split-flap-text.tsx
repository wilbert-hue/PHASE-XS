"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useMemo, useState, useCallback, useEffect, useRef, createContext, useContext } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface AudioContextType {
  isMuted: boolean
  toggleMute: () => void
  playClick: () => void
}

const SplitFlapAudioContext = createContext<AudioContextType | null>(null)

function useSplitFlapAudio() {
  return useContext(SplitFlapAudioContext)
}

export function SplitFlapAudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass()
      }
    }
    return audioContextRef.current
  }, [])

  const triggerHaptic = useCallback(() => {
    if (isMuted) return
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  }, [isMuted])

  const playClick = useCallback(() => {
    if (isMuted) return

    triggerHaptic()

    try {
      const ctx = getAudioContext()
      if (!ctx) return

      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const lowpass = ctx.createBiquadFilter()

      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.015)

      filter.type = "bandpass"
      filter.frequency.setValueAtTime(1200, ctx.currentTime)
      filter.Q.setValueAtTime(0.8, ctx.currentTime)

      lowpass.type = "lowpass"
      lowpass.frequency.value = 2500
      lowpass.Q.value = 0.5

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(lowpass)
      lowpass.connect(ctx.destination)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.02)
    } catch {
      // Audio not supported
    }
  }, [isMuted, getAudioContext, triggerHaptic])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    if (isMuted) {
      try {
        const ctx = getAudioContext()
        if (ctx && ctx.state === "suspended") {
          ctx.resume()
        }
      } catch {
        // Audio not supported
      }
    }
  }, [isMuted, getAudioContext])

  const value = useMemo(() => ({ isMuted, toggleMute, playClick }), [isMuted, toggleMute, playClick])

  return <SplitFlapAudioContext.Provider value={value}>{children}</SplitFlapAudioContext.Provider>
}

export function SplitFlapMuteToggle({ className = "" }: { className?: string }) {
  const audio = useSplitFlapAudio()
  if (!audio) return null

  return (
    <button
      onClick={audio.toggleMute}
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 ${className}`}
      aria-label={audio.isMuted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      <span>{audio.isMuted ? "Sound Off" : "Sound On"}</span>
    </button>
  )
}

interface SplitFlapTextProps {
  text: string
  className?: string
  speed?: number
}

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-".split("")

function SplitFlapTextInner({ text, className = "", speed = 50 }: SplitFlapTextProps) {
  const chars = useMemo(() => text.split(""), [text])
  const [animationKey, setAnimationKey] = useState(0)
  const [hasInitialized, setHasInitialized] = useState(false)
  const audio = useSplitFlapAudio()

  const handleMouseEnter = useCallback(() => {
    setAnimationKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialized(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`inline-flex gap-[0.08em] items-center cursor-pointer ${className}`}
      aria-label={text}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: "1000px" }}
    >
      {chars.map((char, index) => (
        <SplitFlapChar
          key={index}
          char={char.toUpperCase()}
          index={index}
          animationKey={animationKey}
          skipEntrance={hasInitialized}
          speed={speed}
          playClick={audio?.playClick}
        />
      ))}
    </div>
  )
}

export function SplitFlapText(props: SplitFlapTextProps) {
  return <SplitFlapTextInner {...props} />
}

const DIGITS = "0123456789".split("")

/** One intro beat: NCT + live digits (no empty “dot” tiles), then title scramble. */
const INTRO_HOLD_MS = 3600

const TILE_FONT = "clamp(4rem, 15vw, 14rem)"

const NCT_PREFIX = ["N", "C", "T"] as const

/** Static N/C/T on the same gray tile as digits — no pale “white” until PHASE-XS settles. */
function NctLetterTile({ letter }: { letter: string }) {
  const display = CHARSET.includes(letter) ? letter : " "
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center font-[family-name:var(--font-bebas)]"
      style={{
        fontSize: TILE_FONT,
        width: "0.65em",
        height: "1.05em",
        backgroundColor: "#d4e4e9",
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-foreground/10 pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
        <span className="block translate-y-[0.52em] leading-none" style={{ color: "#1B4965" }}>
          {display}
        </span>
      </div>
      <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
        <span className="-translate-y-[0.52em] leading-none" style={{ color: "#1B4965" }}>
          {display}
        </span>
      </div>
    </div>
  )
}

function DigitTickerTile({
  speed = 140,
  tickKey = 0,
  playClick,
}: {
  speed?: number
  tickKey?: number
  playClick?: () => void
}) {
  const [d, setD] = useState(() => DIGITS[Math.floor(Math.random() * DIGITS.length)])
  useEffect(() => {
    const id = setInterval(() => {
      setD(DIGITS[Math.floor(Math.random() * DIGITS.length)])
      playClick?.()
    }, speed)
    return () => clearInterval(id)
  }, [speed, tickKey, playClick])
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center font-[family-name:var(--font-bebas)]"
      style={{
        fontSize: TILE_FONT,
        width: "0.65em",
        height: "1.05em",
        backgroundColor: "#d4e4e9",
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-foreground/10 pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
        <span className="block translate-y-[0.52em] leading-none transition-colors duration-100" style={{ color: "#2A8F9C" }}>
          {d}
        </span>
      </div>
      <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
        <span className="-translate-y-[0.52em] leading-none transition-colors duration-100" style={{ color: "#2A8F9C" }}>
          {d}
        </span>
      </div>
    </div>
  )
}

/**
 * Hero row: **NCT** (navy on gray) + five teal digit tickers for one hold, then a full-charset
 * split-flap to **PHASE-XS** (longer scramble, pale tiles only as each column settles).
 */
export function SplitFlapPhaseXsNctBack({ speed = 72 }: { speed?: number }) {
  const text = "PHASE-XS"
  const chars = useMemo(() => text.split(""), [text])
  const [showTitle, setShowTitle] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [tickKey, setTickKey] = useState(0)
  const audio = useSplitFlapAudio()

  useEffect(() => {
    setShowTitle(false)
    const t = setTimeout(() => setShowTitle(true), INTRO_HOLD_MS)
    return () => clearTimeout(t)
  }, [replayKey])

  const handleMouseEnter = useCallback(() => {
    setReplayKey((p) => p + 1)
    setAnimationKey((p) => p + 1)
    setTickKey((p) => p + 1)
  }, [])

  return (
    <div
      className="inline-flex gap-[0.08em] items-center cursor-pointer"
      aria-label={text}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: "1000px" }}
    >
      {!showTitle ? (
        Array.from({ length: 8 }, (_, index) =>
          index < 3 ? (
            <NctLetterTile key={`${replayKey}-nct-${index}`} letter={NCT_PREFIX[index]} />
          ) : (
            <DigitTickerTile
              key={`${replayKey}-d-${index}`}
              speed={115 + (index - 3) * 18}
              tickKey={tickKey}
              playClick={audio?.playClick}
            />
          ),
        )
      ) : (
        chars.map((char, index) => (
          <SplitFlapChar
            key={`${replayKey}-${index}`}
            char={char.toUpperCase()}
            index={index}
            animationKey={animationKey}
            skipEntrance={false}
            speed={speed}
            playClick={audio?.playClick}
            baseFlips={15}
            flipsPerIndex={4}
            snappyEntrance
          />
        ))
      )}
    </div>
  )
}

export interface SplitFlapCharProps {
  char: string
  index: number
  animationKey: number
  skipEntrance: boolean
  speed: number
  playClick?: () => void
  /** If set, unscramble cycles only through these glyphs (default: full A–Z, digits, hyphen). */
  scrambleCharset?: readonly string[]
  /** Minimum tick count before a column can settle (default 8). */
  baseFlips?: number
  /** Extra ticks per column index (default 3). */
  flipsPerIndex?: number
  /** Skip the float-up entrance so the row reads as one mechanical board. */
  snappyEntrance?: boolean
}

export function SplitFlapChar({
  char,
  index,
  animationKey,
  skipEntrance,
  speed,
  playClick,
  scrambleCharset,
  baseFlips = 8,
  flipsPerIndex = 3,
  snappyEntrance = false,
}: SplitFlapCharProps) {
  const displayChar = CHARSET.includes(char) ? char : " "
  const isSpace = char === " "
  const [currentChar, setCurrentChar] = useState(skipEntrance ? displayChar : " ")
  const [isSettled, setIsSettled] = useState(skipEntrance)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pool =
    scrambleCharset && scrambleCharset.length > 0 ? (scrambleCharset as string[]) : CHARSET

  const tileDelay = 0.15 * index

  const bgColor = isSettled ? "#e8f0f3" : "#d4e4e9"
  const textColor = isSettled ? "#1B4965" : "#2A8F9C"

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (isSpace) {
      setCurrentChar(" ")
      setIsSettled(true)
      return
    }

    setIsSettled(false)
    setCurrentChar(pool[Math.floor(Math.random() * pool.length)])

    const startDelay = skipEntrance ? tileDelay * 400 : tileDelay * 800
    let flipIndex = 0
    let hasStartedSettling = false

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const settleThreshold = baseFlips + index * flipsPerIndex

        if (flipIndex >= settleThreshold && !hasStartedSettling) {
          hasStartedSettling = true
          if (intervalRef.current) clearInterval(intervalRef.current)
          setCurrentChar(displayChar)
          setIsSettled(true)
          if (playClick) playClick()
          return
        }
        setCurrentChar(pool[Math.floor(Math.random() * pool.length)])
        if (flipIndex % 2 === 0 && playClick) playClick()
        flipIndex++
      }, speed)
    }, startDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [
    displayChar,
    isSpace,
    tileDelay,
    animationKey,
    skipEntrance,
    index,
    speed,
    playClick,
    pool,
    baseFlips,
    flipsPerIndex,
  ])

  if (isSpace) {
    return (
      <div
        style={{
          width: "0.3em",
          fontSize: "clamp(4rem, 15vw, 14rem)",
        }}
      />
    )
  }

  const tileWidth = displayChar === "-" ? "0.72em" : "0.65em"
  const glyphStyle: React.CSSProperties = {
    color: textColor,
    ...(displayChar === "-"
      ? { transform: "scaleX(1.35)", transformOrigin: "center center" }
      : {}),
  }

  return (
    <motion.div
      initial={skipEntrance || snappyEntrance ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: snappyEntrance ? 0 : tileDelay, duration: snappyEntrance ? 0.12 : 0.3, ease: "easeOut" }}
      className="relative overflow-hidden flex items-center justify-center font-[family-name:var(--font-bebas)]"
      style={{
        fontSize: "clamp(4rem, 15vw, 14rem)",
        width: tileWidth,
        height: "1.05em",
        backgroundColor: bgColor,
        transformStyle: "preserve-3d",
        transition: "background-color 0.15s ease",
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-foreground/10 pointer-events-none z-10" />

      <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
        <span
          className="block translate-y-[0.52em] leading-none transition-colors duration-150"
          style={glyphStyle}
        >
          {currentChar}
        </span>
      </div>

      <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
        <span className="-translate-y-[0.52em] leading-none transition-colors duration-150" style={glyphStyle}>
          {currentChar}
        </span>
      </div>

      <motion.div
        key={`${animationKey}-${isSettled}`}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{
          delay: skipEntrance ? tileDelay * 0.5 : tileDelay + 0.15,
          duration: 0.25,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="absolute inset-x-0 top-0 bottom-1/2 origin-bottom overflow-hidden"
        style={{
          backgroundColor: bgColor,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          transition: "background-color 0.15s ease",
        }}
      >
        <div className="flex h-full items-end justify-center">
          <span className="translate-y-[0.52em] leading-none transition-colors duration-150" style={glyphStyle}>
            {currentChar}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
