import { Request, Response } from "express";
import { prisma } from "../config/db.js";

interface AuthenticatedRequest extends Request {
    user?: any;
}

const create = async (req: AuthenticatedRequest, res: Response) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized - you must be logged in" });
        }

        const { title, category, endTime, startingPrice, description} = req.body;

        const userId = req.user.id;

        const item = await prisma.item.create({
            data:{
                title,
                category,
                endTime,
                startingPrice,
                currentPrice: startingPrice,
                description,
                createdBy: userId,
            },
        });

        res.status(201).json({
            status: "created ",
            item:{
                title: title,
                createdBy: item.createdBy
            },
        })
    } catch (error) {
        console.error("Create item error:", error);
        res.status(500).json({ error: "Server error creating item" });
    }
}

const select = async (req: Request, res: Response) => {
    try {
        const id  = req.params.id as string;

        const item = await prisma.item.findUnique({where : { id }});

        if(!item){
            return res
                .status(404)
                .json({error: "Item not found"}); 
        }

        res.status(200).json({
            status: "Item found",
            item:{
                id: item.id ,
                title: item.title,
            },
        })
    } catch (error) {
        console.error("Select item error:", error);
        res.status(500).json({ error: "Server error retrieving item" });
    }
}

const getActiveItems = async (req: Request, res: Response) => {
    try {

        const activeItems = await prisma.item.findMany({
            where : {endTime: { gt: new Date() } },
            orderBy : { createdAt: 'desc'}
        });

        res.status(200).json(activeItems);

    } catch(error){
        return res.status(500).json({ 
            error: error 
        });
    }
}

export { create, select, getActiveItems };