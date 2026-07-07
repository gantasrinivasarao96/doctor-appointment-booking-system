import {
  cleanup,
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
import MyAppointments from "../MyAppointments";

const {
  toastErrorMock,
} = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock(
  "react-toastify",
  () => ({
    toast: {
      error: toastErrorMock,
    },
  })
);


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(),
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
const appointments = [
  {
    _id: "appointment-1",
    doctorId: {
      fullName: "Dr Test Doctor",
      email: "doctor@example.com",
      specialization: "Cardiology",
      fees: 500,
      address: "Test Clinic",
    },
    appointmentDate: "2030-01-07",
    appointmentTime: "09:00",
    status: "Pending",
  },
  {
    _id: "appointment-2",
    doctorId: {
      fullName: "Dr Approved Doctor",
      email: "approved@example.com",
      specialization: "Dermatology",
      fees: 700,
      address: "Approved Clinic",
    },
    appointmentDate: "2030-01-08",
    appointmentTime: "10:30",
    status: "Approved",
  },
  {
    _id: "appointment-3",
    doctorId: {
      fullName: "Dr Completed Doctor",
      email: "completed@example.com",
      specialization: "Neurology",
      fees: 900,
      address: "Completed Clinic",
    },
    appointmentDate: "2030-01-09",
    appointmentTime: "11:00",
    status: "Completed",
  },
  {
    _id: "appointment-4",
    doctorId: {
      fullName: "Dr Rejected Doctor",
      email: "rejected@example.com",
      specialization: "Orthopedics",
      fees: 600,
      address: "Rejected Clinic",
    },
    appointmentDate: "2030-01-10",
    appointmentTime: "14:00",
    status: "Rejected",
  },
];


// ======================================
// My Appointments
// ======================================
describe(
  "MyAppointments",
  () => {
    beforeEach(() => {
      API.get.mockReset();
      toastErrorMock.mockReset();
    });


    afterEach(() => {
      cleanup();
    });


    test(
      "loads and displays the user's appointments",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            total: appointments.length,
            appointments,
          },
        });


        render(<MyAppointments />);


        expect(
          screen.getByText(
            "Loading appointments..."
          )
        ).toBeInTheDocument();


        expect(
          await screen.findByText(
            /Dr Test Doctor/
          )
        ).toBeInTheDocument();


        expect(API.get).toHaveBeenCalledWith(
          "/appointment/user"
        );


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
            "2030-01-07"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("09:00")
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Waiting for Doctor Approval"
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "shows appointment status summaries and actions",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            total: appointments.length,
            appointments,
          },
        });


        render(<MyAppointments />);


        await screen.findByText(
          /Dr Test Doctor/
        );


        expect(
          screen.getByText(
            "Appointment Approved"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Appointment Completed"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Appointment Rejected"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Dr Approved Doctor/
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Dr Completed Doctor/
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            /Dr Rejected Doctor/
          )
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
      "shows an empty state when there are no appointments",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            total: 0,
            appointments: [],
          },
        });


        render(<MyAppointments />);


        expect(
          await screen.findByText(
            "No appointments found."
          )
        ).toBeInTheDocument();


        expect(API.get).toHaveBeenCalledWith(
          "/appointment/user"
        );
      }
    );


    test(
      "shows an API error when appointments cannot be loaded",
      async () => {
        API.get.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Unable to fetch appointments",
            },
          },
        });


        render(<MyAppointments />);


        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Unable to fetch appointments"
          );
        });


        expect(
          screen.getByText(
            "No appointments found."
          )
        ).toBeInTheDocument();
      }
    );
  }
);
