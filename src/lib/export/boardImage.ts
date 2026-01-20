import type { BoardSpace, PropertySpace } from '@/types/board'
import type { BoardSize, Pokemon } from '@/types'
import { BOARD_SIZE_INCHES, COLOR_HEX } from '@/types/board'
import { getPrimaryType } from '@/lib/typeIcons'
import { getGymImage, getSpaceSprite } from '@/components/board/spaceSprites'

type ExportBoardPngOptions = {
  boardSpaces: BoardSpace[]
  boardSize: BoardSize
  dpi?: number
  fileName?: string
}

// Match PDF board renderer assumptions (see src/pdf/components/BoardTilePage.tsx)
const POINTS_PER_INCH = 72
const BASE_CORNER_SIZE_IN = 2.5
const BASE_SIDE_SIZE_IN = 1.5
const BASE_BOARD_SIZE_IN = BASE_CORNER_SIZE_IN * 2 + BASE_SIDE_SIZE_IN * 9 // 18.5

function getBaseUrl() {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

function assetUrl(path: string) {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${getBaseUrl()}${normalized}`
}

async function loadBitmap(url: string): Promise<ImageBitmap | null> {
  try {
    const resp = await fetch(url, { mode: 'cors' })
    if (!resp.ok) return null
    const blob = await resp.blob()
    return await createImageBitmap(blob)
  } catch {
    return null
  }
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const scale = Math.min(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function getCollagePositions(
  count: number,
  centerX: number,
  centerY: number,
  radius: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  if (count === 0) return positions

  const startAngle = Math.PI
  const endAngle = 2 * Math.PI
  const maxPerRing = 10
  const rings = Math.ceil(count / maxPerRing)
  let idx = 0

  for (let ring = 0; ring < rings && idx < count; ring++) {
    const ringRadius = radius * (0.35 + (ring * 0.65) / Math.max(rings - 1, 1))
    const inRing = Math.min(maxPerRing + ring * 2, count - idx)

    for (let i = 0; i < inRing && idx < count; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / Math.max(inRing - 1, 1)
      positions.push({
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius * 0.65,
      })
      idx++
    }
  }

  return positions
}

function getSpacePosition(
  index: number,
  boardSizePoints: number,
  cornerSize: number,
  sideSize: number
): { x: number; y: number; width: number; height: number } {
  const boardRight = boardSizePoints - cornerSize
  const boardBottom = boardSizePoints - cornerSize

  if (index === 0) return { x: boardRight, y: boardBottom, width: cornerSize, height: cornerSize }
  if (index >= 1 && index <= 9) {
    const pos = 9 - index
    return { x: cornerSize + pos * sideSize, y: boardBottom, width: sideSize, height: cornerSize }
  }
  if (index === 10) return { x: 0, y: boardBottom, width: cornerSize, height: cornerSize }
  if (index >= 11 && index <= 19) {
    const pos = 19 - index
    return { x: 0, y: cornerSize + pos * sideSize, width: cornerSize, height: sideSize }
  }
  if (index === 20) return { x: 0, y: 0, width: cornerSize, height: cornerSize }
  if (index >= 21 && index <= 29) {
    const pos = index - 21
    return { x: cornerSize + pos * sideSize, y: 0, width: sideSize, height: cornerSize }
  }
  if (index === 30) return { x: boardRight, y: 0, width: cornerSize, height: cornerSize }
  if (index >= 31 && index <= 39) {
    const pos = index - 31
    return { x: boardRight, y: cornerSize + pos * sideSize, width: cornerSize, height: sideSize }
  }
  return { x: 0, y: 0, width: 0, height: 0 }
}

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  sizePx: number,
  color: string,
  align: CanvasTextAlign = 'center',
  baseline: CanvasTextBaseline = 'alphabetic',
  weight: 'normal' | 'bold' = 'normal'
) {
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.font = `${weight} ${sizePx}px "Press Start 2P", system-ui, sans-serif`
  ctx.fillText(text, x, y)
}

export async function exportBoardPng({
  boardSpaces,
  boardSize,
  dpi = 300,
  fileName = `poke-poly-board-${Date.now()}.png`,
}: ExportBoardPngOptions) {
  if (typeof document === 'undefined') throw new Error('Board export is only available in the browser.')
  if (!boardSpaces || boardSpaces.length === 0) throw new Error('Board has not generated yet.')

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      // ignore
    }
  }

  const boardSizeIn = BOARD_SIZE_INCHES[boardSize]
  const boardScale = boardSizeIn / BASE_BOARD_SIZE_IN
  const scalePt = (v: number) => v * boardScale

  const boardSizePoints = boardSizeIn * POINTS_PER_INCH
  const cornerSize = BASE_CORNER_SIZE_IN * boardScale * POINTS_PER_INCH
  const sideSize = BASE_SIDE_SIZE_IN * boardScale * POINTS_PER_INCH

  const pxPerPt = dpi / POINTS_PER_INCH
  const px = (pt: number) => pt * pxPerPt
  const pxSize = (pt: number) => Math.max(1, Math.round(px(pt)))
  const pxEdge = (pt: number) => Math.round(px(pt))
  const pxRect = (xPt: number, yPt: number, wPt: number, hPt: number) => {
    const x1 = pxEdge(xPt)
    const y1 = pxEdge(yPt)
    const x2 = pxEdge(xPt + wPt)
    const y2 = pxEdge(yPt + hPt)
    return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) }
  }

  const canvas = document.createElement('canvas')
  canvas.width = pxEdge(boardSizePoints)
  canvas.height = pxEdge(boardSizePoints)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Unable to create canvas context.')

  ctx.imageSmoothingEnabled = true

  // Board background
  ctx.fillStyle = '#C8E6C9'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const bitmapCache = new Map<string, Promise<ImageBitmap | null>>()
  const getBitmap = (url: string | null) => {
    if (!url) return Promise.resolve(null)
    if (!bitmapCache.has(url)) bitmapCache.set(url, loadBitmap(url))
    return bitmapCache.get(url)!
  }

  const coinBitmapPromise = getBitmap(assetUrl('images/poke-coin.png'))
  const typeBitmapPromise = (type: string) => getBitmap(assetUrl(`icons/${type.toLowerCase()}.png`))

  const drawCoin = async (x: number, y: number, size: number) => {
    const coin = await coinBitmapPromise
    if (!coin) return
    drawImageContain(ctx, coin, x, y, size, size)
  }

  // Center pokeball
  const centerStart = cornerSize
  const centerEnd = boardSizePoints - cornerSize
  const centerSize = centerEnd - centerStart
  const centerMidY = (centerStart + centerEnd) / 2

  ctx.fillStyle = '#DC2626'
  {
    const r = pxRect(centerStart, centerStart, centerSize, centerSize / 2)
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }
  ctx.fillStyle = '#F5F5F5'
  {
    const r = pxRect(centerStart, centerMidY, centerSize, centerSize / 2)
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  ctx.fillStyle = '#1F2937'
  {
    const r = pxRect(centerStart, centerMidY - scalePt(14), centerSize, scalePt(28))
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  // Center button
  const centerButtonSize = scalePt(72)
  const centerButtonOffset = scalePt(36)
  const btnX = boardSizePoints / 2 - centerButtonOffset
  const btnY = centerMidY - centerButtonOffset
  ctx.fillStyle = '#FFFFFF'
  drawRoundedRect(ctx, pxEdge(btnX), pxEdge(btnY), pxEdge(btnX + centerButtonSize) - pxEdge(btnX), pxEdge(btnY + centerButtonSize) - pxEdge(btnY), pxSize(centerButtonSize / 2))
  ctx.fill()
  ctx.lineWidth = pxSize(scalePt(6))
  ctx.strokeStyle = '#1F2937'
  ctx.stroke()
  ctx.fillStyle = '#D1D5DB'
  {
    const r = pxRect(btnX + scalePt(22), btnY + scalePt(22), scalePt(28), scalePt(28))
    drawRoundedRect(ctx, r.x, r.y, r.w, r.h, pxSize(scalePt(14)))
  }
  ctx.fill()

  // Title (top half)
  drawPixelText(ctx, 'POKE-POLY', pxEdge(boardSizePoints / 2), pxEdge(centerStart + scalePt(40)), pxSize(scalePt(16)), '#FFFFFF', 'center', 'alphabetic', 'bold')

  // Center: collage (top half)
  const pokemon: Pokemon[] = boardSpaces
    .filter((s): s is PropertySpace & { pokemon: Pokemon } => s.type === 'property' && !!s.pokemon)
    .map(s => s.pokemon)

  const collageRadiusPadding = scalePt(50)
  const collageRadius = centerSize / 2 - collageRadiusPadding
  const collageCenterX = boardSizePoints / 2
  const collageCenterY = centerStart + (centerMidY - centerStart) * 0.55
  const collageSpriteSize = scalePt(50)
  const collagePositions = getCollagePositions(pokemon.length, collageCenterX, collageCenterY, collageRadius)

  // Center: quick rules + card placeholders (bottom half)
  const rulesPadding = scalePt(32)
  const rulesLeft = centerStart + rulesPadding
  const rulesTop = centerMidY + rulesPadding
  const rulesRight = centerEnd - rulesPadding
  const rulesWidth = rulesRight - rulesLeft
  const rulesHeight = (centerEnd - rulesPadding) - rulesTop

  // Card placeholders (dashed)
  const cardW = scalePt(96)
  const cardH = scalePt(128)
  const leftCardX = rulesLeft
  const rightCardX = rulesLeft + rulesWidth - cardW
  const cardY = rulesTop + (rulesHeight - cardH) / 2
  ctx.save()
  ctx.strokeStyle = '#9CA3AF'
  ctx.lineWidth = pxSize(scalePt(2))
  ctx.setLineDash([pxSize(scalePt(6)), pxSize(scalePt(4))])
  {
    const r1 = pxRect(leftCardX, cardY, cardW, cardH)
    ctx.strokeRect(r1.x, r1.y, r1.w, r1.h)
    const r2 = pxRect(rightCardX, cardY, cardW, cardH)
    ctx.strokeRect(r2.x, r2.y, r2.w, r2.h)
  }
  ctx.setLineDash([])
  ctx.restore()
  drawPixelText(ctx, 'Oak/Bag', pxEdge(leftCardX + cardW / 2), pxEdge(cardY + cardH / 2 - scalePt(4)), pxSize(scalePt(8)), '#6B7280', 'center', 'alphabetic', 'bold')
  drawPixelText(ctx, 'Cards', pxEdge(leftCardX + cardW / 2), pxEdge(cardY + cardH / 2 + scalePt(10)), pxSize(scalePt(8)), '#6B7280', 'center', 'alphabetic', 'bold')
  drawPixelText(ctx, 'Oak/Bag', pxEdge(rightCardX + cardW / 2), pxEdge(cardY + cardH / 2 - scalePt(4)), pxSize(scalePt(8)), '#6B7280', 'center', 'alphabetic', 'bold')
  drawPixelText(ctx, 'Cards', pxEdge(rightCardX + cardW / 2), pxEdge(cardY + cardH / 2 + scalePt(10)), pxSize(scalePt(8)), '#6B7280', 'center', 'alphabetic', 'bold')

  // Rules block (center column)
  const rulesTitleY = rulesTop + scalePt(18)
  drawPixelText(ctx, 'QUICK RULES', pxEdge(centerStart + centerSize / 2), pxEdge(rulesTitleY), pxSize(scalePt(18)), '#DC2626', 'center', 'alphabetic', 'bold')

  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = `${pxSize(scalePt(11))}px "Press Start 2P", system-ui, sans-serif`
  const rulesLines = [
    'Setup: Start with P1500 on GO.',
    'Capture unclaimed Pokémon; owned = you lost (pay).',
    'Build: Own a color set → add Gym Badges.',
    'Gyms: P25 × gyms owned.',
    'Utilities: 4× roll (10× if both).',
  ]
  const firstLineY = rulesTitleY + scalePt(22)
  rulesLines.forEach((line, i) => {
    ctx.fillText(line, pxEdge(centerStart + centerSize / 2), pxEdge(firstLineY + i * scalePt(18)))
  })

  // Draw spaces (PDF positions), then collage on top
  const spaceRects: Array<{ x: number; y: number; w: number; h: number }> = []
  for (let i = 0; i < Math.min(boardSpaces.length, 40); i++) {
    const space = boardSpaces[i]
    const pos = getSpacePosition(i, boardSizePoints, cornerSize, sideSize)
    const r = pxRect(pos.x, pos.y, pos.width, pos.height)
    const x0 = r.x
    const y0 = r.y
    const w = r.w
    const h = r.h
    if (w <= 0 || h <= 0) continue
    spaceRects.push(r)

    // Space border/background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(x0, y0, w, h)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = pxSize(scalePt(2))
    // Stroke pass is done after all content to avoid getting covered by overlaps.

    const pad = pxSize(scalePt(2))
    const x = x0 + pad
    const y = y0 + pad
    const iw = w - pad * 2
    const ih = h - pad * 2

    const overlayH = pxSize(scalePt(22))
    const overlayPadX = pxSize(scalePt(4))
    const overlayPadY = pxSize(scalePt(3))
    const overlayGap = pxSize(scalePt(2))
    const overlayCoinSize = pxSize(scalePt(6))
    const propertyCoinSize = pxSize(scalePt(8))

    const drawOverlay = async (title: string, price?: number) => {
      ctx.fillStyle = 'rgba(0,0,0,0.9)'
      ctx.fillRect(x, y + ih - overlayH, iw, overlayH)
      drawPixelText(ctx, title, x + iw / 2, y + ih - overlayH + overlayPadY + pxSize(scalePt(10)), pxSize(scalePt(8)), '#FFFFFF', 'center', 'alphabetic', 'bold')
      if (typeof price === 'number') {
        const coinX = x + iw / 2 - pxSize(scalePt(18))
        const coinY = y + ih - overlayH + overlayPadY + pxSize(scalePt(10))
        await drawCoin(coinX, coinY - overlayCoinSize + pxSize(scalePt(2)), overlayCoinSize)
        drawPixelText(ctx, String(price), x + iw / 2 + pxSize(scalePt(6)), y + ih - overlayH + overlayPadY + pxSize(scalePt(12)), pxSize(scalePt(6)), '#FFFFFF', 'left', 'alphabetic', 'bold')
      }
    }

    if (space.type === 'property') {
      const headerH = pxSize(scalePt(22))
      ctx.fillStyle = COLOR_HEX[space.color] || '#8B4513'
      ctx.fillRect(x, y, iw, headerH)

      const primaryType = space.pokemon ? getPrimaryType(space.pokemon.types) : null
      if (primaryType) {
        const bmp = await typeBitmapPromise(primaryType)
        if (bmp) {
          const iconSize = pxSize(scalePt(16))
          const cx = x + iw / 2
          const cy = y + headerH / 2
          ctx.fillStyle = 'rgba(255,255,255,0.85)'
          drawRoundedRect(ctx, cx - iconSize / 2 - pxSize(scalePt(2)), cy - iconSize / 2 - pxSize(scalePt(2)), iconSize + pxSize(scalePt(4)), iconSize + pxSize(scalePt(4)), iconSize)
          ctx.fill()
          drawImageContain(ctx, bmp, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize)
        }
      }

      // Sprite
      if (space.pokemon?.sprite) {
        const bmp = await getBitmap(space.pokemon.sprite)
        if (bmp) {
          const spriteSize = pxSize(scalePt(55))
          drawImageContain(ctx, bmp, x + iw / 2 - spriteSize / 2, y + headerH + pxSize(scalePt(4)), spriteSize, spriteSize)
        }
      }

      // Name
      const name = space.pokemon ? space.pokemon.name : '???'
      drawPixelText(ctx, name.toUpperCase().slice(0, 12), x + iw / 2, y + ih - pxSize(scalePt(18)), pxSize(scalePt(8)), '#111827', 'center', 'alphabetic', 'bold')
      // Price row
      const priceY = y + ih - pxSize(scalePt(6))
      await drawCoin(x + iw / 2 - pxSize(scalePt(18)) - propertyCoinSize, priceY - propertyCoinSize, propertyCoinSize)
      drawPixelText(ctx, String(space.price), x + iw / 2 + pxSize(scalePt(6)), priceY, pxSize(scalePt(7)), '#111827', 'left', 'alphabetic', 'bold')
      continue
    }

    if (space.type === 'gym') {
      const imgUrl = getGymImage(space.name)
      const bmp = await getBitmap(imgUrl)
      if (bmp) drawImageCover(ctx, bmp, x, y, iw, ih)
      await drawOverlay(space.name.toUpperCase(), space.price)
      continue
    }

    if (space.type === 'item-bag' || space.type === 'professor-oak' || space.type === 'grunt-ambush' || space.type === 'giovanni') {
      const sprite = getSpaceSprite(space.type)
      const bmp = await getBitmap(sprite)
      if (bmp) drawImageCover(ctx, bmp, x, y, iw, ih)
      const title =
        space.type === 'item-bag'
          ? 'ITEM BAG'
          : space.type === 'professor-oak'
            ? 'PROF. OAK'
            : space.type === 'grunt-ambush'
              ? 'GRUNT'
              : 'GIOVANNI'
      await drawOverlay(title, space.type === 'grunt-ambush' ? space.amount : space.type === 'giovanni' ? space.amount : undefined)
      continue
    }

    if (space.type === 'go' || space.type === 'jail' || space.type === 'go-to-jail' || space.type === 'free-parking') {
      const sprite = getSpaceSprite(space.type)
      const bmp = await getBitmap(sprite)
      if (bmp) drawImageCover(ctx, bmp, x, y, iw, ih)

      const label =
        space.type === 'go'
          ? 'GO'
          : space.type === 'jail'
            ? 'HIDEOUT'
            : space.type === 'go-to-jail'
              ? 'GO TO HIDEOUT'
              : 'FREE PARKING'

      ctx.fillStyle = 'rgba(0,0,0,0.70)'
      ctx.fillRect(x, y + ih - overlayH, iw, overlayH)
      drawPixelText(ctx, label, x + iw / 2, y + ih - overlayH + overlayPadY + pxSize(scalePt(12)), pxSize(scalePt(10)), '#FFFFFF', 'center', 'alphabetic', 'bold')
      if (space.type === 'go') {
        // Collect 200
        const lineY = y + ih - overlayH + overlayPadY + pxSize(scalePt(18))
        await drawCoin(x + iw / 2 - pxSize(scalePt(18)), lineY - overlayCoinSize + pxSize(scalePt(2)), overlayCoinSize)
        drawPixelText(ctx, '200', x + iw / 2 + pxSize(scalePt(6)), lineY, pxSize(scalePt(7)), '#FFFFFF', 'left', 'alphabetic', 'bold')
      }
      continue
    }

    // Fallback
    drawPixelText(ctx, '?', x + iw / 2, y + ih / 2, pxSize(scalePt(10)), '#111827')
    void overlayGap
    void overlayPadX
  }

  // Final stroke pass so outlines are dark and not covered by any fill rounding.
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = pxSize(scalePt(2))
  for (const r of spaceRects) {
    ctx.strokeRect(r.x, r.y, r.w, r.h)
  }
  // Outer board border
  ctx.strokeRect(0, 0, canvas.width, canvas.height)

  // Collage sprites last (top half center)
  for (let i = 0; i < pokemon.length; i++) {
    const p = pokemon[i]
    const pos = collagePositions[i]
    if (!pos) continue
    const bmp = await getBitmap(p.sprite)
    if (!bmp) continue
    drawImageContain(
      ctx,
      bmp,
      pxEdge(pos.x - collageSpriteSize / 2),
      pxEdge(pos.y - collageSpriteSize / 2),
      pxEdge(pos.x + collageSpriteSize / 2) - pxEdge(pos.x - collageSpriteSize / 2),
      pxEdge(pos.y + collageSpriteSize / 2) - pxEdge(pos.y - collageSpriteSize / 2)
    )
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to export PNG.'))), 'image/png')
  })

  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    URL.revokeObjectURL(url)
  }
}
