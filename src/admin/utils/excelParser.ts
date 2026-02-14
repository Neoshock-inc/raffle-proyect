import * as XLSX from 'xlsx'

const MAX_NUMBER = 9_999_999

export interface ParseResult {
    success: boolean
    numbers: number[]
    count: number
    duplicateCount: number
    invalidCount: number
    min: number
    max: number
    errors: string[]
}

function validateAndExtractNumbers(rawValues: unknown[]): ParseResult {
    const numbers: number[] = []
    const errors: string[] = []
    const seen = new Set<number>()
    let duplicateCount = 0
    let invalidCount = 0

    for (let i = 0; i < rawValues.length; i++) {
        const raw = rawValues[i]

        if (raw === null || raw === undefined || raw === '') continue

        // Check if it looks like a string that isn't a number
        const str = String(raw).trim()
        if (str === '') continue

        const num = Number(str)

        if (isNaN(num)) {
            invalidCount++
            if (invalidCount <= 5) {
                errors.push(`Fila ${i + 1}: "${str}" no es un número válido`)
            }
            continue
        }

        if (!Number.isInteger(num)) {
            invalidCount++
            if (invalidCount <= 5) {
                errors.push(`Fila ${i + 1}: "${str}" es decimal, solo se aceptan enteros`)
            }
            continue
        }

        if (num < 0) {
            invalidCount++
            if (invalidCount <= 5) {
                errors.push(`Fila ${i + 1}: ${num} es negativo, solo se aceptan números >= 0`)
            }
            continue
        }

        if (num > MAX_NUMBER) {
            invalidCount++
            if (invalidCount <= 5) {
                errors.push(`Fila ${i + 1}: ${num} excede el máximo permitido (${MAX_NUMBER.toLocaleString()})`)
            }
            continue
        }

        if (seen.has(num)) {
            duplicateCount++
            if (duplicateCount <= 3) {
                errors.push(`Fila ${i + 1}: número ${num} duplicado (ignorado)`)
            }
            continue
        }

        seen.add(num)
        numbers.push(num)
    }

    // Summary errors for large counts
    if (invalidCount > 5) {
        errors.push(`...y ${invalidCount - 5} valores inválidos más`)
    }
    if (duplicateCount > 3) {
        errors.push(`...y ${duplicateCount - 3} duplicados más (${duplicateCount} duplicados en total)`)
    }

    if (numbers.length === 0) {
        return {
            success: false,
            numbers: [],
            count: 0,
            duplicateCount,
            invalidCount,
            min: 0,
            max: 0,
            errors: errors.length > 0 ? errors : ['No se encontraron números válidos en el archivo'],
        }
    }

    numbers.sort((a, b) => a - b)

    return {
        success: true,
        numbers,
        count: numbers.length,
        duplicateCount,
        invalidCount,
        min: numbers[0],
        max: numbers[numbers.length - 1],
        errors,
    }
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const rawValues = rows.map(row => row[0])
    return validateAndExtractNumbers(rawValues)
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
    const text = await file.text()
    const lines = text.split(/\r?\n/)
    const rawValues = lines.map(line => line.split(',')[0]?.trim())
    return validateAndExtractNumbers(rawValues)
}

export async function parseNumberFile(file: File): Promise<ParseResult> {
    const ext = file.name.toLowerCase().split('.').pop()
    if (ext === 'csv') {
        return parseCSVFile(file)
    }
    return parseExcelFile(file)
}
