import { Shape, Point } from './types'

export function calcShapeInfo(shape: Shape): Record<string,string> {
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
  if (shape.type === 'cube' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x)
    const h = Math.abs(shape.points[1].y - shape.points[0].y)
    const a = Math.min(w, h) * s
    return {
      'Tomon (a)': `${a.toFixed(1)} sm`,
      'Hajm': `${(a*a*a).toFixed(2)} sm³`,
      'To\'liq sirt': `${(6*a*a).toFixed(2)} sm²`,
      'Diagonal': `${(a*Math.sqrt(3)).toFixed(2)} sm`,
    }
  }
  if (shape.type === 'cylinder' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x)
    const h = Math.abs(shape.points[1].y - shape.points[0].y)
    const depth = w * 0.4
    const rx = (w - depth) / 2
    const r = rx * s
    const height = h * s
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Balandlik (h)': `${height.toFixed(2)} sm`,
      'Hajm': `${(Math.PI*r*r*height).toFixed(2)} sm³`,
      'Yon sirt': `${(2*Math.PI*r*height).toFixed(2)} sm²`,
      'To\'liq sirt': `${(2*Math.PI*r*(r+height)).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'cone' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x)
    const h = Math.abs(shape.points[1].y - shape.points[0].y)
    const depth = w * 0.4
    const rx = (w - depth) / 2
    const r = rx * s
    const height = h * s
    const l = Math.sqrt(r*r + height*height)
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Balandlik (h)': `${height.toFixed(2)} sm`,
      'Apotem (l)': `${l.toFixed(2)} sm`,
      'Hajm': `${((Math.PI*r*r*height)/3).toFixed(2)} sm³`,
      'Yon sirt': `${(Math.PI*r*l).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'sphere' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x)
    const h = Math.abs(shape.points[1].y - shape.points[0].y)
    const r = Math.min(w, h) / 2 * s
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Diametr': `${(r*2).toFixed(2)} sm`,
      'Hajm': `${((4/3)*Math.PI*r*r*r).toFixed(2)} sm³`,
      'Sirt yuzi': `${(4*Math.PI*r*r).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'pyramid' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * s
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * s
    return {
      'Asos tomoni (a)': `${w.toFixed(2)} sm`,
      'Balandlik (h)': `${h.toFixed(2)} sm`,
      'Asos yuzi': `${(w*w).toFixed(2)} sm²`,
      'Hajm': `${((w*w*h)/3).toFixed(2)} sm³`,
      'Yon sirt': `${(2*w*Math.sqrt((w/2)*(w/2)+h*h)).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'prism' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * s
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * s
    return {
      'Asos (a)': `${w.toFixed(2)} sm`,
      'Balandlik (h)': `${h.toFixed(2)} sm`,
      'Hajm': `${(w*w*h).toFixed(2)} sm³`,
      'Yon sirt': `${(4*w*h).toFixed(2)} sm²`,
      'To\'liq sirt': `${(4*w*h + 2*w*w).toFixed(2)} sm²`,
    }
  }
  return {}
}

