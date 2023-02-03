import app, { init } from "@/app";
import { prisma } from "@/config";
import supertest from "supertest";
import { cleanDb } from "../helpers";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  
  beforeAll(async() => {
    await prisma.event.create({
      data:{
        title:"evento 1",
        backgroundImageUrl: "http://loremflickr.com/640/480",
        logoImageUrl: "http://loremflickr.com/640/480",
        startsAt: "2023-02-01T16:58:12.468Z",
        endsAt: "2023-02-07T16:58:12.469Z"
    }
    })
    await prisma.room.deleteMany({})
    await prisma.hotel.deleteMany({})


    await prisma.hotel.createMany({
      data:[
        {
          "name": "hotel 1",
          "image": "https://thumbs.dreamstime.com/b/hotel-de-luxo-2-488094.jpg",
        },
        {
          "name": "hotel 2",
          "image": "https://thumbs.dreamstime.com/b/hotel-de-luxo-2-488094.jpg",
        }
      ]
    })

  })

  it('should respond with status 401 when does not has Authorization', async () => {
    const result = await server.get("/hotels")
    expect(result.status).toBe(401)
});

it('should respond with status 401 when does not has token', async () => {
  const result = await server.get("/hotels").set({Authorization: "Bearer XXXXXXXXXX"})
  expect(result.status).toBe(401)
});

let token: string;
let userId: number;

it('should respond with status 404 when user does not has enrollment', async () => {
  const signup = await server.post("/users").send({email: "teste@teste.com", password: "123456"})
  expect(signup.status).toBe(201)

  const signin = await server.post("/auth/sign-in").send({email: "teste@teste.com", password: "123456"})
  expect(signin.status).toBe(200)

  token = signin.body.token;
  userId = signin.body.user.id;

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}` })
  expect(result.status).toBe(404)
});

let enrollmentId: number;

it('should respond with status 404 when user does not has ticket', async () => {
  const enrollment = await prisma.enrollment.create({
    data:{
      name: "teste",
      cpf: "99999999999",
      birthday: "1999-01-01T00:00:00.000Z",
      phone:"99999999999",
      userId
    }
  })

  enrollmentId = enrollment.id

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(404)
  
});

it('should respond with status 402 when the ticket was not paid', async () => {
  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: true,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "RESERVED"
    }
  })

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 402 when the ticket type is remote', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: true,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 402 when the ticket type does not include hotel', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: false,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 200 when all is ok', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: false,
      includesHotel:true
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })

  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(200)
  expect(result.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    ])
  )
  
});

it('should respond with status 404 when does not has hotels', async () => {
  await prisma.room.deleteMany()
  await prisma.hotel.deleteMany()


  const result = await server.get("/hotels").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(404)

});

})


describe("GET /hotels/:hotelId", () => {

  beforeAll(async() => {
    await cleanDb();
    await prisma.event.create({
      data:{
        title:"evento 1",
        backgroundImageUrl: "http://loremflickr.com/640/480",
        logoImageUrl: "http://loremflickr.com/640/480",
        startsAt: "2023-02-01T16:58:12.468Z",
        endsAt: "2023-02-07T16:58:12.469Z"
    }
    })
    await prisma.room.deleteMany({})
    await prisma.hotel.deleteMany({})


    await prisma.hotel.createMany({
      data:[
        {
          "name": "hotel 1",
          "image": "https://thumbs.dreamstime.com/b/hotel-de-luxo-2-488094.jpg",
        },
        {
          "name": "hotel 2",
          "image": "https://thumbs.dreamstime.com/b/hotel-de-luxo-2-488094.jpg",
        }
      ]
    })

     const hotels = await prisma.hotel.findMany()

      await prisma.room.createMany({
        data:[
          {
            name: "quarto n°1",
            capacity: 4,
            hotelId: hotels[0].id,
          },
          {
            name: "quarto n°2",
            capacity: 3,
            hotelId: hotels[0].id,
          },
          {
            name: "quarto n°1",
            capacity: 2,
            hotelId: hotels[1].id,
          }
        ]
      })

  })

  it('should respond with status 401 when does not has Authorization', async () => {
    const result = await server.get("/hotels/1")
    expect(result.status).toBe(401)
});

it('should respond with status 401 when does not has token', async () => {
  const result = await server.get("/hotels/1").set({Authorization: "Bearer XXXXXXXXXX"})
  expect(result.status).toBe(401)
});

let token: string;
let userId: number;

it('should respond with status 404 when user does not has enrollment', async () => {
  const signup = await server.post("/users").send({email: "teste@teste.com", password: "123456"})
  expect(signup.status).toBe(201)

  const signin = await server.post("/auth/sign-in").send({email: "teste@teste.com", password: "123456"})
  expect(signin.status).toBe(200)

  token = signin.body.token;
  userId = signin.body.user.id;

  const result = await server.get("/hotels/1").set({ Authorization: `Bearer ${token}` })
  expect(result.status).toBe(404)
});

let enrollmentId: number;

it('should respond with status 404 when user does not has ticket', async () => {
  const enrollment = await prisma.enrollment.create({
    data:{
      name: "teste",
      cpf: "99999999999",
      birthday: "1999-01-01T00:00:00.000Z",
      phone:"99999999999",
      userId
    }
  })

  enrollmentId = enrollment.id

  const result = await server.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(404)
  
});

it('should respond with status 402 when the ticket was not paid', async () => {
  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: true,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "RESERVED"
    }
  })

  const result = await server.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 402 when the ticket type is remote', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: true,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })

  const result = await server.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 402 when the ticket type does not include hotel', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: false,
      includesHotel:false
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })

  const result = await server.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(402)
  
});

it('should respond with status 200 when all is ok', async () => {
  await prisma.ticket.deleteMany()
  await prisma.ticketType.deleteMany()

  const ticketType = await prisma.ticketType.create({
    data:{
      name: "teste",
      price: 150,
      isRemote: false,
      includesHotel:true
    }
  })

  await prisma.ticket.create({
    data:{
      ticketTypeId: ticketType.id,
      enrollmentId,
      status: "PAID"
    }
  })
  const hotels = await prisma.hotel.findMany()

  const result = await server.get(`/hotels/${hotels[0].id}`).set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(200)
  
  expect(result.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.arrayContaining([
          expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        capacity: expect.any(Number),
        hotelId: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
          })
        ])
      })
  )
  
});

it('should respond with status 404 when the hotel not exist', async () => {
  await prisma.room.deleteMany()
  await prisma.hotel.deleteMany()

  const result = await server.get("/hotels/0").set({ Authorization: `Bearer ${token}`})
  expect(result.status).toBe(404)

});

})