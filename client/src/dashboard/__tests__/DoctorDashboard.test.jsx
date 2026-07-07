import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import API from "../../services/api";
import DoctorDashboard from "../DoctorDashboard";


const {
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));


vi.mock(
  "react-toastify",
  () => ({
    toast: {
      success: toastSuccessMock,
      error: toastErrorMock,
    },
  })
);


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(),
      put: vi.fn(),
    },
  })
);


vi.mock(
  "../../components/Navbar",
  () => ({
    default: () => <div>Navbar</div>,
  })
);


vi.mock(
  "../../components/Footer",
  () => ({
    default: () => <div>Footer</div>,
  })
);


// ======================================
// Test Data
// ======================================
const doctorProfile = {
  _id: "doctor-1",
  fullName: "Dr Dashboard Test",
  phone: "9876543210",
  email: "doctor@example.com",
  specialization: "Cardiology",
  experience: "8 years",
  fees: 500,
  address: "Test Clinic",
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
  ],

  blockedDates: [
    "2030-01-15",
  ],
};


const initialAppointments = [
  {
    _id: "appointment-pending",
    userId: {
      name: "Pending Patient",
      email: "pending@example.com",
    },
    appointmentDate: "2030-01-07",
    appointmentTime: "09:00",
    status: "Pending",
  },

  {
    _id: "appointment-approved",
    userId: {
      name: "Approved Patient",
      email: "approved@example.com",
    },
    appointmentDate: "2030-01-08",
    appointmentTime: "14:30",
    status: "Approved",
  },

  {
    _id: "appointment-completed",
    userId: {
      name: "Completed Patient",
      email: "completed@example.com",
    },
    appointmentDate: "2030-01-09",
    appointmentTime: "11:00",
    status: "Completed",
  },

  {
    _id: "appointment-rejected",
    userId: {
      name: "Rejected Patient",
      email: "rejected@example.com",
    },
    appointmentDate: "2030-01-10",
    appointmentTime: "16:00",
    status: "Rejected",
  },
];


// ======================================
// API Mock Helpers
// ======================================
const mockDashboardRequests = (
  appointments = initialAppointments
) => {
  API.get.mockImplementation(
    async (url) => {
      if (url === "/doctor/profile") {
        return {
          data: {
            success: true,
            doctor: doctorProfile,
          },
        };
      }

      if (url === "/appointment/doctor") {
        return {
          data: {
            success: true,
            appointments,
          },
        };
      }

      throw new Error(
        `Unexpected GET request: ${url}`
      );
    }
  );
};


// ======================================
// Doctor Dashboard
// ======================================
describe(
  "DoctorDashboard",
  () => {
    beforeEach(() => {
      API.get.mockReset();
      API.put.mockReset();

      toastSuccessMock.mockReset();
      toastErrorMock.mockReset();
    });


    afterEach(() => {
      cleanup();
    });


    test(
      "loads the doctor profile and appointment dashboard",
      async () => {
        mockDashboardRequests();

        render(<DoctorDashboard />);


        expect(
          screen.getByText(
            "Loading appointments..."
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Loading profile..."
          )
        ).toBeInTheDocument();


        expect(
          await screen.findByText(
            "Dr Dashboard Test"
          )
        ).toBeInTheDocument();


        await screen.findByText(
          /Pending Patient/
        );


        expect(API.get).toHaveBeenCalledWith(
          "/doctor/profile"
        );


        expect(API.get).toHaveBeenCalledWith(
          "/appointment/doctor"
        );


        expect(API.get).toHaveBeenCalledTimes(2);


        expect(
          screen.getByText(
            "doctor@example.com"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("Cardiology")
        ).toBeInTheDocument();


        expect(
          screen.getByText("Test Clinic")
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "09:00 AM – 12:00 PM"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("2030-01-15")
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Approved Patient/
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Completed Patient/
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Rejected Patient/
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("02:30 PM")
        ).toBeInTheDocument();


        expect(
          screen.getAllByText("1")
        ).toHaveLength(4);


        expect(
          screen.getByText("4")
        ).toBeInTheDocument();
      }
    );


    test(
      "approves a pending appointment and refreshes the list",
      async () => {
        mockDashboardRequests();

        API.put.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Appointment approved successfully",
          },
        });


        render(<DoctorDashboard />);


        await screen.findByText(
          /Pending Patient/
        );


        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Approve",
            }
          )
        );


        await waitFor(() => {
          expect(API.put).toHaveBeenCalledWith(
            "/appointment/update/appointment-pending",
            {
              status: "Approved",
            }
          );
        });


        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Appointment approved successfully"
        );


        await waitFor(() => {
          expect(API.get).toHaveBeenCalledTimes(3);
        });


        expect(
          API.get
        ).toHaveBeenLastCalledWith(
          "/appointment/doctor"
        );
      }
    );


    test(
      "rejects a pending appointment",
      async () => {
        mockDashboardRequests();

        API.put.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Appointment rejected successfully",
          },
        });


        render(<DoctorDashboard />);


        await screen.findByText(
          /Pending Patient/
        );


        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Reject",
            }
          )
        );


        await waitFor(() => {
          expect(API.put).toHaveBeenCalledWith(
            "/appointment/update/appointment-pending",
            {
              status: "Rejected",
            }
          );
        });


        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Appointment rejected successfully"
        );


        await waitFor(() => {
          expect(API.get).toHaveBeenCalledTimes(3);
        });
      }
    );


    test(
      "marks an approved appointment as completed",
      async () => {
        mockDashboardRequests();

        API.put.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Appointment completed successfully",
          },
        });


        render(<DoctorDashboard />);


        await screen.findByText(
          /Approved Patient/
        );


        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: /Mark as Completed/,
            }
          )
        );


        await waitFor(() => {
          expect(API.put).toHaveBeenCalledWith(
            "/appointment/update/appointment-approved",
            {
              status: "Completed",
            }
          );
        });


        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Appointment completed successfully"
        );


        await waitFor(() => {
          expect(API.get).toHaveBeenCalledTimes(3);
        });
      }
    );


    test(
      "shows an error when appointment status update fails",
      async () => {
        mockDashboardRequests();

        API.put.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Status transition is not allowed",
            },
          },
        });


        render(<DoctorDashboard />);


        await screen.findByText(
          /Pending Patient/
        );


        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Approve",
            }
          )
        );


        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Status transition is not allowed"
          );
        });


        expect(API.get).toHaveBeenCalledTimes(2);


        expect(
          toastSuccessMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);
