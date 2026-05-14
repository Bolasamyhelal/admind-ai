import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"

export async function POST(req: NextRequest) {
  try {
    const { entries, formattedReport, date } = await req.json()
    const lines = (formattedReport || "").split("\n").filter((l: string) => l.trim())

    const wb = new ExcelJS.Workbook()
    wb.creator = "AdMind AI"
    wb.created = new Date()

    const ws = wb.addWorksheet("التقرير اليومي", {
      views: [{ rightToLeft: true, showGridLines: false }],
      pageSetup: { orientation: "portrait", paperSize: 9, fitToPage: true },
    })

    // Column widths
    ws.getColumn(1).width = 6
    ws.getColumn(2).width = 80

    // Colors
    const primaryColor = "7C3AED"
    const darkBg = "1A1A2E"
    const altBg = "0D0D1A"
    const white = "FFFFFFFF"
    const muted = "9CA3AF"

    // Row 1: Logo + Title
    ws.mergeCells("A1:B1")
    const titleCell = ws.getCell("A1")
    titleCell.value = "AdMind AI"
    titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: primaryColor } }
    titleCell.alignment = { horizontal: "center", vertical: "middle" }
    ws.getRow(1).height = 36

    // Row 2: Date
    ws.mergeCells("A2:B2")
    const dateCell = ws.getCell("A2")
    dateCell.value = date
    dateCell.font = { name: "Segoe UI", size: 11, color: { argb: muted } }
    dateCell.alignment = { horizontal: "center", vertical: "middle" }
    ws.getRow(2).height = 24

    // Row 3: spacer
    ws.getRow(3).height = 8

    // Row 4: Divider line (using bottom border on empty row)
    ws.mergeCells("A4:B4")
    const dividerCell = ws.getCell("A4")
    dividerCell.value = ""
    dividerCell.border = {
      bottom: { style: "medium", color: { argb: primaryColor } },
    }
    ws.getRow(4).height = 4

    // Row 5: spacer
    ws.getRow(5).height = 12

    // Row 6: Count
    ws.mergeCells("A6:B6")
    const countCell = ws.getCell("A6")
    countCell.value = lines.length
    countCell.font = { name: "Segoe UI", size: 36, bold: true, color: { argb: primaryColor } }
    countCell.alignment = { horizontal: "center", vertical: "middle" }
    ws.getRow(6).height = 48

    // Row 7: Count label
    ws.mergeCells("A7:B7")
    const labelCell = ws.getCell("A7")
    labelCell.value = "إنجاز تم اليوم"
    labelCell.font = { name: "Segoe UI", size: 13, color: { argb: muted } }
    labelCell.alignment = { horizontal: "center", vertical: "middle" }
    ws.getRow(7).height = 24

    // Row 8: spacer
    ws.getRow(8).height = 16

    // Row 9: Table header
    const headerRow = ws.getRow(9)
    headerRow.height = 32

    const hCell1 = ws.getCell("A9")
    hCell1.value = "#"
    hCell1.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: white } }
    hCell1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: primaryColor } }
    hCell1.alignment = { horizontal: "center", vertical: "middle" }

    const hCell2 = ws.getCell("B9")
    hCell2.value = "الإنجاز"
    hCell2.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: white } }
    hCell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: primaryColor } }
    hCell2.alignment = { horizontal: "right", vertical: "middle" }

    // Data rows
    lines.forEach((line: string, i: number) => {
      const rowNum = 10 + i
      const row = ws.getRow(rowNum)
      row.height = 28

      const bgColor = i % 2 === 0 ? darkBg : altBg

      const c1 = ws.getCell(`A${rowNum}`)
      c1.value = i + 1
      c1.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "A78BFA" } }
      c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
      c1.alignment = { horizontal: "center", vertical: "middle" }
      c1.border = {
        bottom: { style: "thin", color: { argb: "333333" } },
      }

      const c2 = ws.getCell(`B${rowNum}`)
      c2.value = line
      c2.font = { name: "Segoe UI", size: 11, color: { argb: "E5E7EB" } }
      c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
      c2.alignment = { horizontal: "right", vertical: "middle", wrapText: true }
      c2.border = {
        bottom: { style: "thin", color: { argb: "333333" } },
      }
    })

    // Footer row
    const footerRowNum = 10 + lines.length
    ws.getRow(footerRowNum).height = 8

    const buf = await wb.xlsx.writeBuffer()

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="AdMind_Report_${date}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Excel export error:", error)
    return NextResponse.json({ error: "Failed to generate Excel" }, { status: 500 })
  }
}
