'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Triangle, Circle, Square, Minus,
  Eraser, Undo2, Redo2, ZoomIn, ZoomOut, Grid3x3,
  Download, Save, Trash2, BookOpen, Library,
  Send, Bot, Target, PenTool, Move, Hand,
  ChevronLeft, ChevronRight, X, Layers, Box, Globe
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import { Tool, ShapeType, Point, Shape, AIMessage, AIMode } from './types'
import { drawShapeFn, drawGridFn, calcShapeInfo } from './drawHelpers'

const CylinderIcon = ({size=16}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5"/></svg>
const ConeIcon = ({size=16}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="19" rx="9" ry="3"/><path d="M3 19l9-16 9 16"/></svg>

const COLORS = ['#4F46E5','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#1E293B']

const THEORY_DATA: Record<string,{title:string;definition:string;formula:string;properties:string[];example:string}> = {
  triangle: {
    title: 'Uchburchak',
    definition: 'Uchburchak — uchta nuqta va ularni birlashtiruvchi uchta kesmadan iborat geometrik figura.',
    formula: '**Yuza:** $S = \\frac{1}{2} \\cdot a \\cdot h$\n\n**Perimetr:** $P = a + b + c$\n\n**Pifagor:** $c^2 = a^2 + b^2$',
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
    formula: "**Burchaklar yig'indisi:** $\\Sigma = (n-2) \\cdot 180°$\n\n**Bir burchak:** $\\alpha = \\frac{(n-2)\\cdot 180°}{n}$",
    properties: ["n — tomonlar soni","Muntazam: barcha tomonlar teng","Ichki burchak: (n-2)·180°/n","Tashqi burchaklar yig'indisi: 360°"],
    example: 'Muntazam oltiburchak: 6 teng tomon',
  },
  cube: {
    title: 'Kub',
    definition: 'Kub — barcha tomonlari teng kvadratlardan tashkil topgan to\'g\'ri burchakli parallelepiped.',
    formula: '**Hajm:** $V = a^3$\n\n**To\'liq sirt:** $S = 6a^2$\n\n**Diagonal:** $d = a\\sqrt{3}$',
    properties: ['12 ta qirrasi bor','8 ta uchi bor','6 ta yuzi bor','Barcha yuzlar kvadrat'],
    example: 'a=3 → V = 27 sm³, S = 54 sm²',
  },
  cylinder: {
    title: 'Silindr',
    definition: 'Silindr — aylananing o\'q atrofida aylanib hosil qilgan jism.',
    formula: '**Hajm:** $V = \\pi r^2 h$\n\n**Yon sirt:** $S_{yon} = 2\\pi r h$\n\n**To\'liq sirt:** $S = 2\\pi r(r+h)$',
    properties: ['Ikki parallel asos','Yon sirt to\'g\'ri to\'rtburchak','r — asos radiusi','h — balandlik'],
    example: 'r=3, h=5 → V ≈ 141.37 sm³',
  },
  sphere: {
    title: 'Shar',
    definition: 'Shar — markazdan teng masofada joylashgan fazodagi nuqtalar to\'plami.',
    formula: '**Hajm:** $V = \\frac{4}{3}\\pi r^3$\n\n**Sirt yuzi:** $S = 4\\pi r^2$',
    properties: ['R — markazdan uch nuqtaga masofa','Diametr: d = 2R','Kesim — doira','Aylanaga o\'xshash'],
    example: 'r=4 → V ≈ 268.08 sm³, S ≈ 201.06 sm²',
  },
  pyramid: {
    title: 'Piramida',
    definition: 'Piramida — ko\'pburchak asos va bir nuqtaga (uchiga) birlashtiruvchi uchburchaklardan tashkil topgan jism.',
    formula: '**Hajm:** $V = \\frac{1}{3} S_{asos} \\cdot h$\n\n**Yon sirt:** $S_{yon} = \\frac{1}{2} P \\cdot l$',
    properties: ['Asos — ko\'pburchak','Yon yuzlar — uchburchak','h — balandlik','l — apotem'],
    example: 'a=4, h=3 → V = 16 sm³',
  },
  prism: {
    title: 'Prizma',
    definition: 'Prizma — ikkita parallel kongruent ko\'pburchak va ularni tutashtiruvchi to\'rtburchaklardan iborat jism.',
    formula: '**Hajm:** $V = S_{asos} \\cdot h$\n\n**Sirt:** $S = 2S_{asos} + P_{asos} \\cdot h$',
    properties: ['Ikki parallel asos','Yon yuzlar — to\'rtburchak','h — balandlik','P — perimetr'],
    example: 'Asos: 3x4, h=5 → V = 60 sm³',
  },
  // Firestore legacy topic ids
  'nuqta-chiziq-kesma': {
    title: "Nuqta, to'g'ri chiziq va kesma",
    definition: "Geometriyaning asosiy tushunchalari: nuqta (o'lchovsiz), to'g'ri chiziq (cheksiz uzun), kesma (chegaralangan).",
    formula: "**Kesma uzunligi:** $AB = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$\n\n**O'rta nuqta:** $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$",
    properties: ["Ikki nuqta orqali bitta to'g'ri chiziq o'tadi","Kesma — to'g'ri chiziq bo'lagi","Nuqta o'lchamsiz"],
    example: 'A(1,0), B(5,0) → AB = 4 birlik',
  },
  'burchak-turlari': {
    title: 'Burchak va uning turlari',
    definition: "Burchak — umumiy nuqtadan chiquvchi ikki nurdan hosil bo'lgan figura.",
    formula: "**Radianlar:** $\\alpha_{rad} = \\alpha_{deg} \\cdot \\frac{\\pi}{180}$",
    properties: ["O'tkir: 0° < α < 90°", "To'g'ri: α = 90°", "O'tmas: 90° < α < 180°", "Yoyilgan: α = 180°"],
    example: 'Burchak 45° — o\'tkir burchak',
  },
  'pifagor-teoremasi': {
    title: 'Pifagor teoremasi',
    definition: "To'g'ri burchakli uchburchakda gipotenuzaning kvadrati katetlar kvadratlarining yig'indisiga teng.",
    formula: '**Pifagor:** $c^2 = a^2 + b^2$\n\n**Katet:** $a = \\sqrt{c^2 - b^2}$',
    properties: ["Faqat to'g'ri burchakli uchburchaklarda","c — gipotenuza (eng uzun tomon)","a, b — katetlar","Pifagor uchlik: (3,4,5), (5,12,13)"],
    example: 'a=3, b=4 → c=5',
  },
}

const LIBRARY_SHAPES = [
  { name: "Kub", type: 'cube' as ShapeType, color: '#3B82F6' },
  { name: "Prizma", type: 'prism' as ShapeType, color: '#10B981' },
  { name: "Piramida", type: 'pyramid' as ShapeType, color: '#F59E0B' },
  { name: "Silindr", type: 'cylinder' as ShapeType, color: '#EF4444' },
  { name: "Konus", type: 'cone' as ShapeType, color: '#8B5CF6' },
  { name: "Shar", type: 'sphere' as ShapeType, color: '#4F46E5' },
  { name: "Kvadrat", type: 'rect' as ShapeType, color: '#10B981' },
  { name: "Teng tomonli uchburchak", type: 'triangle' as ShapeType, sides: 3, color: '#4F46E5' },
  { name: "Doira", type: 'circle' as ShapeType, color: '#EF4444' },
  { name: "Beshburchak", type: 'polygon' as ShapeType, sides: 5, color: '#8B5CF6' },
  { name: "Oltiburchak", type: 'polygon' as ShapeType, sides: 6, color: '#EC4899' },
]



import { LESSONS_SEED } from '@/lib/lessonsData';

export default function GeoLabPage() {
  const { user } = useAuth()
  const [theorySections, setTheorySections] = useState<any[]>([]);
  const [theoryLoading, setTheoryLoading] = useState(true);

  useEffect(() => {
    const fetchTheory = async () => {
      try {
        const q = query(collection(db, 'lessons'), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        if(!snapshot.empty) setTheorySections(snapshot.docs.map(d=>({id: d.id, ...d.data()})));
        else setTheorySections(LESSONS_SEED);
      } catch (err) {
        console.error(err);
        setTheorySections(LESSONS_SEED);
      } finally {
        setTheoryLoading(false);
      }
    };
    fetchTheory();
  }, []);
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
  const [selectedTopicId, setSelectedTopicId] = useState<string|null>(null)
  const [expandedChapter, setExpandedChapter] = useState<string|null>(null)
  const [aiMode,setAiMode]=useState<AIMode>('ask')
  const [aiMessages,setAiMessages]=useState<AIMessage[]>([{role:'assistant',content:"Salom! Men **GeoLab AI** yordamchiman! 🎨\n\n- **So'ra** — figura haqida savol\n- **Chizdir** — AI figura chizadi\n- **Masala** — AI masala beradi"}])
  const [aiInput,setAiInput]=useState(''); const [aiLoading,setAiLoading]=useState(false)
  const [aiQuizContent,setAiQuizContent]=useState<string|null>(null)
  const [pan,setPan]=useState<Point>({x:0,y:0})
  const [zoom,setZoom]=useState(1)

  const [leftWidth, setLeftWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(300)
  const isDraggingLeft = useRef(false)
  const isDraggingRight = useRef(false)

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

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDraggingLeft.current) {
        setLeftWidth(Math.max(200, Math.min(e.clientX, window.innerWidth - 300)))
        redraw()
      }
      if (isDraggingRight.current) {
        setRightWidth(Math.max(200, Math.min(window.innerWidth - e.clientX, window.innerWidth - 300)))
        redraw()
      }
    }
    const handleUp = () => {
      if(isDraggingLeft.current || isDraggingRight.current) {
        isDraggingLeft.current = false
        isDraggingRight.current = false
        document.body.style.cursor = 'default'
      }
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => { document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp) }
  }, [redraw])

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
    if(p.length<2) return false
    const minX=Math.min(p[0].x,p[1].x), maxX=Math.max(p[0].x,p[1].x)
    const minY=Math.min(p[0].y,p[1].y), maxY=Math.max(p[0].y,p[1].y)
    // All box-based shapes (rect + all 3D shapes)
    const BOX_TYPES=['rect','cube','prism','pyramid','cylinder','cone','sphere','triangle','polygon','vector']
    if(BOX_TYPES.includes(shape.type))return pos.x>=minX&&pos.x<=maxX&&pos.y>=minY&&pos.y<=maxY
    if(shape.type==='circle'){const r=Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2);return Math.sqrt((pos.x-p[0].x)**2+(pos.y-p[0].y)**2)<=r}
    if(shape.type==='line'){const dx=p[1].x-p[0].x,dy=p[1].y-p[0].y,len=Math.sqrt(dx*dx+dy*dy);if(len<1)return false;const t=((pos.x-p[0].x)*dx+(pos.y-p[0].y)*dy)/(len*len);const ct=Math.max(0,Math.min(1,t));const nx=p[0].x+ct*dx-pos.x,ny=p[0].y+ct*dy-pos.y;return Math.sqrt(nx*nx+ny*ny)<12}
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

  function executeDrawCommand(cmd:any, clearCanvas: boolean = false){
    const c=canvasRef.current;if(!c)return;
    const cx=c.width/2 - pan.x/zoom, cy=c.height/2 - pan.y/zoom, sc=10;
    let ns:Shape|null=null
    const color = cmd.color || selectedColor
    
    // 2D Shapes
    if(cmd.type==='rect'){const w=(cmd.width||10)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'rect',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='circle'){const r=(cmd.radius||5)*sc;ns={id:Date.now().toString(),type:'circle',points:[{x:cx,y:cy},{x:cx+r,y:cy}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='triangle'){const a=(cmd.a||3)*sc,b=(cmd.b||4)*sc;ns={id:Date.now().toString(),type:'triangle',points:[{x:cx-a/2,y:cy-b/2},{x:cx+a/2,y:cy+b/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='polygon'){const r=(cmd.radius||6)*sc;ns={id:Date.now().toString(),type:'polygon',points:[{x:cx,y:cy},{x:cx+r,y:cy}],color,strokeWidth:2,fillOpacity:0.08,sides:cmd.sides||6,labels:cmd.labels}}
    else if(cmd.type==='line'){const l=(cmd.length||10)*sc;ns={id:Date.now().toString(),type:'line',points:[{x:cx-l/2,y:cy},{x:cx+l/2,y:cy}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    // 3D Shapes
    else if(cmd.type==='cube'){const a=(cmd.a||5)*sc;ns={id:Date.now().toString(),type:'cube',points:[{x:cx-a/2,y:cy-a/2},{x:cx+a/2,y:cy+a/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='prism'){const w=(cmd.width||6)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'prism',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='pyramid'){const w=(cmd.width||6)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'pyramid',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='cylinder'){const w=(cmd.radius?cmd.radius*2:6)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'cylinder',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='cone'){const w=(cmd.radius?cmd.radius*2:6)*sc,h=(cmd.height||8)*sc;ns={id:Date.now().toString(),type:'cone',points:[{x:cx-w/2,y:cy-h/2},{x:cx+w/2,y:cy+h/2}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    else if(cmd.type==='sphere'){const r=(cmd.radius||5)*sc;ns={id:Date.now().toString(),type:'sphere',points:[{x:cx-r,y:cy-r},{x:cx+r,y:cy+r}],color,strokeWidth:2,fillOpacity:0.08,labels:cmd.labels}}
    
    if(ns){
      if(clearCanvas) {
        setShapes([ns])
        pushHistory([ns])
      } else {
        pushHistory([...shapes,ns])
      }
      setSelectedShape(ns)
    }
  }

  function handleLabelEdit(dimension: string, val: string) {
    if (!selectedShape) return
    const sc = 10
    const num = parseFloat(val)
    const newLabels = { ...selectedShape.labels, [dimension]: val }
    const ns = { ...selectedShape, points: selectedShape.points.map(p=>({...p})), labels: newLabels }
    
    if (!isNaN(num) && num > 0) {
      const p0=ns.points[0], p1=ns.points[1]
      const cx=(p0.x+p1.x)/2, cy=(p0.y+p1.y)/2
      if (ns.type === 'rect') {
        if (dimension === 'width') { const hw=num*sc/2; p0.x=cx-hw; p1.x=cx+hw }
        else if (dimension === 'height') { const hh=num*sc/2; p0.y=cy-hh; p1.y=cy+hh }
      } else if (ns.type === 'circle' && dimension === 'radius') {
        ns.points[1].x = p0.x + num*sc; ns.points[1].y = p0.y
      } else if (ns.type === 'triangle' && dimension === 'a') {
        const hw=num*sc/2; p0.x=cx-hw; p1.x=cx+hw
      } else if (ns.type === 'line' && dimension === 'length') {
        const angle = Math.atan2(p1.y-p0.y, p1.x-p0.x)
        p1.x = p0.x + num*sc*Math.cos(angle); p1.y = p0.y + num*sc*Math.sin(angle)
      } else if (['cube','prism','pyramid','cylinder','cone','sphere'].includes(ns.type)) {
        if (dimension === 'width' || dimension === 'a' || dimension === 'radius') { const hw=num*sc/2; p0.x=cx-hw; p1.x=cx+hw }
        else if (dimension === 'height' || dimension === 'h') { const hh=num*sc/2; p0.y=cy-hh; p1.y=cy+hh }
      }
    }
    const newShapes = shapes.map(s => s.id === ns.id ? ns : s)
    pushHistory(newShapes)
    setSelectedShape(ns)
  }

  async function sendAIMessage(overrideText?: string, forceMode?: AIMode){
    const userMsg = overrideText || aiInput.trim();
    if(!userMsg||aiLoading)return;
    if(!overrideText) setAiInput('');
    setAiMessages(p=>[...p,{role:'user',content:userMsg}]);
    setAiLoading(true);
    const currentMode = forceMode || aiMode;
    try{
      const summary=getCanvasSummary()
      let sp=''
      if(currentMode==='ask')sp=`Siz GeoLab AI. Canvasdagi figuralar:\n${summary}\nQisqa javob. O'zbek tilida. LaTeX: $formula$. Markdown.`
      else if(currentMode==='draw')sp=`Siz GeoLab AI chizuvchi.\nJSON ob'ekt bering:\n\`\`\`json\n{"type":"rect|circle|triangle|polygon|cube|cylinder|cone|sphere","width":10,"height":8,"radius":5,"a":3,"b":4,"sides":6,"color":"#4F46E5","labels":{"width":"10 sm","height":"8 sm","radius":"r=5 sm","a":"x"}}\n\`\`\`\nKeyin insoniy tushuntirish. O'zbek tilida.`
      else sp=`Siz GeoLab AI o'qituvchi. O'zbek tilida geometriya masalasini yozing (matni bilan!). Masala ifodasi va shartlari tugagach, shu masaladagi shaklni chizish yuzasidan MATNNING ENG OXIRIGA faqat bitta JSON obyekt qo'shing. DIQQAT: JSON kodi boshlanishidan oldin "Chizma uchun JSON" deb aslo YOZMANG. Topilishi kerak bo'lgan tomonni esa label ichida '?' qilib chizib bering. 3D figuralar (cube, prism, pyramid, cylinder, cone, sphere) tushunishingiz mumkin.
Misol 2D: \`\`\`json\n{"type":"triangle","color":"#4F46E5","labels":{"a":"5","b":"?","c":"4"}}\n\`\`\`
Misol 3D: \`\`\`json\n{"type":"prism","color":"#4F46E5","width":6,"height":10,"labels":{"width":"6 sm","height":"10 sm","depth":"?"}}\n\`\`\`
 Canvas: ${summary}`

      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,history:aiMessages.map(m=>({role:m.role,content:m.content})),systemPrompt:sp})})
      const data=await res.json();let aiText=data.message||'Xatolik.'
      
      let jsonStr = '';
      const m = aiText.match(/```json\s*([\s\S]*?)\s*```/i);
      if (m) {
        jsonStr = m[1];
      } else {
        const rawMatch = aiText.match(/\{[\s\S]*"type"\s*:\s*"[^"]+"[\s\S]*\}/i);
        if (rawMatch) jsonStr = rawMatch[0];
      }
      
      const isQuizMode = currentMode==='quiz' || (currentMode==='ask' && !!jsonStr);
      
      if(jsonStr) {
        try { executeDrawCommand(JSON.parse(jsonStr), isQuizMode) } catch(e) { console.error(e) }
      }
      
      let cleanText = aiText.replace(/```json[\s\S]*?```/gi, '').replace(/```[\s\S]*?```/gi, '');
      if (!m && jsonStr) cleanText = cleanText.replace(jsonStr, '');
      cleanText = cleanText.replace(/Chizma uchun (JSON)?(kodi)?:?\n?/gi, '').trim()
      
      if(isQuizMode) {
        setAiMode('quiz');
        setAiQuizContent(cleanText);
      }
      
      setAiMessages(p=>[...p,{role:'assistant',content:cleanText, isQuiz: isQuizMode}])
    }catch{setAiMessages(p=>[...p,{role:'assistant',content:'Xatolik yuz berdi.'}])}finally{setAiLoading(false)}
  }

  function analyzeShape(){if(!selectedShape)return;const info=calcShapeInfo(selectedShape);setAiMode('ask');setAiInput(`Men ${selectedShape.type} chizdim. ${Object.entries(info).map(([k,v])=>`${k}: ${v}`).join(', ')}. Tushuntiring.`)}

  const shapeInfo=selectedShape?calcShapeInfo(selectedShape):null
  const TOOLS_LIST=[{id:'select',icon:MousePointer2,label:'Tanlash'},{id:'hand',icon:Hand,label:'Sahnani surish'},{id:'rect',icon:Square,label:"To'rtburchak"},{id:'circle',icon:Circle,label:'Doira'},{id:'triangle',icon:Triangle,label:'Uchburchak'},{id:'line',icon:Minus,label:'Chiziq'},{id:'vector',icon:Move,label:'Vektor'},{id:'polygon',icon:Layers,label:"Ko'pburchak"},{id:'eraser',icon:Eraser,label:"O'chirish"},
  { id: 'cube', icon: Box, label: 'Kub' },
  { id: 'prism', icon: Layers, label: 'Prizma' },
  { id: 'pyramid', icon: Triangle, label: 'Piramida' },
  { id: 'cylinder', icon: CylinderIcon, label: 'Silindr' },
  { id: 'cone', icon: ConeIcon, label: 'Konus' },
  { id: 'sphere', icon: Globe, label: 'Shar' }]

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* LEFT PANEL */}
      <AnimatePresence>
        {leftPanelOpen&&(<motion.div initial={{width:0,opacity:0}} animate={{width:leftWidth,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}} className="absolute md:relative z-20 left-0 top-0 bottom-0 flex-shrink-0 flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/40 overflow-visible text-left">
          <div className="relative flex border-b border-slate-200 dark:border-slate-700/40 pr-10">
            {[{id:'theory',icon:BookOpen,label:'Nazariya'},{id:'library',icon:Library,label:'Kutubxona'},{id:'layers',icon:Layers,label:'Qatlamlar'}].map(tab=>(
              <button key={tab.id} onClick={()=>setLeftTab(tab.id as any)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${leftTab===tab.id?'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500':'text-slate-400 hover:text-slate-600'}`}><tab.icon size={16}/>{tab.label}</button>
            ))}
            <button onClick={()=>setLeftPanelOpen(false)} className="absolute right-2 top-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 hidden-scrollbar relative">
            {leftTab==='theory'&&(<div className="space-y-2">
              {/* If a topic is selected, show detail card */}
              {selectedTopicId ? (() => {
                let theoryEntry: any = THEORY_DATA[selectedTopicId] || Object.values(THEORY_DATA).find((t:any) => t.title === selectedTopicId);
                let customContent = null;
                
                if (!theoryEntry) {
                   let found = theorySections.find(s => s.id === selectedTopicId);
                   if (!found) {
                     for (const sec of theorySections) {
                       if (sec.topics) {
                         const t = sec.topics.find((x:any) => x.id === selectedTopicId);
                         if (t) { found = t; break; }
                       }
                     }
                   }
                   if (found) {
                      if (found.content) customContent = found.content;
                      theoryEntry = {
                         title: found.title,
                         definition: found.description || found.content || '',
                         formula: found.formula || '',
                         properties: found.properties || [],
                         example: found.examples ? found.examples.join('\\n') : ''
                      }
                   }
                }

                return theoryEntry ? (
                  <div className="space-y-3">
                    <button onClick={()=>setSelectedTopicId(null)} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors mb-2"><ChevronLeft size={14}/>Orqaga</button>
                    {customContent ? (
                       <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/40 prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                         <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{customContent}</ReactMarkdown>
                       </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/40">
                          <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mb-1.5">{theoryEntry.title}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{theoryEntry.definition}</p>
                        </div>
                        {theoryEntry.formula && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/40">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Formulalar</p>
                            <div className="text-xs prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{theoryEntry.formula}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {theoryEntry.properties && theoryEntry.properties.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Xususiyatlar</p>
                            {theoryEntry.properties.map((pr:string,i:number)=>(
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-2 py-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1"/>{pr}
                              </div>
                            ))}
                          </div>
                        )}
                        {theoryEntry.example && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">💡 Misol</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">{theoryEntry.example}</p>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-2">
                      <button onClick={()=>{const ls=LIBRARY_SHAPES.find(s=>s.type===selectedTopicId);if(ls)addLibraryShape(ls)}} className="flex-1 btn-gradient py-2 rounded-xl text-xs font-medium">Canvas →</button>
                      <button onClick={()=>{setAiInput(`"${theoryEntry.title}" mavzusini tahlil qilib ber`);setAiMode('ask');setRightPanelOpen(true);sendAIMessage(`"${theoryEntry.title}" mavzusini tahlil qilib ber`, 'ask')}} className="flex-1 py-2 rounded-xl text-xs font-medium border border-indigo-300 dark:border-indigo-700 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">AI tahlil</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={()=>setSelectedTopicId(null)} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mb-2"><ChevronLeft size={14}/>Orqaga</button>
                    <p className="text-xs text-slate-400">Ma&apos;lumot topilmadi</p>
                    <button onClick={()=>{setAiMode('quiz');setRightPanelOpen(true);sendAIMessage(`Menga "${selectedTopicId}" mavzusidan masala bering.`, 'quiz');}} className="w-full btn-gradient py-2 rounded-xl text-xs font-medium">AI masala so&apos;ra</button>
                  </div>
                )
              })() : (
                <>{ theoryLoading ? <div className="flex items-center gap-2 py-4"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/><span className="text-xs text-slate-400">Yuklanmoqda...</span></div> :
                theorySections.map(sec => {
                    const isChapter = sec.chapters && sec.chapters.length > 0;
                    const isPseudoChapter = sec.topics && sec.topics.length > 0;
                    
                    if (isChapter || isPseudoChapter) {
                      const chaptersToRender = isChapter ? sec.chapters : [{id: sec.id, title: sec.title, topics: sec.topics}];
                      return (
                        <div key={sec.id} className="mb-3">
                          {isChapter && (
                            <div className="px-2 py-1.5 mb-1.5">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{sec.emoji||'📚'} {sec.title}</span>
                            </div>
                          )}
                          {chaptersToRender.map((ch:any) => (
                            <div key={ch.id} className="mb-1 rounded-xl border border-slate-200 dark:border-slate-700/40 overflow-hidden">
                              <button onClick={()=>setExpandedChapter(expandedChapter===ch.id?null:ch.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold transition-colors text-left ${expandedChapter===ch.id?'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300':'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <span>{ch.title}</span>
                                <span className={`transition-transform duration-200 ${expandedChapter===ch.id?'rotate-90':''}`}><ChevronRight size={13}/></span>
                              </button>
                              {expandedChapter===ch.id && ch.topics?.map((t:any) => {
                                const topicKey = t.id?.split('-').slice(-1)[0] || t.id
                                const hasDetail = !!THEORY_DATA[topicKey] || !!THEORY_DATA[t.id]
                                return (
                                <div key={t.id} className="border-t border-slate-100 dark:border-slate-700/30 flex items-center">
                                  <button onClick={()=>hasDetail?setSelectedTopicId(THEORY_DATA[t.id]?t.id:topicKey):null}
                                    className={`flex-1 text-left px-4 py-2 text-xs transition-colors ${ hasDetail ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer' : 'text-slate-500 dark:text-slate-400 cursor-default'}`}>
                                    {t.title}
                                  </button>
                                  <button onClick={()=>{setAiMode('quiz');setRightPanelOpen(true);sendAIMessage(`Menga "${t.title}" mavzusidan masala bering.`, 'quiz');}} title="AI masala" className="px-3 py-2.5 text-slate-300 hover:text-indigo-500 transition-colors border-l border-slate-100 dark:border-slate-700/30">
                                    <Target size={13}/>
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    )
                  }

                  // Flat topic fallback
                  const topicKey = sec.id?.split('-').slice(-1)[0] || sec.id
                  const detailKey = Object.keys(THEORY_DATA).find(k=>THEORY_DATA[k].title===sec.title) || (THEORY_DATA[sec.id] ? sec.id : topicKey)
                  const hasDetail = !!THEORY_DATA[detailKey]
                  return (
                    <div key={sec.id} className="border border-slate-200 dark:border-slate-700/40 rounded-xl mb-1 flex items-center overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <button onClick={()=>hasDetail ? setSelectedTopicId(detailKey) : null}
                        className={`flex-1 text-left px-3 py-2.5 text-xs font-semibold transition-colors ${ hasDetail ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 cursor-default'}`}>
                        {sec.title}
                      </button>
                      <button onClick={()=>{setAiMode('quiz');setRightPanelOpen(true);sendAIMessage(`Menga "${sec.title}" mavzusidan masala bering.`, 'quiz');}} title="AI masala" className="px-3 py-2.5 text-slate-300 hover:text-indigo-500 transition-colors border-l border-slate-100 dark:border-slate-700/30">
                        <Target size={14}/>
                      </button>
                    </div>
                  )
                  })
                }</>
              )}
            </div>)}

            {leftTab==='library'&&(
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium mb-3">Bosib canvasga qo&apos;shing</p>
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">3D Shakllar</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {LIBRARY_SHAPES.filter(s=>['cube','prism','pyramid','cylinder','cone','sphere'].includes(s.type)).map((s,i)=>(
                      <button key={i} onClick={()=>addLibraryShape(s)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700/40 transition-all text-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:s.color+'22'}}><div className="w-5 h-5 rounded" style={{background:s.color}}/></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">2D Shakllar</p>
                  <div className="space-y-1">
                    {LIBRARY_SHAPES.filter(s=>!['cube','prism','pyramid','cylinder','cone','sphere'].includes(s.type)).map((s,i)=>(
                      <button key={i} onClick={()=>addLibraryShape(s)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700/40 transition-all text-left">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:s.color+'22'}}><div className="w-4 h-4 rounded-sm" style={{background:s.color}}/></div>
                        <span className="text-sm text-slate-700 dark:text-slate-200">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {leftTab==='layers'&&(<div className="space-y-2">{shapes.length===0?(<div className="text-center py-8"><Layers size={28} className="text-slate-300 mx-auto mb-2"/><p className="text-xs text-slate-400">Hali figura yo&apos;q</p></div>):shapes.map((s,i)=>(<div key={s.id} onClick={()=>setSelectedShape(selectedShape?.id===s.id?null:s)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${selectedShape?.id===s.id?'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700':'border-slate-200 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="w-5 h-5 rounded flex-shrink-0" style={{background:s.color}}/><span className="text-xs text-slate-700 dark:text-slate-200 flex-1 capitalize">{i+1}. {s.type}</span><button onClick={e=>{e.stopPropagation();pushHistory(shapes.filter(sh=>sh.id!==s.id));if(selectedShape?.id===s.id)setSelectedShape(null)}} className="text-slate-300 hover:text-red-400 transition-colors"><X size={14}/></button></div>))}</div>)}
          </div>
          <div onMouseDown={()=>{isDraggingLeft.current=true}} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-50"/>
        </motion.div>)}
      </AnimatePresence>
      {!leftPanelOpen && (
        <button onClick={()=>setLeftPanelOpen(true)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-16 bg-white dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 shadow-lg rounded-r-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"><ChevronRight size={18}/></button>
      )}

      {/* CENTER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Toolbar */}
        <div 
          onWheel={(e)=>e.currentTarget.scrollLeft += e.deltaY} 
          className="h-14 flex items-center gap-2 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/40 flex-shrink-0 overflow-x-auto hidden-scrollbar"
        >
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
          
          <div className="flex-1 min-w-[20px]"/>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden xl:block shrink-0">GeoLab Canvas</span>
          <div className="flex-1 min-w-[20px]"/>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={clearAll} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16}/></button>
            <button onClick={exportPNG} className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"><Download size={14}/>PNG</button>
            <button onClick={saveDrawing} className="btn-gradient flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium shadow-md shadow-indigo-200/50 dark:shadow-none"><Save size={14}/>Saqlash</button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-dot-pattern flex items-center justify-center">
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

          {/* Interactive Inputs Layer - 2D + 3D shape labels */}
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
            {/* 3D shape labels */}
            {selectedShape && ['cube','prism','pyramid','cylinder','cone','sphere'].includes(selectedShape.type) && (() => {
              const p=selectedShape.points
              const minX=Math.min(p[0].x,p[1].x), maxX=Math.max(p[0].x,p[1].x)
              const minY=Math.min(p[0].y,p[1].y), maxY=Math.max(p[0].y,p[1].y)
              const w=Math.round(Math.abs(p[1].x-p[0].x)/10), h=Math.round(Math.abs(p[1].y-p[0].y)/10)
              const wLabel = selectedShape.type==='sphere'?'r':'a'
              return (
                <>
                  {/* Width label (bottom center) */}
                  <input
                    title={selectedShape.type==='sphere'?'Radius':'Kenglik'}
                    value={selectedShape.labels?.width || selectedShape.labels?.a || selectedShape.labels?.radius || w}
                    onChange={e=>handleLabelEdit(wLabel, e.target.value)}
                    onFocus={e=>e.target.select()}
                    className="absolute w-14 text-center bg-white/95 dark:bg-slate-800/95 border border-indigo-300 dark:border-indigo-700 rounded text-xs font-bold shadow-lg outline-none pointer-events-auto text-indigo-600 dark:text-indigo-400 px-1 py-0.5"
                    style={{ left: ((minX+maxX)/2)*zoom+pan.x, top: maxY*zoom+pan.y+14, transform: 'translate(-50%, 0)' }}
                  />
                  {/* Height label (right center), skip sphere */}
                  {selectedShape.type !== 'sphere' && (
                    <input
                      title="Balandlik"
                      value={selectedShape.labels?.height || selectedShape.labels?.h || h}
                      onChange={e=>handleLabelEdit('height', e.target.value)}
                      onFocus={e=>e.target.select()}
                      className="absolute w-14 text-center bg-white/95 dark:bg-slate-800/95 border border-emerald-300 dark:border-emerald-700 rounded text-xs font-bold shadow-lg outline-none pointer-events-auto text-emerald-600 dark:text-emerald-400 px-1 py-0.5"
                      style={{ left: maxX*zoom+pan.x+16, top: ((minY+maxY)/2)*zoom+pan.y, transform: 'translate(0, -50%)' }}
                    />
                  )}
                </>
              )
            })()}
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
        {rightPanelOpen&&(<motion.div initial={{width:0,opacity:0}} animate={{width:rightWidth,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}} className="absolute md:relative z-20 right-0 top-0 bottom-0 flex-shrink-0 flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-l border-slate-200 dark:border-slate-700/40 overflow-visible text-left">
          <div onMouseDown={()=>{isDraggingRight.current=true}} className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-50"/>
          <button onClick={()=>setRightPanelOpen(false)} className="absolute left-2 top-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"><ChevronRight size={18}/></button>
          <div className="p-4 pl-10 border-b border-slate-200 dark:border-slate-700/40">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">AI</div><div><p className="text-sm font-medium text-slate-800 dark:text-slate-100">GeoLab AI</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"/><span className="text-xs text-slate-400">Online</span></div></div></div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[{id:'ask',icon:Bot,label:"So'ra"},{id:'draw',icon:PenTool,label:'Chizdir'},{id:'quiz',icon:Target,label:'Masala'}].map(m=>(<button key={m.id} onClick={()=>setAiMode(m.id as AIMode)} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs transition-all ${aiMode===m.id?'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm':'text-slate-500'}`}><m.icon size={14}/>{m.label}</button>))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">{aiMode==='ask'?"Figura haqida savol bering":aiMode==='draw'?"AI sizga figura chizadi":"AI masala beradi"}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
            {/* Quiz problem card - shows above messages when in quiz mode */}
            {aiMode==='quiz' && aiQuizContent && (
              <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎯</span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Masala</span>
                  </div>
                  <button onClick={()=>setAiQuizContent(null)} className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><X size={12}/></button>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p:({children})=><p className="mb-1.5 last:mb-0">{children}</p>,strong:({children})=><strong className="font-semibold text-indigo-700 dark:text-indigo-300">{children}</strong>}}>{aiQuizContent}</ReactMarkdown>
                </div>
                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800/40 flex gap-1">
                  <button onClick={()=>{setAiMode('ask');sendAIMessage('Bu masalani yeching va tushuntiring');}} className="flex-1 text-[11px] px-2 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all">Yechimni ko'r</button>
                  <button onClick={()=>sendAIMessage("Menga boshqa masala ber")} className="flex-1 text-[11px] px-2 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">Yangi masala</button>
                </div>
              </div>
            )}
            {aiMessages.filter(m => !m.isQuiz).map((msg,i)=>(<div key={i} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':''}`}>
              {msg.role==='assistant'&&(<div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">AI</div>)}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${msg.role==='assistant'?'bg-indigo-50 dark:bg-indigo-900/20 text-slate-800 dark:text-slate-100 rounded-tl-sm':'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-tr-sm break-words'}`}>
                {msg.role==='assistant'?(<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p:({children})=>(<p className="mb-1.5 last:mb-0">{children}</p>),strong:({children})=>(<strong className="font-semibold text-indigo-700 dark:text-indigo-300">{children}</strong>),li:({children})=>(<li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5"/><span>{children}</span></li>),ul:({children})=>(<ul className="space-y-0.5 my-1">{children}</ul>)}}>{msg.content}</ReactMarkdown>):msg.content}
              </div>
            </div>))}
            {aiLoading&&(<div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AI</div><div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl rounded-tl-sm px-3 py-2.5"><div className="flex gap-1 items-center h-4">{[0,150,300].map(d=>(<span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:`${d}ms`}}/>))}</div></div></div>)}
          </div>
          <div className="px-3 pb-2 flex gap-1 flex-wrap border-t border-slate-200 dark:border-slate-700/40 pt-2">
            {aiMode==='ask'&&selectedShape&&(<button onClick={analyzeShape} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">✦ Tahlil qil</button>)}
            {aiMode==='draw'&&["Uchburchak (3,4,5)","Doira r=5","Kvadrat 6x6"].map(q=>(<button key={q} onClick={()=>sendAIMessage(q)} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">{q}</button>))}
            {aiMode==='quiz'&&(<button onClick={()=>sendAIMessage("Menga masala ber")} className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700/40 hover:bg-indigo-100 transition-all">🎯 Yangi masala</button>)}
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900"><div className="flex gap-2">
            <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAIMessage()}}} placeholder={aiMode==='ask'?"Savol bering...":aiMode==='draw'?"Chizishni aytiring...":"Masala so'rang..."} rows={2} className="flex-1 resize-none rounded-xl text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors p-2.5"/>
            <button onClick={()=>sendAIMessage()} disabled={!aiInput.trim()||aiLoading} className="w-9 h-9 self-end rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center disabled:opacity-40 transition-all hover:opacity-90"><Send size={14} className="text-white"/></button>
          </div></div>
        </motion.div>)}
      </AnimatePresence>
      {!rightPanelOpen && (
        <button onClick={()=>setRightPanelOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-16 bg-white dark:bg-slate-800 border-y border-l border-slate-200 dark:border-slate-700 shadow-lg rounded-l-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"><ChevronLeft size={18}/></button>
      )}
    </div>
  )
}
