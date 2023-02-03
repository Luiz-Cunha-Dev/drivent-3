import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotelbyId, getHotels } from "@/controllers/hotels-controller";


const hotelsRouter = Router();

hotelsRouter
    .all("/*", authenticateToken)
    .get("/", getHotels)
    .get("/:hotelId", getHotelbyId);

export { hotelsRouter };
