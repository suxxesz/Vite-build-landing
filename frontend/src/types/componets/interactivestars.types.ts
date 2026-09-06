export type TrailPoint = { x: number; y: number }

export type Comet = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  caught: boolean
  color: string
  trail: TrailPoint[]
}

export type BgStar = { x: number; y: number; r: number; phase: number; speed: number }