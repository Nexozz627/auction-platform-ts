import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { any } from "zod";

//ts for type of req.user.id
interface AuthenticatedRequest extends Request {
    user?: any;
}

const createBid = async (req: AuthenticatedRequest, res: Response) => {
    try{
        // verify it you're autheticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized - you must be logged in" });
        }

        const amount = parseFloat(req.body.amount);

        const id = req.params.id as string;

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: "invalid amount" });
        }

        const item = await prisma.item.findUnique({where : { id }});

        if(!item){
            return res
                .status(404)
                .json({error: "Item not found"}); 
        }

        if(item.createdBy == req.user.id){
            return res 
                .status(400)
                .json({error: "You cannot bid on your own item"});
        }

        if(amount <= item.currentPrice){
            return res
                .status(400)
                .json({error: `Bid amount must be greater than $${item.currentPrice}`});
        }

        if(new Date(item.endTime) <= new Date()){
            return res
                .status(400)
                .json({error: "This auction has ended"});
        }

        const userId = req.user.id;

        //all or nothing executed in this bloc to eliminate race condition between bidders
        const result = await prisma.$transaction(async (tx) => {

            //item still exists
            const currentItem: any = await tx.item.findUnique({ 
                where: { id } 
            });

            // validation
            if (amount <= currentItem.currentPrice) {
                throw new Error("A higher bid has been placed in the meantime.");
            }

            // Invalidate all previous bids in the bid table
            await tx.bid.updateMany({
                where: { itemId: id, isValid: true },
                data: { isValid: false }
            });

            // Create new bid
            const bid = await tx.bid.create({
                data: { userId, itemId: item.id, amount, isValid: true }
            });

            // Update item with new highest bid
            await tx.item.update({
                where: { id },
                data: { currentPrice: amount, highestBidId: bid.id }
            });

            return bid;
        });

        res.status(201).json({
            status: "bid created",
            bid:{
                amount: amount,
            },
        })

    }catch (error: any) {
        if (error.message === "A higher bid has been placed in the meantime.") {
            return res.status(400).json({ error: "A higher bid has been placed. Please try again." });
        }
        return res.status(500).json({ error: "Server error placing bid", details: error.message });
    }
};

export { createBid };
