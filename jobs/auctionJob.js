import cron from "node-cron";
import { prisma } from "../src/config/db.js";
import { Status } from "@prisma/client";

const startAuctionCron = () => {
    cron.schedule ("*/10 * * * * *", async () =>{
        try {
            const result = await prisma.item.updateMany({
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

            

            if (result.count > 0) {
                const items = await prisma.item.findMany({
                    where:{ status: "CLOSED" },
                    include:{ 
                        highestBid : {
                            include : {
                                user : true
                            }
                        }
                    }
                });

                for (const item of items ){

                const winnerExists = item.highestBid?.user?.username; 

                if(winnerExists){
                    console.log(`${item.highestBid.user.username} is the winner of ${item.title} `)
                }else{
                    console.log(`${item.title} didn't sell`)
                }

                }

                


                console.log(`🤖 [CRON] Success: ${result.count} expired auction(s) closed.`);
            }
        } catch (error) {
            console.error("❌ [CRON] Error closing auctions:", error);
        }
    });
};

export { startAuctionCron };