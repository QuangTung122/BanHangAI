import { query, run } from './src/services/db.js';

async function fixInvoiceIds() {
    try {
        const trans = await query("SELECT id, reference_id FROM transactions WHERE source = 'auto' AND reference_id IS NOT NULL");
        for (let t of trans) {
            const orderRes = await query("SELECT created_at FROM orders WHERE id = ?", [t.reference_id]);
            if (orderRes.length > 0) {
                const dateStr = orderRes[0].created_at;
                const date = new Date(dateStr.includes('Z') ? dateStr : dateStr + 'Z');
                const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
                const invoiceCode = `INV-${yymmdd}-${String(t.reference_id).padStart(4, '0')}`;
                await run("UPDATE transactions SET invoice_id = ? WHERE id = ?", [invoiceCode, t.id]);
            }
        }
        console.log("Fixed invoice_ids in transactions.");
    } catch (e) {
        console.error(e);
    }
}
fixInvoiceIds();
