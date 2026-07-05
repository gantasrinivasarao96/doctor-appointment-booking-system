const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../app");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require(
  "../models/Appointment"
);
const generateToken = require(
  "../utils/generateToken"
);


// ======================================
// Authorization Integration Tests
// ======================================
describe(
  "Authorization API",
  () => {
    let normalUser;
    let adminUser;
    let doctorUser;

    let normalToken;
    let adminToken;
    let doctorToken;


    beforeEach(async () => {
      await Appointment.deleteMany({});
      await Doctor.deleteMany({});
      await User.deleteMany({});


      const password =
        await bcrypt.hash(
          "password123",
          10
        );


      normalUser =
        await User.create({
          name: "Normal User",
          email:
            "normal@example.com",
          password,
          phone: "9876543210",
        });


      adminUser =
        await User.create({
          name: "Admin User",
          email:
            "admin@example.com",
          password,
          phone: "9876543211",
          isAdmin: true,
        });


      doctorUser =
        await User.create({
          name: "Doctor User",
          email:
            "doctor@example.com",
          password,
          phone: "9876543212",
          isDoctor: true,
        });


      await Doctor.create({
        userId: doctorUser._id,

        fullName:
          "Dr Test Doctor",

        phone:
          "9876543212",

        email:
          "doctor@example.com",

        specialization:
          "General Medicine",

        experience:
          "5 years",

        fees: 500,

        address:
          "Test Address",

        weeklyAvailability: [
          {
            day: "Monday",
            enabled: true,
            sessions: [
              {
                startTime:
                  "09:00",
                endTime:
                  "12:00",
              },
            ],
          },
        ],

        slotDuration: 30,

        status: "approved",
      });


      normalToken =
        generateToken(
          normalUser._id
        );

      adminToken =
        generateToken(
          adminUser._id
        );

      doctorToken =
        generateToken(
          doctorUser._id
        );
    });


    // ==================================
    // Authentication Guard
    // ==================================
    test(
      "rejects protected routes without a token",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/admin/doctors/pending"
            );


        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.success
        ).toBe(false);
      }
    );


    // ==================================
    // Admin Authorization
    // ==================================
    test(
      "denies a normal user access to an admin route",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/admin/doctors/pending"
            )
            .set(
              "Authorization",
              `Bearer ${normalToken}`
            );


        expect(
          response.status
        ).toBe(403);

        expect(
          response.body
        ).toEqual({
          success: false,
          message:
            "Access denied. Admin only.",
        });
      }
    );


    test(
      "allows an admin to access an admin route",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/admin/doctors/pending"
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          Array.isArray(
            response.body.doctors
          )
        ).toBe(true);
      }
    );


    // ==================================
    // Doctor Authorization
    // ==================================
    test(
      "denies a normal user access to a doctor route",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/appointment/doctor"
            )
            .set(
              "Authorization",
              `Bearer ${normalToken}`
            );


        expect(
          response.status
        ).toBe(403);

        expect(
          response.body
        ).toEqual({
          success: false,
          message:
            "Access denied. Doctors only.",
        });
      }
    );


    test(
      "allows an approved doctor to access doctor appointments",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/appointment/doctor"
            )
            .set(
              "Authorization",
              `Bearer ${doctorToken}`
            );


        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.total
        ).toBe(0);

        expect(
          response.body.appointments
        ).toEqual([]);
      }
    );
  }
);
