import hotelRepository from "@/repositories/hotel-repository";

export async function getHotels(userId: number) {

    const enrollment = await hotelRepository.findEnrollmentById(userId)

    if(!enrollment){
      throw {name: "NOT_FOUND", message: "No enrollment"}
    }

    const ticket = await hotelRepository.findTicketByEnrollmentId(enrollment.id)

    if(!ticket){
      throw {name: "NOT_FOUND", message: "No ticket"}
    }

    if(ticket.status !== "PAID"){
      throw {name: "PAYMENT_REQUIRED", message: "Ticket is not paid"}
    }

    const ticketType = await hotelRepository.findTicketTypeById(ticket.ticketTypeId)

    if(ticketType.isRemote === true || ticketType.includesHotel === false){
      throw {name: "PAYMENT_REQUIRED", message: "This type of ticket does not include hotel"}
    }

    const hotels = await hotelRepository.findManyHotels()
    
    if(!hotels || hotels.length === 0){
      throw {name: "NOT_FOUND", message: "No hotels"}
    }

    return hotels;
}

export async function getHotelbyId(hotelId: number, userId: number) {

  const enrollment = await hotelRepository.findEnrollmentById(userId)

  if(!enrollment){
    throw {name: "NOT_FOUND", message: "No enrollment"}
  }

  const ticket = await hotelRepository.findTicketByEnrollmentId(enrollment.id)

  if(!ticket){
    throw {name: "NOT_FOUND", message: "No ticket"}
  }

  if(ticket.status !== "PAID"){
    throw {name: "PAYMENT_REQUIRED", message: "Ticket is not paid"}
  }

  const ticketType = await hotelRepository.findTicketTypeById(ticket.ticketTypeId)

  if(ticketType.isRemote === true || ticketType.includesHotel === false){
    throw {name: "PAYMENT_REQUIRED", message: "This type of ticket does not include hotel"}
  }
  
  const hotel = await hotelRepository.findHotelById(Number(hotelId))

    if(!hotel){
      throw {name: "NOT_FOUND", message:"This hotelId does not exist"}
    }

    return hotel;

}



const hotelService = {
  getHotels,
  getHotelbyId
};

export default hotelService;
