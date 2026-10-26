import cron from 'node-cron'
import ordersModel from '../MongoDB/Models/orders.js'
import screeningModel from '../MongoDB/Models/screening.js'

export const cronJobs = () =>{
    //  חמש כוכביות אומרות שהפונקציה תרוץ כל דקה בדיוק
    cron.schedule('* * * * *', async () => {
        try {
            // חישוב הזמן של לפני 10 דקות
            const tenMinutesAgo = new Date(Date.now() - 10 * 60000);

            //  חיפוש הזמנות שהן עדיין ב-Pending 
            // והזמן שעבר מאז היצירה שלהן גדול מ-10 דקות
            // שימוש בשדה purchaseDate שהוגדר בסכמה של ההזמנות
            const expiredOrders = await ordersModel.find({
                status: 'Pending',
                purchaseDate: { $lt: tenMinutesAgo }
            });

            // אם נמצאו הזמנות כאלו, נשחרר את המושבים
            if (expiredOrders.length > 0) {
                console.log(`[Cron Job] Found ${expiredOrders.length} expired orders. Releasing seats...`);

                for (let order of expiredOrders) {
                    // עדכון סטטוס ההזמנה לביטול
                    order.status = 'Cancelled';
                    await order.save();

                    // משיכת המושבים החוצה ממערך התפוסים בהקרנה הרלוונטית
                    await screeningModel.findByIdAndUpdate(order.screeningId, {
                        $pull: { bookedSeats: { $in: order.seats } }
                    });
                    
                    console.log(`[Cron Job] Order ${order._id} cancelled. Seats released.`);
                }
            }
        } catch (err) {
            console.error("[Cron Job] Error:", err.message);
        }
    });
    
    console.log("[System] Cron jobs initialized successfully.");
};
