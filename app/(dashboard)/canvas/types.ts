export type Tool = 'select' | 'move' | 'rect' | 'circle' | 'triangle' | 'line' | 'polygon' | 'vector' | 'eraser' | 'hand' | 'text' | 'cube' | 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'line' | 'polygon' | 'vector' | 'cube' | 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'

export interface Point { x: number; y: number }
export interface Shape {
  id: string; type: ShapeType; points: Point[]; color: string
  strokeWidth: number; fillOpacity: number; sides?: number
  labels?: Record<string, string | number>
}
export interface AIMessage { role: 'user' | 'assistant'; content: string }
export type AIMode = 'ask' | 'draw' | 'quiz'