export function drawShapeFn(ctx: CanvasRenderingContext2D, shape: Shape, selected: boolean, isDark: boolean, zoom: number) {
  const is3D = ['cube','prism','pyramid','cylinder','cone','sphere'].includes(shape.type)
  if (is3D) {
    draw3DShape(ctx, shape, selected, zoom, isDark)
    return
  }

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
    const wText = shape.labels?.width || (w*0.1).toFixed(1) + ' sm'
    const hText = shape.labels?.height || (h*0.1).toFixed(1) + ' sm'
    if(w>20 && h>20) {
      drawLabel(wText.toString(), x + w/2, y - 6/zoom)
      drawLabel(hText.toString(), x + w + 16/zoom, y + h/2 + 4/zoom)
    }
  } else if (shape.type === 'circle' && p.length >= 2) {
    const r = Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2)
    ctx.beginPath(); ctx.arc(p[0].x,p[0].y,r,0,Math.PI*2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(p[0].x,p[0].y,3/zoom,0,Math.PI*2); ctx.fillStyle=shape.color; ctx.fill()
    if (selected) { ctx.setLineDash([4/zoom,4/zoom]); ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke(); ctx.setLineDash([]) }
    const rText = shape.labels?.radius || 'r=' + (r*0.1).toFixed(1) + ' sm'
    if(r>10) drawLabel(rText.toString(), p[0].x + (p[1].x-p[0].x)/2, p[0].y + (p[1].y-p[0].y)/2 - 6/zoom)
  } else if (shape.type === 'triangle' && p.length >= 2) {
    const midX=(p[0].x+p[1].x)/2
    ctx.beginPath(); ctx.moveTo(midX,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.lineTo(p[0].x,p[1].y); ctx.closePath(); ctx.fill(); ctx.stroke()
    if (selected) { ctx.fillStyle=shape.color; ctx.font=`bold ${12/zoom}px Inter`; ctx.fillText('A',midX-4/zoom,p[0].y-8/zoom); ctx.fillText('B',p[1].x+4/zoom,p[1].y+4/zoom); ctx.fillText('C',p[0].x-14/zoom,p[1].y+4/zoom) }
    if (p[1].x-p[0].x>20) {
      const baseW = Math.abs(p[1].x-p[0].x)
      const heightH = Math.abs(p[1].y-p[0].y)
      const sideB = Math.sqrt((p[1].x-midX)**2 + heightH**2)
      const sideC = Math.sqrt((midX-p[0].x)**2 + heightH**2)
      const aText = shape.labels?.a || (baseW*0.1).toFixed(1) + ' sm'
      const bText = shape.labels?.b || (sideB*0.1).toFixed(1) + ' sm'
      const cText = shape.labels?.c || (sideC*0.1).toFixed(1) + ' sm'
      drawLabel(aText.toString(), midX, p[1].y + 14/zoom)
      drawLabel(bText.toString(), (p[1].x + midX)/2 + 16/zoom, (p[1].y + p[0].y)/2)
      drawLabel(cText.toString(), (p[0].x + midX)/2 - 16/zoom, (p[1].y + p[0].y)/2)
    }
  } else if (shape.type === 'line' && p.length >= 2) {
    ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke()
    const len = Math.sqrt((p[1].x-p[0].x)**2 + (p[1].y-p[0].y)**2)
    const lenText = shape.labels?.length || (len*0.1).toFixed(1) + ' sm'
    drawLabel(lenText.toString(), (p[0].x+p[1].x)/2, (p[0].y+p[1].y)/2 - 8/zoom)
  } else if (shape.type === 'vector' && p.length >= 2) {
    const angle = Math.atan2(p[1].y-p[0].y, p[1].x-p[0].x)
    ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); ctx.lineTo(p[1].x,p[1].y); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(p[1].x,p[1].y)
    ctx.lineTo(p[1].x-(14/zoom)*Math.cos(angle-Math.PI/6),p[1].y-(14/zoom)*Math.sin(angle-Math.PI/6))
    ctx.moveTo(p[1].x,p[1].y)
    ctx.lineTo(p[1].x-(14/zoom)*Math.cos(angle+Math.PI/6),p[1].y-(14/zoom)*Math.sin(angle+Math.PI/6))
    ctx.stroke()
  } else if (shape.type === 'polygon' && p.length >= 2) {
    const sides=shape.sides||6, r=Math.sqrt((p[1].x-p[0].x)**2+(p[1].y-p[0].y)**2)
    ctx.beginPath()
    for (let i=0;i<sides;i++) {
      const a=(i/sides)*Math.PI*2-Math.PI/2
      const px=p[0].x+r*Math.cos(a), py=p[0].y+r*Math.sin(a)
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)
    }
    ctx.closePath(); ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

