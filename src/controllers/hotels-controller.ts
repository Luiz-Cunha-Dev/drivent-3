import hotelService from "@/services/hotels-service";
import { Request, Response } from "express";
import httpStatus from "http-status";


export async function getHotels(req: Request, res: Response) {

  const userId: number = res.locals.userId;

  try {
    const hotels = await hotelService.getHotels(userId)

    res.status(httpStatus.OK).send(hotels);

  } catch (error) {
    if(error.name === "NOT_FOUND"){
      return res.status(httpStatus.NOT_FOUND).send(error);   
    }
    if(error.name === "PAYMENT_REQUIRED"){
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error);   
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}

export async function getHotelbyId(req: Request, res: Response) {

  const {hotelId} = req.params;
  const userId: number = res.locals.userId;

  try {
    const hotels = await hotelService.getHotelbyId(Number(hotelId), userId)

    res.status(httpStatus.OK).send(hotels);

  } catch (error) {
    if(error.name === "NOT_FOUND"){
      return res.status(httpStatus.NOT_FOUND).send(error);   
    }
    if(error.name === "PAYMENT_REQUIRED"){
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error);   
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}
