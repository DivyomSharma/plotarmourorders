import { PrintPrice } from '@/types/order';

export interface ParsedPrint {
  code: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PrintParseResult {
  valid: boolean;
  prints: ParsedPrint[];
  total: number;
  error?: string;
}

export function parsePrintCode(printCode: string, printPrices: PrintPrice): PrintParseResult {
  if (!printCode || printCode.trim() === '') {
    return {
      valid: true,
      prints: [],
      total: 0,
    };
  }

  const prints: ParsedPrint[] = [];
  let total = 0;

  // Split by + and process each part
  const parts = printCode.split('+').map(p => p.trim());

  for (const part of parts) {
    // Match pattern like "6A2" or "1A3"
    const match = part.match(/^(\d+)\s*([Aa]\d+)$/);
    
    if (!match) {
      return {
        valid: false,
        prints: [],
        total: 0,
        error: `Invalid print code format: "${part}". Expected format like "6A2" or "1A3"`,
      };
    }

    const quantity = parseInt(match[1], 10);
    const code = match[2].toUpperCase();

    const price = printPrices[code];
    if (price === undefined) {
      return {
        valid: false,
        prints: [],
        total: 0,
        error: `Unknown print code: "${code}". Available codes: ${Object.keys(printPrices).join(', ')}`,
      };
    }

    const itemTotal = quantity * price;
    prints.push({
      code,
      quantity,
      price,
      total: itemTotal,
    });
    total += itemTotal;
  }

  return {
    valid: true,
    prints,
    total,
  };
}
