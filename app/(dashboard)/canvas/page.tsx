'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Triangle, Circle, Square, Minus,
  Eraser, Undo2, Redo2, ZoomIn, ZoomOut, Grid3x3,
  Download, Save, Trash2, BookOpen, Library,
  Send, Bot, Target, PenTool, Move, Hand,
  ChevronLeft, ChevronRight, X, Layers
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type Tool = 'select' | 'move' | 'rect' | 'circle' | 'triangle' | 'line' | 'polygon' | 'vector' | 'eraser' | 'hand'
type ShapeType = 'rect' | 'circle' | 'triangle' | 'line' | 'polygon' | 'vector'
interface Point { x: number; y: number }
interface Shape {
  id: string; type: ShapeType; points: Point[]; color: string
  strokeWidth: number; fillOpacity: number; sides?: number
  labels?: Record<string, string | number>
}
interface AIMessage { role: 'user' | 'assistant'; content: string }
type AIMode = 'ask' | 'draw' | 'quiz'

const COLORS = ['#4F46E5','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#1E293B']

const THEORY_DATA: Record<string,{title:string;definition:string;formula:string;properties:string[];example:string}> = {
  triangle: {
    title: 'Uchburchak',
    definition: 'Uchburchak — uchta nuqta va ularni birlashtiruvchi uchta kesmadan iborat geometrik figura.',
    formula: '**Yuza:** $S = \\frac{1}{2} \\cdot a \\cdot h$\n\n**Perimetr:** $P = a + b + c$\n\n**Pifagor:** $a^2 + b^2 = c^2$',
    properties: ["Burchaklar yig'indisi 180°","Istalgan ikki tomon yig'indisi uchinchidan katta","Teng yonli: ikki tomoni teng","To'g'ri burchakli: bir burchagi 90°"],
    example: 'a=3, b=4, c=5 → S = 6 sm²',
  },
  circle: {
    title: 'Doira',
    definition: "Doira — markazdan teng masofada joylashgan nuqtalar to'plami.",
    formula: '**Uzunlik:** $C = 2\\pi r$\n\n**Yuza:** $S = \\pi r^2$\n\n**Diametr:** $d = 2r$',
    properties: ['Barcha radiuslar teng','Diametr — eng uzun vatar','π ≈ 3.14159','Yoy — doira qismi'],
    example: 'r=5 → S = 78.54 sm²',
  },
  rect: {
    title: "To'rtburchak",
    definition: "To'rtburchak — to'rtta burchagi to'g'ri (90°) bo'lgan parallelogramm.",
    formula: '**Yuza:** $S = a \\cdot b$\n\n**Perimetr:** $P = 2(a + b)$\n\n**Diagonal:** $d = \\sqrt{a^2 + b^2}$',
    properties: ["Barcha burchaklar 90°","Qarama-qarshi tomonlar teng","Diagonallar teng","Kvadrat: a = b"],
    example: 'a=4, b=6 → S = 24 sm²',
  },
  polygon: {
    title: "Ko'pburchak",
    definition: "Ko'pburchak — uchdan ortiq kesmalar bilan o'ralgan yassi figura.",
    formula: "**Burchaklar yig'indisi:** $S = (n-2) \\cdot 180°$",
    properties: ["n — tomonlar soni","Muntazam: barcha tomonlar teng","Ichki burchak: (n-2)·180°/n","Tashqi burchaklar: 360°"],
    example: 'Muntazam oltiburchak: 6 teng tomon',
  },
}

const LIBRARY_SHAPES = [
  { name: "Teng tomonli uchburchak", type: 'triangle' as ShapeType, sides: 3, color: '#4F46E5' },
  { name: "Kvadrat", type: 'rect' as ShapeType, color: '#10B981' },
  { name: "To'rtburchak", type: 'rect' as ShapeType, color: '#F59E0B' },
  { name: "Doira", type: 'circle' as ShapeType, color: '#EF4444' },
  { name: "Beshburchak", type: 'polygon' as ShapeType, sides: 5, color: '#8B5CF6' },
  { name: "Oltiburchak", type: 'polygon' as ShapeType, sides: 6, color: '#EC4899' },
  { name: "Sakkizburchak", type: 'polygon' as ShapeType, sides: 8, color: '#1E293B' },
]

function calcShapeInfo(shape: Shape): Record<string,string> {
  const s = 0.1
  if (shape.type === 'rect' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x)
    const h = Math.abs(shape.points[1].y - shape.points[0].y)
    return { Kenglik:`${(w*s).toFixed(1)} sm`, Balandlik:`${(h*s).toFixed(1)} sm`, Perimetr:`${(2*(w+h)*s).toFixed(1)} sm`, Yuza:`${(w*h*s*s).toFixed(2)} sm²`, Diagonal:`${(Math.sqrt(w*w+h*h)*s).toFixed(2)} sm` }
  }
  if (shape.type === 'circle' && shape.points.length >= 2) {
    const dx=shape.points[1].x-shape.points[0].x, dy=shape.points[1].y-shape.points[0].y
    const r = Math.sqrt(dx*dx+dy*dy)*s
    return { Radius:`${r.toFixed(2)} sm`, Diametr:`${(r*2).toFixed(2)} sm`, Aylanasi:`${(2*Math.PI*r).toFixed(2)} sm`, Yuza:`${(Math.PI*r*r).toFixed(2)} sm²` }
  }
  if (shape.type === 'triangle' && shape.points.length >= 2) {
    const p0=shape.points[0], p1=shape.points[1], midX=(p0.x+p1.x)/2
    const a=Math.sqrt((p1.x-p0.x)**2+(p1.y-p0.y)**2)*s, b=Math.sqrt((p1.x-midX)**2+(p1.y-p0.y)**2)*s, c=Math.sqrt((midX-p0.x)**2+(p0.y-p1.y)**2)*s
    const sp=(a+b+c)/2, area=Math.sqrt(Math.max(0,sp*(sp-a)*(sp-b)*(sp-c)))
    return { 'Tomon a':`${a.toFixed(2)} sm`, 'Tomon b':`${b.toFixed(2)} sm`, 'Tomon c':`${c.toFixed(2)} sm`, Perimetr:`${(a+b+c).toFixed(2)} sm`, Yuza:`${area.toFixed(2)} sm²` }
  }
  if (shape.type === 'line' && shape.points.length >= 2) {
    const dx=shape.points[1].x-shape.points[0].x, dy=shape.points[1].y-shape.points[0].y
    return { Uzunlik:`${(Math.sqrt(dx*dx+dy*dy)*s).toFixed(2)} sm`, Burchak:`${Math.abs(Math.atan2(dy,dx)*180/Math.PI).toFixed(1)}°` }
  }
  return {}
}

