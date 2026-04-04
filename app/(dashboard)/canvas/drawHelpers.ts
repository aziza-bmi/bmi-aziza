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
    const a = Math.min(w, h) * 0.1
    return {
      'Tomon (a)': `${a.toFixed(1)} sm`,
      'Hajm': `${(a*a*a).toFixed(2)} sm³`,
      'To\'liq sirt': `${(6*a*a).toFixed(2)} sm²`,
      'Diagonal': `${(a*Math.sqrt(3)).toFixed(2)} sm`,
    }
  }
  if (shape.type === 'cylinder' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * 0.1
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * 0.1
    const r = w / 2
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Balandlik (h)': `${h.toFixed(2)} sm`,
      'Hajm': `${(Math.PI*r*r*h).toFixed(2)} sm³`,
      'Yon sirt': `${(2*Math.PI*r*h).toFixed(2)} sm²`,
      'To\'liq sirt': `${(2*Math.PI*r*(r+h)).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'cone' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * 0.1
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * 0.1
    const r = w / 2
    const l = Math.sqrt(r*r + h*h)
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Balandlik (h)': `${h.toFixed(2)} sm`,
      'Apotem (l)': `${l.toFixed(2)} sm`,
      'Hajm': `${((Math.PI*r*r*h)/3).toFixed(2)} sm³`,
      'Yon sirt': `${(Math.PI*r*l).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'sphere' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * 0.1
    const r = w / 2
    return {
      'Radius (r)': `${r.toFixed(2)} sm`,
      'Diametr': `${(r*2).toFixed(2)} sm`,
      'Hajm': `${((4/3)*Math.PI*r*r*r).toFixed(2)} sm³`,
      'Sirt yuzi': `${(4*Math.PI*r*r).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'pyramid' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * 0.1
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * 0.1
    const a = w
    return {
      'Asos tomoni (a)': `${a.toFixed(2)} sm`,
      'Balandlik (h)': `${h.toFixed(2)} sm`,
      'Asos yuzi': `${(a*a).toFixed(2)} sm²`,
      'Hajm': `${((a*a*h)/3).toFixed(2)} sm³`,
      'Yon sirt': `${(2*a*Math.sqrt((a/2)*(a/2)+h*h)).toFixed(2)} sm²`,
    }
  }
  if (shape.type === 'prism' && shape.points.length >= 2) {
    const w = Math.abs(shape.points[1].x - shape.points[0].x) * 0.1
    const h = Math.abs(shape.points[1].y - shape.points[0].y) * 0.1
    const a = w
    const b = h
    return {
      'Asos (a)': `${a.toFixed(2)} sm`,
      'Balandlik (h)': `${b.toFixed(2)} sm`,
      'Hajm': `${(a*a*b).toFixed(2)} sm³`,
      'Yon sirt': `${(4*a*b).toFixed(2)} sm²`,
      'To\'liq sirt': `${(4*a*b + 2*a*a).toFixed(2)} sm²`,
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

  if (shape.type === 'cube') {
    // Front face
    ctx.beginPath()
    ctx.rect(x, y + depth/2, w - depth, h - depth)
    ctx.fill(); ctx.stroke()
    // Top face
    ctx.beginPath()
    ctx.moveTo(x, y + depth/2)
    ctx.lineTo(x + depth, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w - depth, y + depth/2)
    ctx.closePath()
    ctx.fillStyle = color + '44'
    ctx.fill(); ctx.stroke()
    // Right face
    ctx.beginPath()
    ctx.moveTo(x + w - depth, y + depth/2)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h - depth)
    ctx.lineTo(x + w - depth, y + h)
    ctx.closePath()
    ctx.fillStyle = color + '18'
    ctx.fill(); ctx.stroke()
    // Labels
    if (selected) {
      ctx.fillStyle = color
      ctx.font = `bold ${11/zoom}px Inter`
      ctx.fillText('a', x + (w-depth)/2 - 4/zoom, y + h - depth/2 + 16/zoom)
    }
  }

  else if (shape.type === 'prism') {
    const mid = x + (w - depth) / 2
    // Front triangle
    ctx.beginPath()
    ctx.moveTo(x + (w-depth)/2, y + depth/2)
    ctx.lineTo(x + w - depth, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.fillStyle = color + '22'
    ctx.fill(); ctx.stroke()
    // Back triangle (offset)
    ctx.beginPath()
    ctx.moveTo(x + (w-depth)/2 + depth, y)
    ctx.lineTo(x + w, y + h - depth/2)
    ctx.lineTo(x + depth, y + h - depth/2)
    ctx.closePath()
    ctx.fillStyle = color + '15'
    ctx.fill(); ctx.stroke()
    // Connecting edges
    ctx.beginPath()
    ctx.moveTo(x + (w-depth)/2, y + depth/2)
    ctx.lineTo(x + (w-depth)/2 + depth, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x + depth, y + h - depth/2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w - depth, y + h)
    ctx.lineTo(x + w, y + h - depth/2)
    ctx.stroke()
  }

  else if (shape.type === 'pyramid') {
    const apex = { x: x + w/2, y: y }
    const base = [
      { x: x, y: y + h },
      { x: x + w - depth, y: y + h },
      { x: x + w, y: y + h - depth/2 },
      { x: x + depth, y: y + h - depth/2 },
    ]
    // Base (parallelogram)
    ctx.beginPath()
    ctx.moveTo(base[0].x, base[0].y)
    base.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.closePath()
    ctx.fillStyle = color + '18'
    ctx.fill(); ctx.stroke()
    // Visible faces
    ctx.beginPath()
    ctx.moveTo(apex.x, apex.y)
    ctx.lineTo(base[0].x, base[0].y)
    ctx.lineTo(base[1].x, base[1].y)
    ctx.closePath()
    ctx.fillStyle = color + '30'
    ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(apex.x, apex.y)
    ctx.lineTo(base[1].x, base[1].y)
    ctx.lineTo(base[2].x, base[2].y)
    ctx.closePath()
    ctx.fillStyle = color + '18'
    ctx.fill(); ctx.stroke()
    // Apex label
    if (selected) {
      ctx.fillStyle = color
      ctx.font = `bold ${11/zoom}px Inter`
      ctx.fillText('h', apex.x + 4/zoom, (apex.y + base[0].y) / 2)
    }
  }

  else if (shape.type === 'cylinder') {
    const rx = (w - depth) / 2
    const ry = depth / 4
    const cx = x + rx
    // Body
    ctx.beginPath()
    ctx.rect(x, y + ry, w - depth, h - ry * 2)
    ctx.fillStyle = color + '22'
    ctx.fill(); ctx.stroke()
    // Bottom ellipse
    ctx.beginPath()
    ctx.ellipse(cx, y + h - ry, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = color + '30'
    ctx.fill(); ctx.stroke()
    // Top ellipse
    ctx.beginPath()
    ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = color + '44'
    ctx.fill(); ctx.stroke()
    // Labels
    if (selected) {
      ctx.fillStyle = color
      ctx.font = `bold ${11/zoom}px Inter`
      ctx.fillText('r', cx + rx + 4/zoom, y + ry)
      ctx.fillText('h', x + w - depth + 8/zoom, y + h/2)
    }
  }

  else if (shape.type === 'cone') {
    const rx = (w - depth) / 2
    const ry = depth / 4
    const cx = x + rx
    const apex = { x: cx, y: y }
    // Bottom ellipse
    ctx.beginPath()
    ctx.ellipse(cx, y + h - ry, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = color + '30'
    ctx.fill(); ctx.stroke()
    // Left side
    ctx.beginPath()
    ctx.moveTo(apex.x, apex.y)
    ctx.lineTo(x, y + h - ry)
    ctx.stroke()
    // Right side
    ctx.beginPath()
    ctx.moveTo(apex.x, apex.y)
    ctx.lineTo(x + w - depth, y + h - ry)
    ctx.stroke()
    // Fill cone body
    ctx.beginPath()
    ctx.moveTo(apex.x, apex.y)
    ctx.lineTo(x, y + h - ry)
    ctx.ellipse(cx, y + h - ry, rx, ry, 0, Math.PI, 0)
    ctx.closePath()
    ctx.fillStyle = color + '22'
    ctx.fill()
    // Labels
    if (selected) {
      ctx.fillStyle = color
      ctx.font = `bold ${11/zoom}px Inter`
      ctx.fillText('r', cx + rx + 4/zoom, y + h - ry)
      ctx.fillText('h', cx + 4/zoom, y + h / 2)
    }
  }

  else if (shape.type === 'sphere') {
    const r = Math.min(w, h) / 2
    const cx = x + w / 2
    const cy = y + h / 2
    // Sphere circle
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = color + '18'
    ctx.fill(); ctx.stroke()
    // Equator ellipse
    ctx.beginPath()
    ctx.ellipse(cx, cy, r, r * 0.25, 0, 0, Math.PI * 2)
    ctx.strokeStyle = color + '80'
    ctx.setLineDash([4/zoom, 4/zoom])
    ctx.stroke()
    ctx.setLineDash([])
    // Meridian arc
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * 0.25, r, 0, 0, Math.PI * 2)
    ctx.strokeStyle = color + '80'
    ctx.setLineDash([4/zoom, 4/zoom])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = color
    // Radius line
    if (selected) {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + r, cy)
      ctx.stroke()
      ctx.fillStyle = color
      ctx.font = `bold ${11/zoom}px Inter`
      ctx.fillText('r', cx + r/2, cy - 6/zoom)
    }
  }

  ctx.restore()
}

export function drawGridFn(ctx: CanvasRenderingContext2D, w: number, h: number, pan: Point, zoom: number, axes: boolean, dark: boolean) {
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
