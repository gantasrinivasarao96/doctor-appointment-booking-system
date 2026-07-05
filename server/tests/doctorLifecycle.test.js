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
// Doctor Lifecycle Integration Tests
// ======================================
describe(
  "Doctor Application Lifecycle",
  () => {
    let applicant;
    let admin;

    let applicantToken;
    let adminToken;


    const applicationData = {
      fullName:
        "Dr Lifecycle Test",

      phone:
        "9876543210",

      email:
        "lifecycle.doctor@example.com",

      specialization:
        "General Medicine",

      experience:
        "5 years",

      fees: 500,

      address:
        "Test Address",

      slotDuration: 30,

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
        {
          day: "Wednesday",
          enabled: true,
          sessions: [
            {
              startTime: "14:00",
              endTime: "17:00",
            },
          ],
        },
      ],

      blockedDates: [],
    };


    beforeEach(async () => {
      await Appointment.deleteMany({});
      await Doctor.deleteMany({});
      await User.deleteMany({});


      const password =
        await bcrypt.hash(
          "password123",
          10
        );


      applicant =
        await User.create({
          name:
            "Doctor Applicant",

          email:
            "applicant@example.com",

          password,

          phone:
            "9876543210",
        });


      admin =
        await User.create({
          name:
            "Admin User",

          email:
            "admin.lifecycle@example.com",

          password,

          phone:
            "9876543211",

          isAdmin: true,
        });


      applicantToken =
        generateToken(
          applicant._id
        );

      adminToken =
        generateToken(
          admin._id
        );
    });


    // ==================================
    // Initial Application
    // ==================================
    test(
      "allows a user to submit a doctor application",
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
            .send(applicationData);


        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.doctor.status
        ).toBe("pending");


        const doctor =
          await Doctor.findOne({
            userId: applicant._id,
          });


        expect(
          doctor
        ).not.toBeNull();

        expect(
          doctor.status
        ).toBe("pending");

        expect(
          doctor.weeklyAvailability
        ).toHaveLength(7);
      }
    );


    // ==================================
    // Duplicate Pending Application
    // ==================================
    test(
      "blocks another application while review is pending",
      async () => {
        const firstResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        expect(
          firstResponse.status
        ).toBe(201);


        const secondResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        expect(
          secondResponse.status
        ).toBe(400);

        expect(
          secondResponse.body.message
        ).toBe(
          "Your doctor application is already pending admin review."
        );


        const count =
          await Doctor.countDocuments({
            userId: applicant._id,
          });


        expect(count).toBe(1);
      }
    );


    // ==================================
    // Approval
    // ==================================
    test(
      "allows an admin to approve a pending application and grants doctor role",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const approveResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          approveResponse.status
        ).toBe(200);

        expect(
          approveResponse.body
        ).toEqual({
          success: true,
          message:
            "Doctor approved successfully.",
        });


        const updatedDoctor =
          await Doctor.findById(
            doctorId
          );


        const updatedUser =
          await User.findById(
            applicant._id
          );


        expect(
          updatedDoctor.status
        ).toBe("approved");

        expect(
          updatedUser.isDoctor
        ).toBe(true);
      }
    );


    // ==================================
    // Approved Application Transition
    // ==================================
    test(
      "blocks approving an already approved application",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const firstApproval =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          firstApproval.status
        ).toBe(200);


        const secondApproval =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          secondApproval.status
        ).toBe(409);

        expect(
          secondApproval.body.message
        ).toBe(
          "Cannot approve doctor application from approved status."
        );
      }
    );


    // ==================================
    // Rejection
    // ==================================
    test(
      "allows an admin to reject a pending application",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const rejectResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/reject/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          rejectResponse.status
        ).toBe(200);

        expect(
          rejectResponse.body
        ).toEqual({
          success: true,
          message:
            "Doctor rejected successfully.",
        });


        const updatedDoctor =
          await Doctor.findById(
            doctorId
          );


        const updatedUser =
          await User.findById(
            applicant._id
          );


        expect(
          updatedDoctor.status
        ).toBe("rejected");

        expect(
          updatedUser.isDoctor
        ).toBe(false);
      }
    );


    // ==================================
    // Reapplication
    // ==================================
    test(
      "allows a rejected applicant to reapply without creating another doctor record",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const rejectResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/reject/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          rejectResponse.status
        ).toBe(200);


        const updatedApplication = {
          ...applicationData,

          fees: 750,

          experience:
            "6 years",

          address:
            "Updated Test Address",
        };


        const reapplyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(updatedApplication);


        expect(
          reapplyResponse.status
        ).toBe(200);

        expect(
          reapplyResponse.body.success
        ).toBe(true);

        expect(
          reapplyResponse.body.doctor.status
        ).toBe("pending");


        const doctors =
          await Doctor.find({
            userId: applicant._id,
          });


        expect(
          doctors
        ).toHaveLength(1);

        expect(
          doctors[0]._id.toString()
        ).toBe(doctorId);

        expect(
          doctors[0].status
        ).toBe("pending");

        expect(
          doctors[0].fees
        ).toBe(750);

        expect(
          doctors[0].experience
        ).toBe("6 years");

        expect(
          doctors[0].address
        ).toBe(
          "Updated Test Address"
        );
      }
    );


    // ==================================
    // Approved Doctor Cannot Reapply
    // ==================================
    test(
      "blocks an approved doctor from submitting another application",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const approveResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          approveResponse.status
        ).toBe(200);


        const reapplyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        expect(
          reapplyResponse.status
        ).toBe(400);

        expect(
          reapplyResponse.body.message
        ).toBe(
          "You are already an approved doctor. Update your profile from the doctor dashboard."
        );
      }
    );


    // ==================================
    // Invalid Cross Transition
    // ==================================
    test(
      "blocks rejecting an already approved doctor application",
      async () => {
        const applyResponse =
          await request(app)
            .post(
              "/api/v1/doctor/apply"
            )
            .set(
              "Authorization",
              `Bearer ${applicantToken}`
            )
            .send(applicationData);


        const doctorId =
          applyResponse.body.doctor._id;


        const approveResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/approve/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          approveResponse.status
        ).toBe(200);


        const rejectResponse =
          await request(app)
            .put(
              `/api/v1/admin/doctors/reject/${doctorId}`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );


        expect(
          rejectResponse.status
        ).toBe(409);

        expect(
          rejectResponse.body.message
        ).toBe(
          "Cannot reject doctor application from approved status."
        );
      }
    );
  }
);