function drawShapeFn(ctx: CanvasRenderingContext2D, shape: Shape, selected: boolean, isDark: boolean, zoom: number) {
  ctx.save()
  ctx.strokeStyle = shape.color
  ctx.lineWidth = shape.strokeWidth / zoom
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.fillStyle = shape.color + Math.round(shape.fillOpacity*255).toString(16).padStart(2,'0')
  if (selected) { ctx.shadowColor = '#4F46E5'; ctx.shadowBlur = 12 / zoom }
  const p = shape.points
  
  const drawLabel = (text: string, x: number, y: number) => {
    ctx.save()
    ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
    ctx.font = `bold ${11/zoom}px Inter`
    ctx.textAlign = 'center'
    ctx.shadowColor = isDark ? '#0f172a' : '#ffffff'
    ctx.shadowBlur = 4 / zoom
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  if (shape.type === 'rect' && p.length >= 2) {
    const x=Math.min(p[0].x,p[1].x), y=Math.min(p[0].y,p[1].y), w=Math.abs(p[1].x-p[0].x), h=Math.abs(p[1].y-p[0].y)
    ctx.beginPath(); ctx.roundRect(x,y,w,h,4/zoom); ctx.fill(); ctx.stroke()
    const wText = shape.labels?.width || Math.round(w/10) + ' sm'
    const hText = shape.labels?.height || Math.round(h/10) + ' sm'
    if(w>20 && h>20) {
      drawLabel(wText.toString(), x + w/2, y - 6/zoom)
      drawLabel(hText.toString(), x + w + 16/zoom, y + h/2 + 4/zoom)
    }
  } else if (shape.type === 'circle' && p.length >= 2) {
    const r = Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2)
    ctx.beginPath(); ctx.arc(p[0].x,p[0].y,r,0,Math.PI*2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(p[0].x,p[0].y,3/zoom,0,Math.PI*2); ctx.fillStyle=shape.color; ctx.fill()
    if (selected) { ctx.setLineDash([4/zoom,4/zoom]); ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke(); ctx.setLineDash([]) }
    const rText = shape.labels?.radius || 'r=' + Math.round(r/10) + ' sm'
    if(r>10) drawLabel(rText.toString(), p[0].x + (p[1].x-p[0].x)/2, p[0].y + (p[1].y-p[0].y)/2 - 6/zoom)
  } else if (shape.type === 'triangle' && p.length >= 2) {
    const midX=(p[0].x+p[1].x)/2
    ctx.beginPath(); ctx.moveTo(midX,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.lineTo(p[0].x,p[1].y); ctx.closePath(); ctx.fill(); ctx.stroke()
    if (selected) { ctx.fillStyle=shape.color; ctx.font=`bold ${12/zoom}px Inter`; ctx.fillText('A',midX-4/zoom,p[0].y-8/zoom); ctx.fillText('B',p[1].x+4/zoom,p[1].y+4/zoom); ctx.fillText('C',p[0].x-14/zoom,p[1].y+4/zoom) }
    const aText = shape.labels?.a || Math.round(Math.sqrt((p[1].x-p[0].x)**2)/10) + ' sm'
    if(p[1].x-p[0].x>20) drawLabel(aText.toString(), midX, p[1].y + 14/zoom)
  } else if (shape.type === 'line' && p.length >= 2) {
    ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke()
    const lenText = shape.labels?.length || Math.round(Math.sqrt((p[1].x-p[0].x)**2 + (p[1].y-p[0].y)**2)/10) + ' sm'
    drawLabel(lenText.toString(), (p[0].x+p[1].x)/2, (p[0].y+p[1].y)/2 - 8/zoom)
  } else if (shape.type === 'vector' && p.length >= 2) {
    const angle = Math.atan2(p[1].y-p[0].y, p[1].x-p[0].x)
    ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(p[1].x,p[1].y); ctx.lineTo(p[1].x-(14/zoom)*Math.cos(angle-Math.PI/6),p[1].y-(14/zoom)*Math.sin(angle-Math.PI/6)); ctx.moveTo(p[1].x,p[1].y); ctx.lineTo(p[1].x-(14/zoom)*Math.cos(angle+Math.PI/6),p[1].y-(14/zoom)*Math.sin(angle+Math.PI/6)); ctx.stroke()
  } else if (shape.type === 'polygon' && p.length >= 2) {
    const sides=shape.sides||6, r=Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2)
    ctx.beginPath()
    for (let i=0;i<sides;i++) { const a=(i/sides)*Math.PI*2-Math.PI/2, px=p[0].x+r*Math.cos(a), py=p[0].y+r*Math.sin(a); i===0?ctx.moveTo(px,py):ctx.lineTo(px,py) }
    ctx.closePath(); ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

function drawGridFn(ctx: CanvasRenderingContext2D, w: number, h: number, pan: Point, zoom: number, axes: boolean, dark: boolean) {
  ctx.save();
  ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.3)'; ctx.lineWidth = 0.5/zoom;
  
  const left = -pan.x / zoom;
  const right = left + w / zoom;
  const top = -pan.y / zoom;
  const bottom = top + h / zoom;
  const spacing = 30;
  
  const startX = Math.floor(left / spacing) * spacing;
  const startY = Math.floor(top / spacing) * spacing;
  
  ctx.beginPath();
  for (let x=startX; x<right; x+=spacing) { ctx.moveTo(x, top); ctx.lineTo(x, bottom); }
  for (let y=startY; y<bottom; y+=spacing) { ctx.moveTo(left, y); ctx.lineTo(right, y); }
  ctx.stroke();
  
  if (axes) {
    const mx=w/2, my=h/2
    ctx.strokeStyle=dark?'rgba(99,102,241,0.5)':'rgba(79,70,229,0.4)'; ctx.lineWidth=1.5/zoom;
    ctx.beginPath(); ctx.moveTo(left,my); ctx.lineTo(right,my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx,top); ctx.lineTo(mx,bottom); ctx.stroke();
    ctx.fillStyle=dark?'#818CF8':'#4F46E5'; ctx.font=`${11/zoom}px Inter`
    ctx.fillText('X',right-16/zoom,my-6/zoom); ctx.fillText('Y',mx+6/zoom,top+14/zoom); ctx.fillText('0',mx+4/zoom,my-4/zoom)
  }
  ctx.restore();
}

export default function GeoLabPage() {
  const { user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const didDragRef = useRef(false)
  const [shapes,setShapes]=useState<Shape[]>([]); const [history,setHistory]=useState<Shape[][]>([[]]); const [historyIndex,setHistoryIndex]=useState(0)
  const [tool,setTool]=useState<Tool>('rect'); const [isDrawing,setIsDrawing]=useState(false); const [startPos,setStartPos]=useState<Point>({x:0,y:0})
  const [currentShape,setCurrentShape]=useState<Shape|null>(null); const [selectedShape,setSelectedShape]=useState<Shape|null>(null)
  const [selectedColor,setSelectedColor]=useState('#4F46E5'); const [strokeWidth,setStrokeWidth]=useState(2); const [fillOpacity,setFillOpacity]=useState(0.08)
  const [showGrid,setShowGrid]=useState(true); const [showAxes,setShowAxes]=useState(false); const [polygonSides,setPolygonSides]=useState(6)
  const [isDark,setIsDark]=useState(false)
  const [leftPanelOpen,setLeftPanelOpen]=useState(true); const [rightPanelOpen,setRightPanelOpen]=useState(true)
  const [leftTab,setLeftTab]=useState<'theory'|'library'|'layers'>('theory'); const [selectedTheory,setSelectedTheory]=useState('triangle')
  const [aiMode,setAiMode]=useState<AIMode>('ask')
  const [aiMessages,setAiMessages]=useState<AIMessage[]>([{role:'assistant',content:"Salom! Men **GeoLab AI** yordamchiman! 🎨\n\n- **So'ra** — figura haqida savol\n- **Chizdir** — AI figura chizadi\n- **Masala** — AI masala beradi"}])
  const [aiInput,setAiInput]=useState(''); const [aiLoading,setAiLoading]=useState(false)
  const [pan,setPan]=useState<Point>({x:0,y:0})
  const [zoom,setZoom]=useState(1)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geolab_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.shapes) { setShapes(parsed.shapes); setHistory([parsed.shapes]); setHistoryIndex(0) }
        if (parsed.pan) setPan(parsed.pan)
        if (parsed.zoom) setZoom(parsed.zoom)
      }
    } catch(e){}
  }, [])

  useEffect(() => {
    if (shapes.length > 0 || pan.x !== 0 || zoom !== 1) {
      localStorage.setItem('geolab_state', JSON.stringify({ shapes, pan, zoom }))
    }
  }, [shapes, pan, zoom])

  useEffect(()=>{setIsDark(document.documentElement.classList.contains('dark'));const o=new MutationObserver(()=>setIsDark(document.documentElement.classList.contains('dark')));o.observe(document.documentElement,{attributes:true});return()=>o.disconnect()},[])

  const redraw=useCallback(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return
    ctx.save(); ctx.setTransform(1,0,0,1,0,0)
    ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle=isDark?'#0f172a':'#ffffff';ctx.fillRect(0,0,c.width,c.height)
    ctx.restore()

    ctx.save()
    ctx.translate(pan.x, pan.y); ctx.scale(zoom, zoom)
    if(showGrid)drawGridFn(ctx,c.width,c.height,pan,zoom,showAxes,isDark)
    shapes.forEach(s=>drawShapeFn(ctx,s,selectedShape?.id===s.id,isDark,zoom))
    if(currentShape)drawShapeFn(ctx,currentShape,false,isDark,zoom)
    ctx.restore()
  },[shapes,currentShape,selectedShape,showGrid,showAxes,isDark,pan,zoom])

  useEffect(()=>{redraw()},[redraw])
  useEffect(()=>{const c=canvasRef.current;if(!c)return;const r=()=>{const p=c.parentElement;if(!p)return;const b=p.getBoundingClientRect();c.width=b.width;c.height=b.height;redraw()};r();window.addEventListener('resize',r);return()=>window.removeEventListener('resize',r)},[redraw])

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.key==='Delete'||e.key==='Backspace')&&selectedShape){pushHistory(shapes.filter(s=>s.id!==selectedShape.id));setSelectedShape(null)}
      if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo()}
      if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo()}
    };window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)
  })

  useEffect(()=>{
    const c=canvasRef.current;if(!c)return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const scrollSpeed = 0.002
      const zoomFactor = Math.exp(-e.deltaY * scrollSpeed)
      setZoom(prev => {
        const newZoom = Math.min(Math.max(0.1, prev * zoomFactor), 5)
        const r = c.getBoundingClientRect()
        const mouseX = e.clientX - r.left, mouseY = e.clientY - r.top
        setPan(p => ({ x: mouseX - (mouseX - p.x) * (newZoom / prev), y: mouseY - (mouseY - p.y) * (newZoom / prev) }))
        return newZoom
      })
    }
    c.addEventListener('wheel', onWheel, {passive: false})
    return ()=>c.removeEventListener('wheel', onWheel)
  }, [])

  function getPos(e:React.MouseEvent<HTMLCanvasElement>):Point{const r=canvasRef.current!.getBoundingClientRect();return{x:(e.clientX-r.left-pan.x)/zoom,y:(e.clientY-r.top-pan.y)/zoom}}
  function isInShape(shape:Shape,pos:Point):boolean{
    const p=shape.points
    if(shape.type==='rect'&&p.length>=2)return pos.x>=Math.min(p[0].x,p[1].x)&&pos.x<=Math.max(p[0].x,p[1].x)&&pos.y>=Math.min(p[0].y,p[1].y)&&pos.y<=Math.max(p[0].y,p[1].y)
    if(shape.type==='circle'&&p.length>=2){const r=Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2);return Math.sqrt((pos.x-p[0].x)**2+(pos.y-p[0].y)**2)<=r}
    if(shape.type==='triangle'&&p.length>=2)return pos.x>=Math.min(p[0].x,p[1].x)&&pos.x<=Math.max(p[0].x,p[1].x)&&pos.y>=Math.min(p[0].y,p[1].y)&&pos.y<=Math.max(p[0].y,p[1].y)
    return false
  }
  function pushHistory(ns:Shape[]){const nh=history.slice(0,historyIndex+1);nh.push(ns);setHistory(nh);setHistoryIndex(nh.length-1);setShapes(ns)}
  function undo(){if(historyIndex>0){setHistoryIndex(historyIndex-1);setShapes(history[historyIndex-1])}}
  function redo(){if(historyIndex<history.length-1){setHistoryIndex(historyIndex+1);setShapes(history[historyIndex+1])}}
  function clearAll(){pushHistory([]);setSelectedShape(null)}

  function handleMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
    didDragRef.current = false;
    if(tool==='hand'){setIsDrawing(true);setStartPos({x:e.clientX,y:e.clientY});return}
    const pos=getPos(e)
    if(tool==='eraser'){const h=[...shapes].reverse().find(s=>isInShape(s,pos));if(h){pushHistory(shapes.filter(s=>s.id!==h.id));setSelectedShape(null)};return}
    if(tool==='select'){
      const hit = [...shapes].reverse().find(s=>isInShape(s,pos))||null;
      setSelectedShape(hit);
      if (hit) { setIsDrawing(true); setStartPos(pos); }
      return
    }
    setIsDrawing(true);setStartPos(pos)
    setCurrentShape({id:Date.now().toString(),type:tool==='polygon'?'polygon':tool==='vector'?'vector':tool as ShapeType,points:[pos,pos],color:selectedColor,strokeWidth,fillOpacity,sides:polygonSides})
  }
  function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
    if(isDrawing&&tool==='hand'){const dx=e.clientX-startPos.x,dy=e.clientY-startPos.y;setPan(p=>({x:p.x+dx,y:p.y+dy}));setStartPos({x:e.clientX,y:e.clientY});return}
    if(isDrawing&&tool==='select'&&selectedShape){
      didDragRef.current = true;
      const pos = getPos(e);
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const moved = {...selectedShape, points: selectedShape.points.map(p=>({x: p.x+dx, y: p.y+dy}))};
      setShapes(shapes.map(s => s.id === moved.id ? moved : s));
      setSelectedShape(moved);
      setStartPos(pos);
      return;
    }
    if(!isDrawing||!currentShape)return;setCurrentShape({...currentShape,points:[startPos,getPos(e)]})
  }
  function handleMouseUp(){
    if(isDrawing&&tool==='hand'){setIsDrawing(false);return}
    if(isDrawing&&tool==='select'&&selectedShape){
      setIsDrawing(false);
      if(didDragRef.current) pushHistory(shapes);
      return;
    }
    if(!isDrawing||!currentShape)return;setIsDrawing(false);const p=currentShape.points;if(Math.abs(p[1].x-p[0].x)>8||Math.abs(p[1].y-p[0].y)>8){pushHistory([...shapes,currentShape]);setSelectedShape(currentShape)};setCurrentShape(null)
  }

  function addLibraryShape(ls:typeof LIBRARY_SHAPES[0]){const c=canvasRef.current;if(!c)return;const cx=c.width/2,cy=c.height/2,r=80;const ns:Shape={id:Date.now().toString(),type:ls.type,points:[{x:cx-r,y:cy-r},{x:cx+r,y:cy+r}],color:ls.color,strokeWidth:2,fillOpacity:0.08,sides:ls.sides};pushHistory([...shapes,ns]);setSelectedShape(ns)}
  function exportPNG(){const c=canvasRef.current;if(!c)return;const l=document.createElement('a');l.download='geolab-chizma.png';l.href=c.toDataURL('image/png');document.body.appendChild(l);l.click();document.body.removeChild(l)}
  async function saveDrawing(){if(!canvasRef.current)return;try{if(user){await addDoc(collection(db,'drawings'),{userId:user.uid,shapesCount:shapes.length,thumbnail:canvasRef.current.toDataURL('image/jpeg',0.3),createdAt:serverTimestamp()})}alert('Chizma saqlandi! ✅')}catch(e){console.error(e)}}

  function getCanvasSummary():string{if(shapes.length===0)return"Canvas bo'sh.";return shapes.map((s,i)=>{const info=calcShapeInfo(s);return`${i+1}. ${s.type} (${Object.entries(info).map(([k,v])=>`${k}:${v}`).join(', ')})`}).join('\n')}

  function executeDrawCommand(cmd:any){
    const c=canvasRef.current;if(!c)return;
    const cx=c.width/2 - pan.x/zoom, cy=c.height/2 - pan.y/zoom, sc=10;
    let ns:Shape|null=null
    const color = cmd.color || selectedColor
    
    if(cmd.type==='rect'){const w=(cmd.width||10)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'rect',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='circle'){const r=(cmd.radius||5)*sc;ns={id:Date.now().toString(),type:'circle',points:[{x:cx,y:cy},{x:cx+r,y:cy}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='triangle'){const a=(cmd.a||3)*sc,b=(cmd.b||4)*sc;ns={id:Date.now().toString(),type:'triangle',points:[{x:cx-a/2,y:cy-b/2},{x:cx+a/2,y:cy+b/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='polygon'){const r=(cmd.radius||6)*sc;ns={id:Date.now().toString(),type:'polygon',points:[{x:cx,y:cy},{x:cx+r,y:cy}],color,strokeWidth:2,fillOpacity:0.08,sides:cmd.sides||6,labels:cmd.labels}}
    else if(cmd.type==='line'){const l=(cmd.length||10)*sc;ns={id:Date.now().toString(),type:'line',points:[{x:cx-l/2,y:cy},{x:cx+l/2,y:cy}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    
    if(ns){pushHistory([...shapes,ns]);setSelectedShape(ns)}
  }

  function handleLabelEdit(dimension: string, val: string) {
    if (!selectedShape) return
    const sc = 10
    const num = parseFloat(val)
    const newLabels = { ...selectedShape.labels, [dimension]: val }
    const ns = { ...selectedShape, points: [...selectedShape.points], labels: newLabels }
    
    if (!isNaN(num)) {
      if (ns.type === 'rect') {
        if (dimension === 'width') ns.points[1].x = ns.points[0].x + num * sc * Math.sign(ns.points[1].x - ns.points[0].x || 1)
        else if (dimension === 'height') ns.points[1].y = ns.points[0].y + num * sc * Math.sign(ns.points[1].y - ns.points[0].y || 1)
      } else if (ns.type === 'circle' && dimension === 'radius') {
        ns.points[1].x = ns.points[0].x + Math.max(num * sc, 1); ns.points[1].y = ns.points[0].y
      } else if (ns.type === 'triangle' && dimension === 'a') {
        const midX = (ns.points[0].x + ns.points[1].x)/2; ns.points[0].x = midX - (num*sc)/2; ns.points[1].x = midX + (num*sc)/2
      } else if (ns.type === 'line' && dimension === 'length') {
        const angle = Math.atan2(ns.points[1].y-ns.points[0].y, ns.points[1].x-ns.points[0].x)
        ns.points[1].x = ns.points[0].x + Math.max(num*sc, 1)*Math.cos(angle); ns.points[1].y = ns.points[0].y + Math.max(num*sc, 1)*Math.sin(angle)
      }
    }
    const newShapes = shapes.map(s => s.id === ns.id ? ns : s)
    pushHistory(newShapes)
    setSelectedShape(ns)
  }

  async function sendAIMessage(){
    if(!aiInput.trim()||aiLoading)return;const userMsg=aiInput.trim();setAiInput('');setAiMessages(p=>[...p,{role:'user',content:userMsg}]);setAiLoading(true)
    try{
      const summary=getCanvasSummary()
      let sp=''
      if(aiMode==='ask')sp=`Siz GeoLab AI. Canvasdagi figuralar:\n${summary}\nQisqa javob. O'zbek tilida. LaTeX: $formula$. Markdown.`
      else if(aiMode==='draw')sp=`Siz GeoLab AI chizuvchi.\nJSON ob'ekt bering:\n\`\`\`json\n{"type":"rect|circle|triangle|polygon","width":10,"height":8,"radius":5,"a":3,"b":4,"sides":6,"color":"#4F46E5","labels":{"width":"10 sm","height":"8 sm","radius":"r=5 sm","a":"x"}}\n\`\`\`\nKeyin insoniy tushuntirish. O'zbek tilida.`
      else sp=`Siz GeoLab AI o'qituvchi. O'zbek tilida geometriya masalasini yozing (matni bilan!). Masala ifodasi va shartlari tugagach, shu masaladagi shaklni chizish yuzasidan MATNNING ENG OXIRIGA faqat bitta JSON obyekt qo'shing. DIQQAT: JSON kodi boshlanishidan oldin "Chizma uchun JSON" deb aslo YOZMANG. Topilishi kerak bo'lgan tomonni esa label ichida '?' qilib chizib bering, masalan: \`\`\`json\n{"type":"triangle","color":"#4F46E5","labels":{"a":"5","b":"?","c":"4"}}\n\`\`\` Canvas: ${summary}`
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,history:aiMessages.map(m=>({role:m.role,content:m.content})),systemPrompt:sp})})
      const data=await res.json();let aiText=data.message||'Xatolik.'
      const m=aiText.match(/```json\n([\s\S]*?)\n```/i);
      if(m)try{executeDrawCommand(JSON.parse(m[1]))}catch(e){console.error(e)}
      const cleanText = aiText.replace(/```json[\s\S]*?```/gi, '').replace(/```[\s\S]*?```/gi, '').replace(/Chizma uchun (JSON)?(kodi)?:?\n?/gi, '').trim()
      setAiMessages(p=>[...p,{role:'assistant',content:cleanText}])
    }catch{setAiMessages(p=>[...p,{role:'assistant',content:'Xatolik yuz berdi.'}])}finally{setAiLoading(false)}
  }

  function analyzeShape(){if(!selectedShape)return;const info=calcShapeInfo(selectedShape);setAiMode('ask');setAiInput(`Men ${selectedShape.type} chizdim. ${Object.entries(info).map(([k,v])=>`${k}: ${v}`).join(', ')}. Tushuntiring.`)}

  const shapeInfo=selectedShape?calcShapeInfo(selectedShape):null
  const TOOLS_LIST=[{id:'select',icon:MousePointer2,label:'Tanlash'},{id:'hand',icon:Hand,label:'Sahnani surish'},{id:'rect',icon:Square,label:"To'rtburchak"},{id:'circle',icon:Circle,label:'Doira'},{id:'triangle',icon:Triangle,label:'Uchburchak'},{id:'line',icon:Minus,label:'Chiziq'},{id:'vector',icon:Move,label:'Vektor'},{id:'polygon',icon:Layers,label:"Ko'pburchak"},{id:'eraser',icon:Eraser,label:"O'chirish"}]

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* LEFT PANEL */}
      <AnimatePresence>
        {leftPanelOpen&&(<motion.div initial={{width:0,opacity:0}} animate={{width:280,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}} className="flex-shrink-0 flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/40 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700/40">
            {[{id:'theory',icon:BookOpen,label:'Nazariya'},{id:'library',icon:Library,label:'Kutubxona'},{id:'layers',icon:Layers,label:'Qatlamlar'}].map(tab=>(
              <button key={tab.id} onClick={()=>setLeftTab(tab.id as any)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${leftTab===tab.id?'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500':'text-slate-400 hover:text-slate-600'}`}><tab.icon size={16}/>{tab.label}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {leftTab==='theory'&&(<div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">{Object.entries(THEORY_DATA).map(([key,data])=>(<button key={key} onClick={()=>setSelectedTheory(key)} className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all border ${selectedTheory===key?'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300':'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{data.title}</button>))}</div>
              {THEORY_DATA[selectedTheory]&&(<div className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40"><h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-1">{THEORY_DATA[selectedTheory].title}</h3><p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{THEORY_DATA[selectedTheory].definition}</p></div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40"><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Formulalar</p><div className="text-xs"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{THEORY_DATA[selectedTheory].formula}</ReactMarkdown></div></div>
                <div className="space-y-1.5">{THEORY_DATA[selectedTheory].properties.map((pr,i)=>(<div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5"/>{pr}</div>))}</div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40"><p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">💡 Misol</p><p className="text-xs text-amber-600 dark:text-amber-400">{THEORY_DATA[selectedTheory].example}</p></div>
                <button onClick={()=>{const ls=LIBRARY_SHAPES.find(s=>s.type===selectedTheory);if(ls)addLibraryShape(ls)}} className="w-full btn-gradient py-2 rounded-xl text-xs font-medium">Canvasda ko&apos;rsat →</button>
              </div>)}
            </div>)}
            {leftTab==='library'&&(<div className="space-y-2"><p className="text-xs text-slate-400 mb-3">Bosib canvasga qo&apos;shing</p>{LIBRARY_SHAPES.map((s,i)=>(<button key={i} onClick={()=>addLibraryShape(s)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:s.color+'22'}}><div className="w-4 h-4 rounded-sm" style={{background:s.color}}/></div><span className="text-sm text-slate-700 dark:text-slate-200">{s.name}</span></button>))}</div>)}
            {leftTab==='layers'&&(<div className="space-y-2">{shapes.length===0?(<div className="text-center py-8"><Layers size={28} className="text-slate-300 mx-auto mb-2"/><p className="text-xs text-slate-400">Hali figura yo&apos;q</p></div>):shapes.map((s,i)=>(<div key={s.id} onClick={()=>setSelectedShape(selectedShape?.id===s.id?null:s)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${selectedShape?.id===s.id?'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700':'border-slate-200 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="w-5 h-5 rounded flex-shrink-0" style={{background:s.color}}/><span className="text-xs text-slate-700 dark:text-slate-200 flex-1 capitalize">{i+1}. {s.type}</span><button onClick={e=>{e.stopPropagation();pushHistory(shapes.filter(sh=>sh.id!==s.id));if(selectedShape?.id===s.id)setSelectedShape(null)}} className="text-slate-300 hover:text-red-400 transition-colors"><X size={14}/></button></div>))}</div>)}
          </div>
        </motion.div>)}
      </AnimatePresence>

      {/* CENTER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Toolbar */}
        <div className="h-14 flex items-center gap-2 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/40 flex-shrink-0 overflow-x-auto hidden-scrollbar">
          <div className="flex items-center gap-1 shrink-0">{TOOLS_LIST.map(t=>(<button key={t.id} onClick={()=>setTool(t.id as Tool)} title={t.label} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${tool===t.id?'bg-indigo-500 text-white shadow-md shadow-indigo-200':'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><t.icon size={16}/></button>))}
            {tool==='polygon'&&(<div className="flex items-center gap-1 ml-1 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0"><span className="text-xs text-indigo-600">n=</span><input type="number" min={3} max={12} value={polygonSides} onChange={e=>setPolygonSides(Number(e.target.value))} className="w-10 text-xs text-indigo-600 bg-transparent border-none outline-none font-medium"/></div>)}
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"/>
          <button onClick={undo} disabled={historyIndex===0} className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"><Undo2 size={16}/></button>
          <button onClick={redo} disabled={historyIndex>=history.length-1} className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"><Redo2 size={16}/></button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"/>
          <button onClick={()=>setZoom(1)} className="px-2 h-9 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-xs">{(zoom*100).toFixed(0)}%</button>
          <button onClick={()=>setShowGrid(!showGrid)} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${showGrid?'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600':'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Grid3x3 size={16}/></button>
          <button onClick={()=>setShowAxes(!showAxes)} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all text-sm font-bold ${showAxes?'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600':'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>XY</button>
          <button onClick={()=>setLeftPanelOpen(!leftPanelOpen)} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${leftPanelOpen ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ChevronLeft size={16}/></button>
          
          <div className="flex-1 min-w-[20px]"/>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden xl:block shrink-0">GeoLab Canvas</span>
          <div className="flex-1 min-w-[20px]"/>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={clearAll} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16}/></button>
            <button onClick={exportPNG} className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"><Download size={14}/>PNG</button>
            <button onClick={saveDrawing} className="btn-gradient flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium shadow-md shadow-indigo-200/50 dark:shadow-none"><Save size={14}/>Saqlash</button>
            <button onClick={()=>setRightPanelOpen(!rightPanelOpen)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${rightPanelOpen ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ChevronRight size={16}/></button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-dot-pattern">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{cursor:tool==='select'?'default':tool==='hand'?(isDrawing?'grabbing':'grab'):tool==='eraser'?'cell':'crosshair'}} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}/>
          {selectedShape&&shapeInfo&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 shadow-xl flex items-center justify-center gap-5 w-max max-w-[95%] overflow-x-auto hidden-scrollbar pointer-events-auto">
            {Object.entries(shapeInfo).map(([k,v])=>(<div key={k} className="text-center whitespace-nowrap"><div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{k}</div><div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{v}</div></div>))}
            <div className="w-px h-8 bg-slate-200 dark:border-slate-700 shrink-0"/>
            <div className="flex items-center gap-2">
              <button onClick={analyzeShape} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Target size={16}/></button>
              <button onClick={()=>pushHistory(shapes.filter(s=>s.id!==selectedShape.id))} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16}/></button>
              <button onClick={()=>setSelectedShape(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><X size={16}/></button>
            </div>
          </motion.div>)}

          {/* Interactive Inputs Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {selectedShape && selectedShape.type === 'rect' && (
              <>
                <input value={selectedShape.labels?.width || Math.round(Math.abs(selectedShape.points[1].x-selectedShape.points[0].x)/10)} onChange={e=>handleLabelEdit('width', e.target.value)} onFocus={e=>e.target.select()} className="absolute w-12 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold shadow-md outline-none pointer-events-auto text-indigo-600 dark:text-indigo-400" style={{ left: (Math.min(selectedShape.points[0].x,selectedShape.points[1].x)+Math.abs(selectedShape.points[1].x-selectedShape.points[0].x)/2)*zoom+pan.x, top: Math.min(selectedShape.points[0].y,selectedShape.points[1].y)*zoom+pan.y - 15, transform: 'translate(-50%, -50%)' }} />
                <input value={selectedShape.labels?.height || Math.round(Math.abs(selectedShape.points[1].y-selectedShape.points[0].y)/10)} onChange={e=>handleLabelEdit('height', e.target.value)} onFocus={e=>e.target.select()} className="absolute w-12 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold shadow-md outline-none pointer-events-auto text-indigo-600 dark:text-indigo-400" style={{ left: Math.max(selectedShape.points[0].x,selectedShape.points[1].x)*zoom+pan.x + 24, top: (Math.min(selectedShape.points[0].y,selectedShape.points[1].y)+Math.abs(selectedShape.points[1].y-selectedShape.points[0].y)/2)*zoom+pan.y, transform: 'translate(-50%, -50%)' }} />
              </>
            )}
            {selectedShape && selectedShape.type === 'circle' && (
              <input value={selectedShape.labels?.radius || Math.round(Math.sqrt((selectedShape.points[1].x-selectedShape.points[0].x)**2+(selectedShape.points[1].y-selectedShape.points[0].y)**2)/10)} onChange={e=>handleLabelEdit('radius', e.target.value)} onFocus={e=>e.target.select()} className="absolute w-12 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold shadow-md outline-none pointer-events-auto text-indigo-600 dark:text-indigo-400" style={{ left: (selectedShape.points[0].x + (selectedShape.points[1].x-selectedShape.points[0].x)/2)*zoom+pan.x, top: (selectedShape.points[0].y + (selectedShape.points[1].y-selectedShape.points[0].y)/2)*zoom+pan.y - 15, transform: 'translate(-50%, -50%)' }} />
            )}
            {selectedShape && selectedShape.type === 'triangle' && (
              <input value={selectedShape.labels?.a || Math.round(Math.max(selectedShape.points[1].x-selectedShape.points[0].x,1)/10)} onChange={e=>handleLabelEdit('a', e.target.value)} onFocus={e=>e.target.select()} className="absolute w-12 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold shadow-md outline-none pointer-events-auto text-indigo-600 dark:text-indigo-400" style={{ left: ((selectedShape.points[0].x+selectedShape.points[1].x)/2)*zoom+pan.x, top: selectedShape.points[1].y*zoom+pan.y + 15, transform: 'translate(-50%, -50%)' }} />
            )}
          </div>
          <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"><span className="text-xs font-medium text-slate-500 dark:text-slate-400">{shapes.length} figura</span></div>
        </div>

        {/* Color bar */}
        <div className="h-14 flex items-center gap-4 px-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/40 flex-shrink-0 overflow-x-auto hidden-scrollbar">
          <div className="flex items-center gap-1.5">{COLORS.map(c=>(<button key={c} onClick={()=>setSelectedColor(c)} className={`w-6 h-6 rounded-md transition-all ${selectedColor===c?'ring-2 ring-offset-1 ring-indigo-500 scale-110':'hover:scale-105 opacity-80'}`} style={{background:c}}/>))}</div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"/>
          <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Qalinlik</span><input type="range" min={1} max={8} value={strokeWidth} onChange={e=>setStrokeWidth(Number(e.target.value))} className="w-20"/><span className="text-xs text-indigo-600 font-medium w-6">{strokeWidth}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-slate-400">To&apos;ldirish</span><input type="range" min={0} max={100} value={Math.round(fillOpacity*100)} onChange={e=>setFillOpacity(Number(e.target.value)/100)} className="w-20"/><span className="text-xs text-indigo-600 font-medium w-8">{Math.round(fillOpacity*100)}%</span></div>
        </div>
      </div>

      {/* RIGHT PANEL (AI) */}
      <AnimatePresence>
        {rightPanelOpen&&(<motion.div initial={{width:0,opacity:0}} animate={{width:280,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}} className="flex-shrink-0 flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-l border-slate-200 dark:border-slate-700/40 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/40">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">AI</div><div><p className="text-sm font-medium text-slate-800 dark:text-slate-100">GeoLab AI</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"/><span className="text-xs text-slate-400">Online</span></div></div></div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[{id:'ask',icon:Bot,label:"So'ra"},{id:'draw',icon:PenTool,label:'Chizdir'},{id:'quiz',icon:Target,label:'Masala'}].map(m=>(<button key={m.id} onClick={()=>setAiMode(m.id as AIMode)} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs transition-all ${aiMode===m.id?'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm':'text-slate-500'}`}><m.icon size={14}/>{m.label}</button>))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">{aiMode==='ask'?"Figura haqida savol bering":aiMode==='draw'?"AI sizga figura chizadi":"AI masala beradi"}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {aiMessages.map((msg,i)=>(<div key={i} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':''}`}>
              {msg.role==='assistant'&&(<div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">AI</div>)}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${msg.role==='assistant'?'bg-indigo-50 dark:bg-indigo-900/20 text-slate-800 dark:text-slate-100 rounded-tl-sm':'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-tr-sm'}`}>
                {msg.role==='assistant'?(<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p:({children})=>(<p className="mb-1.5 last:mb-0">{children}</p>),strong:({children})=>(<strong className="font-semibold text-indigo-700 dark:text-indigo-300">{children}</strong>),li:({children})=>(<li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5"/><span>{children}</span></li>),ul:({children})=>(<ul className="space-y-0.5 my-1">{children}</ul>)}}>{msg.content}</ReactMarkdown>):msg.content}
              </div>
            </div>))}
            {aiLoading&&(<div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AI</div><div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl rounded-tl-sm px-3 py-2.5"><div className="flex gap-1 items-center h-4">{[0,150,300].map(d=>(<span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:`${d}ms`}}/>))}</div></div></div>)}
          </div>
          <div className="px-3 pb-2 flex gap-1 flex-wrap">
            {aiMode==='ask'&&selectedShape&&(<button onClick={analyzeShape} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">✦ Tahlil qil</button>)}
            {aiMode==='draw'&&["Uchburchak (3,4,5)","Doira r=5","Kvadrat 6x6"].map(q=>(<button key={q} onClick={()=>setAiInput(q)} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">{q}</button>))}
            {aiMode==='quiz'&&(<button onClick={()=>setAiInput("Menga masala ber")} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">🎯 Yangi masala</button>)}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700/40"><div className="flex gap-2">
            <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAIMessage()}}} placeholder={aiMode==='ask'?"Savol bering...":aiMode==='draw'?"Chizishni aytiring...":"Masala so'rang..."} rows={2} className="flex-1 resize-none rounded-xl text-xs border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors p-2.5"/>
            <button onClick={sendAIMessage} disabled={!aiInput.trim()||aiLoading} className="w-9 h-9 self-end rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center disabled:opacity-40 transition-all hover:opacity-90"><Send size={14} className="text-white"/></button>
          </div></div>
        </motion.div>)}
      </AnimatePresence>
    </div>
  )
}
