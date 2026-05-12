"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  X, Save, RotateCcw, Type, Sun, Contrast, Crop,
  Download, Palette, Move,
} from "lucide-react"

interface ImageEditorProps {
  imageData: string
  onSave: (editedData: string) => void
  onClose: () => void
}

type Tool = "text" | "adjust" | "crop"

export function ImageEditor({ imageData, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [tool, setTool] = useState<Tool | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [textContent, setTextContent] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [textSize, setTextSize] = useState(32)
  const [textX, setTextX] = useState(100)
  const [textY, setTextY] = useState(100)
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [hasCrop, setHasCrop] = useState(false)
  const [originalImage, setOriginalImage] = useState<string>(imageData)

  const img = imageRef.current

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.style.maxWidth = "100%"
    canvas.style.maxHeight = "70vh"

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    ctx.drawImage(image, 0, 0)

    if (textContent) {
      ctx.filter = "none"
      ctx.font = `bold ${textSize}px system-ui, sans-serif`
      ctx.fillStyle = textColor
      ctx.strokeStyle = "rgba(0,0,0,0.5)"
      ctx.lineWidth = 3
      ctx.textBaseline = "top"
      ctx.strokeText(textContent, textX, textY)
      ctx.fillText(textContent, textX, textY)
    }

    if (hasCrop) {
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      const x = Math.min(cropStart.x, cropEnd.x)
      const y = Math.min(cropStart.y, cropEnd.y)
      const w = Math.abs(cropEnd.x - cropStart.x)
      const h = Math.abs(cropEnd.y - cropStart.y)
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])
    }
  }, [brightness, contrast, saturation, textContent, textColor, textSize, textX, textY, hasCrop, cropStart, cropEnd])

  useEffect(() => { drawImage() }, [drawImage])

  const resetEdits = () => {
    setBrightness(100); setContrast(100); setSaturation(100)
    setTextContent(""); setHasCrop(false); setTool(null)
  }

  const applyCrop = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasCrop) return
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const w = Math.abs(cropEnd.x - cropStart.x)
    const h = Math.abs(cropEnd.y - cropStart.y)
    if (w < 10 || h < 10) return

    const cropped = document.createElement("canvas")
    cropped.width = w; cropped.height = h
    const ctx = cropped.getContext("2d")
    if (!ctx) return
    const imgEl = imageRef.current
    if (!imgEl) return
    ctx.drawImage(imgEl, x, y, w, h, 0, 0, w, h)
    const newData = cropped.toDataURL("image/png")
    const newImg = new Image()
    newImg.onload = () => {
      imageRef.current = newImg
      setOriginalImage(newData)
      setHasCrop(false)
      setIsCropping(false)
      setTool(null)
    }
    newImg.src = newData
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawImage()
    onSave(canvas.toDataURL("image/png"))
    onClose()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "crop" || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setCropStart({ x, y }); setCropEnd({ x, y })
    setIsCropping(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setCropEnd({ x, y })
  }

  const handleMouseUp = () => {
    if (!isCropping) return
    setIsCropping(false)
    setHasCrop(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">تعديل الصورة</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-wrap">
          <button onClick={() => setTool(tool === "adjust" ? null : "adjust")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tool === "adjust" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Sun className="h-4 w-4" /> تعديل
          </button>
          <button onClick={() => setTool(tool === "text" ? null : "text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tool === "text" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Type className="h-4 w-4" /> نص
          </button>
          <button onClick={() => setTool(tool === "crop" ? null : "crop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tool === "crop" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Crop className="h-4 w-4" /> قص
          </button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button onClick={resetEdits}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" /> إعادة تعيين
          </button>
          {hasCrop && tool === "crop" && (
            <button onClick={applyCrop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700"
            >
              <Crop className="h-4 w-4" /> تطبيق القص
            </button>
          )}
          <div className="flex-1" />
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700"
          >
            <Save className="h-4 w-4" /> حفظ
          </button>
        </div>

        {/* Tool options */}
        {tool === "adjust" && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-gray-400 shrink-0" />
              <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1 accent-purple-600" />
              <span className="text-xs text-gray-500 w-8 text-right">{brightness}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Contrast className="h-4 w-4 text-gray-400 shrink-0" />
              <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))}
                className="flex-1 accent-purple-600" />
              <span className="text-xs text-gray-500 w-8 text-right">{contrast}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-gray-400 shrink-0" />
              <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))}
                className="flex-1 accent-purple-600" />
              <span className="text-xs text-gray-500 w-8 text-right">{saturation}%</span>
            </div>
          </div>
        )}

        {tool === "text" && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
            <div className="flex gap-3 items-center">
              <input value={textContent} onChange={(e) => setTextContent(e.target.value)}
                placeholder="نص الإعلان..."
                className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">اللون:</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">الحجم:</label>
                <input type="range" min="12" max="72" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))}
                  className="accent-purple-600 w-24" />
                <span className="text-xs text-gray-500 w-8">{textSize}</span>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Move className="h-3 w-3" /> اسحب النص عال canvas
              </span>
            </div>
          </div>
        )}

        {tool === "crop" && (
          <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-amber-50 dark:bg-amber-950/20">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Crop className="h-3 w-3" /> اسحب على الصورة لتحديد منطقة القص
            </p>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`max-w-full max-h-[70vh] rounded-lg shadow-md ${tool === "crop" ? "cursor-crosshair" : "cursor-default"}`}
            style={{ imageRendering: "auto" }}
          />
          <img ref={imageRef} src={originalImage} alt="original" className="hidden" crossOrigin="anonymous" />
        </div>
      </motion.div>
    </motion.div>
  )
}