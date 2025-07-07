/**
 * Currency formatting utilities
 */

/**
 * Format amount as Nigerian Naira (NGN)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the ₦ symbol (default: true)
 * @param showCode - Whether to show "NGN" code (default: false)
 * @returns Formatted currency string
 */
export const formatNGN = (
    amount: number | string,
    showSymbol: boolean = true,
    showCode: boolean = false
): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle invalid numbers
    if (isNaN(numAmount)) {
        return showSymbol ? '₦0' : '0';
    }

    // Format with commas for thousands
    const formatted = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numAmount);

    // Build the result string
    let result = '';
    if (showSymbol) {
        result += '₦';
    }
    result += formatted;
    if (showCode) {
        result += ' NGN';
    }

    return result;
};

/**
 * Format amount as Nigerian Naira with symbol only
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol
 */
export const formatNaira = (amount: number | string): string => {
    return formatNGN(amount, true, false);
};

/**
 * Format amount as Nigerian Naira with code only
 * @param amount - The amount to format
 * @returns Formatted currency string with NGN code
 */
export const formatNGNCode = (amount: number | string): string => {
    return formatNGN(amount, false, true);
};

/**
 * Format amount as Nigerian Naira with both symbol and code
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol and NGN code
 */
export const formatNGNFull = (amount: number | string): string => {
    return formatNGN(amount, true, true);
};
