import cron from "node-cron";
import { prisma } from "../config/db.js";

const startAuctionCron = () => {
    //runs every 10s
    cron.schedule ("*/10 * * * * *", async () =>{
        try {

            //if expired we switch the item to closed status
            await prisma.item.updateMany({
                where: {
                    endTime:{
                        lte: new Date()
                    },
                    status: "ACTIVE"
                },
                    data:{
                        status: "CLOSED"     
                    }   
            });


            //check if there are closed (expired) items in the table
            const items = await prisma.item.findMany({
            where: { status: "CLOSED" },
            include: { highestBid: { include: { user: true } } }
            });

            
            //executes there is closed items
            if (items.length > 0) {
                for (const item of items ){

                //check if someone made a bid on the item (highestBid) or else this const will be undefined
                const winnerUsername = item.highestBid?.user?.username; 

                if(winnerUsername){
                    console.log(`${winnerUsername} is the winner of ${item.title} `)
                }else{
                    console.log(`${item.title} didn't sell`)
                }

            
                //we switch to the final state completed after finding the winner (or not)
                await prisma.item.update({
                        where: { id: item.id },
                        data: { status: "COMPLETED" }
                });

                }

                console.log(`🤖 [CRON] Success: ${items.length} expired auction(s) closed.`);
            }
        } catch (error) {
            console.error("❌ [CRON] Error closing auctions:", error);
        }
    });
};

export { startAuctionCron };