export function draw3DShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  selected: boolean,
  zoom: number,
  isDark: boolean
) {
  const p = shape.points
  if (p.length < 2) return

  ctx.save()
  const x = Math.min(p[0].x, p[1].x)
  const y = Math.min(p[0].y, p[1].y)
  const w = Math.abs(p[1].x - p[0].x)
  const h = Math.abs(p[1].y - p[0].y)
  const depth = Math.min(w, h) * 0.4
  const color = shape.color

  if (selected) { ctx.shadowColor = '#4F46E5'; ctx.shadowBlur = 12 / zoom }
  ctx.strokeStyle = color
  ctx.lineWidth = shape.strokeWidth / zoom
  ctx.fillStyle = color + '22'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const drawLabel = (text: string, lx: number, ly: number) => {
    ctx.save()
    ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
    ctx.font = `bold ${11/zoom}px Inter`
    ctx.textAlign = 'center'
    ctx.shadowColor = isDark ? '#0f172a' : '#ffffff'
    ctx.shadowBlur = 4 / zoom
    ctx.fillText(text, lx, ly)
    ctx.restore()
  }

  if (shape.type === 'cube') {
    const a = Math.min(w, h)          // cube side — always square front face
    const d = a * 0.40                // isometric depth offset
    const ox = d * 0.70              // x offset for back face
    const oy = d * 0.40              // y offset for back face
    // front face
    ctx.beginPath(); ctx.rect(x, y, a, a); ctx.fill(); ctx.stroke()
    // top face
    ctx.beginPath()
    ctx.moveTo(x,    y);     ctx.lineTo(x+ox,  y-oy)
    ctx.lineTo(x+a+ox, y-oy); ctx.lineTo(x+a,  y)
    ctx.closePath(); ctx.fillStyle = color + '55'; ctx.fill(); ctx.stroke()
    // right face
    ctx.beginPath()
    ctx.moveTo(x+a,   y);     ctx.lineTo(x+a+ox, y-oy)
    ctx.lineTo(x+a+ox, y+a-oy); ctx.lineTo(x+a,  y+a)
    ctx.closePath(); ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke()
    const aVal = shape.labels?.a || shape.labels?.width || (a * 0.1).toFixed(1) + ' sm'
    drawLabel('a=' + aVal.toString().replace(/^a=/,''), x + a/2, y + a + 14/zoom)
  }

  else if (shape.type === 'prism') {
    ctx.beginPath()
    ctx.moveTo(x + (w-depth)/2, y + depth/2); ctx.lineTo(x + w - depth, y + h); ctx.lineTo(x, y + h)
    ctx.closePath(); ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + (w-depth)/2 + depth, y); ctx.lineTo(x + w, y + h - depth/2); ctx.lineTo(x + depth, y + h - depth/2)
    ctx.closePath(); ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + (w-depth)/2, y + depth/2); ctx.lineTo(x + (w-depth)/2 + depth, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + depth, y + h - depth/2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + w - depth, y + h); ctx.lineTo(x + w, y + h - depth/2); ctx.stroke()
    const wVal = shape.labels?.width || shape.labels?.a || (w * 0.1).toFixed(1) + ' sm'
    const hVal = shape.labels?.height || shape.labels?.b || (h * 0.1).toFixed(1) + ' sm'
    drawLabel('a=' + wVal.toString().replace(/^a=/,''), x + (w-depth)/2, y + h + 16/zoom)
    drawLabel('h=' + hVal.toString().replace(/^h=/,''), x - 20/zoom, y + h/2 + depth/4)
  }

  else if (shape.type === 'pyramid') {
    const apex = { x: x + w/2, y }
    const base = [
      { x, y: y + h },
      { x: x + w - depth, y: y + h },
      { x: x + w, y: y + h - depth/2 },
      { x: x + depth, y: y + h - depth/2 },
    ]
    ctx.beginPath(); ctx.moveTo(base[0].x, base[0].y)
    base.forEach(pt => ctx.lineTo(pt.x, pt.y))
    ctx.closePath(); ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(apex.x, apex.y); ctx.lineTo(base[0].x, base[0].y); ctx.lineTo(base[1].x, base[1].y); ctx.closePath()
    ctx.fillStyle = color + '30'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(apex.x, apex.y); ctx.lineTo(base[1].x, base[1].y); ctx.lineTo(base[2].x, base[2].y); ctx.closePath()
    ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke()
    const aVal = shape.labels?.a || shape.labels?.width || (w * 0.1).toFixed(1) + ' sm'
    const hVal = shape.labels?.h || shape.labels?.height || (h * 0.1).toFixed(1) + ' sm'
    drawLabel('a=' + aVal.toString().replace(/^a=/,''), x + w/2, y + h + 14/zoom)
    drawLabel('h=' + hVal.toString().replace(/^h=/,''), apex.x + 12/zoom, (apex.y + base[0].y) / 2)
  }

  else if (shape.type === 'cylinder') {
    const cylDepth = w * 0.4
    const rx = (w - cylDepth) / 2
    const ry = cylDepth / 4
    const cx = x + rx
    ctx.beginPath(); ctx.rect(x, y + ry, w - cylDepth, h - ry * 2); ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(cx, y + h - ry, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color + '30'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color + '44'; ctx.fill(); ctx.stroke()
    const rVal = shape.labels?.radius || shape.labels?.r || (rx * 0.1).toFixed(1) + ' sm'
    const hVal = shape.labels?.height || shape.labels?.h || (h * 0.1).toFixed(1) + ' sm'
    drawLabel('r=' + rVal.toString().replace(/^r=/,''), cx + rx/2, y + ry - 10/zoom)
    drawLabel('h=' + hVal.toString().replace(/^h=/,''), x + w - cylDepth + 28/zoom, y + h/2)
  }

  else if (shape.type === 'cone') {
    const coneDepth = w * 0.4
    const rx = (w - coneDepth) / 2
    const ry = coneDepth / 4
    const cx = x + rx
    const apex = { x: cx, y }
    ctx.beginPath(); ctx.ellipse(cx, y + h - ry, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color + '30'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(apex.x, apex.y); ctx.lineTo(x, y + h - ry); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(apex.x, apex.y); ctx.lineTo(x + w - coneDepth, y + h - ry); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(apex.x, apex.y); ctx.lineTo(x, y + h - ry)
    ctx.ellipse(cx, y + h - ry, rx, ry, 0, Math.PI, 0); ctx.closePath()
    ctx.fillStyle = color + '22'; ctx.fill()
    const rVal = shape.labels?.radius || shape.labels?.r || (rx * 0.1).toFixed(1) + ' sm'
    const hVal = shape.labels?.height || shape.labels?.h || (h * 0.1).toFixed(1) + ' sm'
    drawLabel('r=' + rVal.toString().replace(/^r=/,''), cx + rx/2, y + h - ry + 14/zoom)
    drawLabel('h=' + hVal.toString().replace(/^h=/,''), cx + 20/zoom, y + h / 2)
  }

  else if (shape.type === 'sphere') {
    const r = Math.min(w, h) / 2
    const cx = x + w / 2
    const cy = y + h / 2
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = color + '18'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.25, 0, 0, Math.PI * 2)
    ctx.strokeStyle = color + '80'; ctx.setLineDash([4/zoom, 4/zoom]); ctx.stroke(); ctx.setLineDash([])
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.25, r, 0, 0, Math.PI * 2)
    ctx.strokeStyle = color + '80'; ctx.setLineDash([4/zoom, 4/zoom]); ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = color
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r, cy); ctx.stroke()
    const rVal = shape.labels?.radius || shape.labels?.r || (r * 0.1).toFixed(1) + ' sm'
    drawLabel('r=' + rVal.toString().replace(/^r=/,''), cx + r/2, cy - 8/zoom)
  }

  ctx.restore()
}

