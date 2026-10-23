import * as db from './db.js';

/** Release inventory once when a customer Bot order passes its confirmation deadline. */
export const expireBotReservations = async () => db.transaction(async () => {
    const expired = await db.query(
        `SELECT id FROM orders
         WHERE bot_reservation_expires_at IS NOT NULL AND bot_reservation_expires_at <= CURRENT_TIMESTAMP
           AND status = 'pending'`);
    for (const { id } of expired) {
        const changed = await db.run(
            `UPDATE orders SET status = 'cancelled', bot_reservation_expires_at = NULL
             WHERE id = ? AND status = 'pending' AND bot_reservation_expires_at <= CURRENT_TIMESTAMP`, [id]);
        if (changed.changes !== 1) continue;
        const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
            await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
            await db.run(
                `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                 VALUES (?, 'return', ?, 'order', ?, NULL, 'Tự giải phóng hàng: đơn bot quá hạn xác nhận')`,
                [item.product_id, item.quantity, id]);
        }
    }
    return expired.length;
});
