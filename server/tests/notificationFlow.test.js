const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../app");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require(
  "../models/Appointment"
);
const Notification = require(
  "../models/Notification"
);

const generateToken = require(
  "../utils/generateToken"
);


// ======================================
// Notification Flow Integration Tests
// ======================================
describe(
  "Notification Flow API",
  () => {
    let patient;
    let doctorUser;
    let admin;
    let applicant;

    let doctor;

    let patientToken;
    let doctorToken;
    let adminToken;
    let applicantToken;


    beforeEach(async () => {
      await Notification.deleteMany({});
      await Appointment.deleteMany({});
      await Doctor.deleteMany({});
      await User.deleteMany({});


      const password =
        await bcrypt.hash(
          "password123",
          10
        );


      patient = await User.create({
        name: "Notification Patient",
        email:
          "notification.patient@example.com",
        password,
        phone: "9876543210",
      });


      doctorUser = await User.create({
        name: "Notification Doctor",
        email:
          "notification.doctor@example.com",
        password,
        phone: "9876543211",
        isDoctor: true,
      });


      admin = await User.create({
        name: "Notification Admin",
        email:
          "notification.admin@example.com",
        password,
        phone: "9876543212",
        isAdmin: true,
      });


      applicant = await User.create({
        name: "Doctor Applicant",
        email:
          "notification.applicant@example.com",
        password,
        phone: "9876543213",
      });


      doctor = await Doctor.create({
        userId: doctorUser._id,

        fullName:
          "Dr Notification Test",

        phone: "9876543211",

        email:
          "notification.doctor@example.com",

        specialization:
          "General Medicine",

        experience: "5 years",

        fees: 500,

        address: "Test Address",

        weeklyAvailability: [
          {
            day: "Monday",
            enabled: true,
            sessions: [
              {
                startTime: "09:00",
                endTime: "12:00",
              },
            ],
          },
        ],

        slotDuration: 30,

        blockedDates: [],

        timings: [],

        status: "approved",
      });


      patientToken =
        generateToken(patient._id);

      doctorToken =
        generateToken(doctorUser._id);

      adminToken =
        generateToken(admin._id);

      applicantToken =
        generateToken(applicant._id);
    });


    // ==================================
    // Authentication Protection
    // ==================================
    test(
      "rejects unauthenticated notification access",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/v1/notification"
            );


        expect(response.status).toBe(401);

        expect(
          response.body.success
        ).toBe(false);
      }
    );


    // ==================================
    // Get Notifications + Unread Count
    // ==================================
    test(
      "returns only logged-in user's notifications and correct unread count",
      async () => {
        await Notification.create([
          {
            userId: patient._id,
            message:
              "Patient unread notification",
            read: false,
          },
          {
            userId: patient._id,
            message:
              "Patient read notification",
            read: true,
          },
          {
            userId: doctorUser._id,
            message:
              "Doctor notification",
            read: false,
          },
        ]);


        const response =
          await request(app)
            .get(
              "/api/v1/notification"
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.total
        ).toBe(2);

        expect(
          response.body.unreadCount
        ).toBe(1);

        expect(
          response.body.notifications
        ).toHaveLength(2);

        expect(
          response.body.notifications.every(
            (notification) =>
              notification.userId ===
              String(patient._id)
          )
        ).toBe(true);
      }
    );


    // ==================================
    // Mark One Read
    // ==================================
    test(
      "marks owned notification as read",
      async () => {
        const notification =
          await Notification.create({
            userId: patient._id,
            message:
              "Unread notification",
          });


        const response =
          await request(app)
            .put(
              `/api/v1/notification/${notification._id}/read`
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(200);

        expect(
          response.body.notification.read
        ).toBe(true);


        const saved =
          await Notification.findById(
            notification._id
          );


        expect(saved.read).toBe(true);
      }
    );


    // ==================================
    // Ownership Protection
    // ==================================
    test(
      "cannot mark another user's notification as read",
      async () => {
        const notification =
          await Notification.create({
            userId: doctorUser._id,
            message:
              "Private doctor notification",
          });


        const response =
          await request(app)
            .put(
              `/api/v1/notification/${notification._id}/read`
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(404);


        const saved =
          await Notification.findById(
            notification._id
          );


        expect(saved.read).toBe(false);
      }
    );


    // ==================================
    // Mark All Read
    // ==================================
    test(
      "marks only logged-in user's notifications as read",
      async () => {
        await Notification.create([
          {
            userId: patient._id,
            message: "Patient one",
          },
          {
            userId: patient._id,
            message: "Patient two",
          },
          {
            userId: doctorUser._id,
            message: "Doctor one",
          },
        ]);


        const response =
          await request(app)
            .put(
              "/api/v1/notification/read-all"
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(200);

        expect(
          response.body.modifiedCount
        ).toBe(2);


        const patientUnread =
          await Notification.countDocuments({
            userId: patient._id,
            read: false,
          });


        const doctorUnread =
          await Notification.countDocuments({
            userId: doctorUser._id,
            read: false,
          });


        expect(patientUnread).toBe(0);
        expect(doctorUnread).toBe(1);
      }
    );


    // ==================================
    // Delete One
    // ==================================
    test(
      "deletes owned notification",
      async () => {
        const notification =
          await Notification.create({
            userId: patient._id,
            message:
              "Delete this notification",
          });


        const response =
          await request(app)
            .delete(
              `/api/v1/notification/${notification._id}`
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(200);


        const saved =
          await Notification.findById(
            notification._id
          );


        expect(saved).toBeNull();
      }
    );


    test(
      "cannot delete another user's notification",
      async () => {
        const notification =
          await Notification.create({
            userId: doctorUser._id,
            message:
              "Doctor private notification",
          });


        const response =
          await request(app)
            .delete(
              `/api/v1/notification/${notification._id}`
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(404);


        const saved =
          await Notification.findById(
            notification._id
          );


        expect(saved).not.toBeNull();
      }
    );


    // ==================================
    // Delete All
    // ==================================
    test(
      "deletes only logged-in user's notifications",
      async () => {
        await Notification.create([
          {
            userId: patient._id,
            message: "Patient one",
          },
          {
            userId: patient._id,
            message: "Patient two",
          },
          {
            userId: doctorUser._id,
            message: "Doctor one",
          },
        ]);


        const response =
          await request(app)
            .delete(
              "/api/v1/notification"
            )
            .set(
              "Authorization",
              `Bearer ${patientToken}`
            );


        expect(response.status).toBe(200);

        expect(
          response.body.deletedCount
        ).toBe(2);


        const patientCount =
          await Notification.countDocuments({
            userId: patient._id,
          });


        const doctorCount =
          await Notification.countDocuments({
            userId: doctorUser._id,
          });


        expect(patientCount).toBe(0);
        expect(doctorCount).toBe(1);
      }
    );


    // ==================================
    // Doctor Application Event
    // ==================================
    test(
      "doctor application creates admin notification",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send({
              fullName:
                "Dr Applicant Test",

              phone: "9876543213",

              email:
                "notification.applicant@example.com",

              specialization:
                "Cardiology",

              experience: "4 years",

              fees: 600,

              address:
                "Applicant Test Address",

              slotDuration: 30,

              weeklyAvailability: [
                {
                  day: "Tuesday",
                  enabled: true,
                  sessions: [
                    {
                      startTime: "10:00",
                      endTime: "13:00",
                    },
                  ],
                },
              ],

              blockedDates: [],
            });


        expect(response.status).toBe(201);


        const notification =
          await Notification.findOne({
            userId: admin._id,
          });


        expect(notification).not.toBeNull();

        expect(notification.message).toContain(
          "New doctor application submitted"
        );
      }
    );


    // ==================================
    // Doctor Approval Event
    // ==================================
    test(
      "doctor approval creates applicant notification",
      async () => {
        const application =
          await Doctor.create({
            userId: applicant._id,

            fullName:
              "Dr Approval Test",

            phone: "9876543213",

            email:
              "notification.applicant@example.com",

            specialization:
              "Dermatology",

            experience: "3 years",

            fees: 400,

            address:
              "Approval Test Address",

            weeklyAvailability: [
              {
                day: "Tuesday",
                enabled: true,
                sessions: [
                  {
                    startTime: "10:00",
                    endTime: "12:00",
                  },
                ],
              },
            ],

            slotDuration: 30,

            blockedDates: [],

            timings: [],

            status: "pending",
          });


        const response =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${application._id}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(response.status).toBe(200);


        const notification =
          await Notification.findOne({
            userId: applicant._id,
          });


        expect(notification).not.toBeNull();

        expect(notification.message).toBe(
          "Your doctor application has been approved."
        );
      }
    );


    // ==================================
    // Doctor Rejection Event
    // ==================================
    test(
      "doctor rejection creates applicant notification",
      async () => {
        const application =
          await Doctor.create({
            userId: applicant._id,

            fullName:
              "Dr Rejection Test",

            phone: "9876543213",

            email:
              "notification.applicant@example.com",

            specialization:
              "Neurology",

            experience: "2 years",

            fees: 450,

            address:
              "Rejection Test Address",

            weeklyAvailability: [
              {
                day: "Wednesday",
                enabled: true,
                sessions: [
                  {
                    startTime: "11:00",
                    endTime: "13:00",
                  },
                ],
              },
            ],

            slotDuration: 30,

            blockedDates: [],

            timings: [],

            status: "pending",
          });


        const response =
          await request(app)
            .put(
              `/api/v1/admin/doctors/reject/${application._id}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(response.status).toBe(200);


        const notification =
          await Notification.findOne({
            userId: applicant._id,
          });


        expect(notification).not.toBeNull();

        expect(notification.message).toBe(
          "Your doctor application has been rejected."
        );
      }
    );


    // ==================================
    // Appointment Status Event
    // ==================================
    test(
      "appointment status update creates patient notification",
      async () => {
        const appointment =
          await Appointment.create({
            userId: patient._id,
            doctorId: doctor._id,
            appointmentDate:
              "2099-01-05",
            appointmentTime:
              "09:00",
            status: "Pending",
          });


        const response =
          await request(app)
            .put(
              `/api/v1/appointment/update/${appointment._id}`
            )
            .set(
              "Authorization",
              `Bearer ${doctorToken}`
            )
            .send({
              status: "Approved",
            });


        expect(response.status).toBe(200);


        const notification =
          await Notification.findOne({
            userId: patient._id,
          });


        expect(notification).not.toBeNull();

        expect(notification.message).toContain(
          "is now Approved"
        );
      }
    );
  }
);