export function drawGridFn(ctx: CanvasRenderingContext2D, w: number, h: number, pan: Point, zoom: number, axes: boolean, dark: boolean) {
  ctx.save()
  ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.3)'; ctx.lineWidth = 0.5/zoom

  const left = -pan.x / zoom
  const right = left + w / zoom
  const top = -pan.y / zoom
  const bottom = top + h / zoom
  const spacing = 30

  const startX = Math.floor(left / spacing) * spacing
  const startY = Math.floor(top / spacing) * spacing

  ctx.beginPath()
  for (let gx=startX; gx<right; gx+=spacing) { ctx.moveTo(gx, top); ctx.lineTo(gx, bottom) }
  for (let gy=startY; gy<bottom; gy+=spacing) { ctx.moveTo(left, gy); ctx.lineTo(right, gy) }
  ctx.stroke()

  if (axes) {
    const mx=w/2, my=h/2
    ctx.strokeStyle=dark?'rgba(99,102,241,0.5)':'rgba(79,70,229,0.4)'; ctx.lineWidth=1.5/zoom
    ctx.beginPath(); ctx.moveTo(left,my); ctx.lineTo(right,my); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(mx,top); ctx.lineTo(mx,bottom); ctx.stroke()
    ctx.fillStyle=dark?'#818CF8':'#4F46E5'; ctx.font=`${11/zoom}px Inter`
    ctx.fillText('X',right-16/zoom,my-6/zoom); ctx.fillText('Y',mx+6/zoom,top+14/zoom); ctx.fillText('0',mx+4/zoom,my-4/zoom)
  }
  ctx.restore()
}
