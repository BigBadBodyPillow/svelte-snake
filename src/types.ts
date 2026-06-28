export type SnakePositionType = [number, number]

export interface Cell {
  id: number
  row: number
  col: number
}

export type GameElement = HTMLDivElement | null
export type DebugElement = HTMLParagraphElement | null

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
