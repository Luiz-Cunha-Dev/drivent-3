import { prisma } from "@/config";

async function findManyHotels() {
  const data = await prisma.hotel.findMany();
  return data;
}

async function findHotelById(id: number) {
  const data = await prisma.hotel.findUnique({
    where:{id},
    include:{
      Rooms:true
    }
  })
  return data;
}

async function findEnrollmentById(userId: number) {
  const data = await prisma.enrollment.findUnique({
    where:{userId}
  })
  return data;
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  const data = await prisma.ticket.findFirst({
    where:{enrollmentId}
  })
  return data;
}

async function findTicketTypeById(id: number) {
  const data = await prisma.ticketType.findFirst({
    where:{id}
  })
  return data;
}

const hotelRepository = {
  findManyHotels,
  findHotelById,
  findEnrollmentById,
  findTicketByEnrollmentId,
  findTicketTypeById
};

export default hotelRepository;
