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
import BookAppointment from "../BookAppointment";


const {
  navigateMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));


vi.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => navigateMock,
    useParams: () => ({
      doctorId: "doctor-1",
    }),
  })
);


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
      post: vi.fn(),
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
const doctor = {
  _id: "doctor-1",
  fullName: "Dr Test Doctor",
  specialization: "Cardiology",
  experience: "8 years",
  fees: 500,
  address: "Test Clinic",
  slotDuration: 30,
};


const slotResponse = {
  success: true,
  availableSlots: [
    "09:00",
    "09:30",
  ],
  dayName: "Monday",
  blocked: false,
  slotDuration: 30,
  message: "",
};


// ======================================
// API Mock Helpers
// ======================================
const mockDoctorRequest = () => {
  API.get.mockImplementation(
    async (url) => {
      if (url === "/doctor/doctor-1") {
        return {
          data: {
            success: true,
            doctor,
          },
        };
      }

      if (
        url ===
        "/appointment/available-slots"
      ) {
        return {
          data: slotResponse,
        };
      }

      throw new Error(
        `Unexpected GET request: ${url}`
      );
    }
  );
};


const renderBookingPage = () =>
  render(<BookAppointment />);


const selectDate = (
  container,
  date = "2030-01-07"
) => {
  const dateInput =
    container.querySelector(
      'input[type="date"]'
    );

  if (!dateInput) {
    throw new Error(
      "Date input was not found."
    );
  }

  fireEvent.change(
    dateInput,
    {
      target: {
        value: date,
      },
    }
  );

  return dateInput;
};


// ======================================
// Book Appointment
// ======================================
describe(
  "BookAppointment",
  () => {
    beforeEach(() => {
      API.get.mockReset();
      API.post.mockReset();

      navigateMock.mockReset();
      toastSuccessMock.mockReset();
      toastErrorMock.mockReset();

      mockDoctorRequest();
    });


    afterEach(() => {
      cleanup();
    });


    test(
      "loads and displays doctor details",
      async () => {
        renderBookingPage();

        expect(
          await screen.findByText(
            "Dr Test Doctor"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText("Cardiology")
        ).toBeInTheDocument();

        expect(
          screen.getByText("₹500")
        ).toBeInTheDocument();

        expect(API.get).toHaveBeenCalledWith(
          "/doctor/doctor-1"
        );
      }
    );


    test(
      "loads available slots when a date is selected",
      async () => {
        const { container } =
          renderBookingPage();

        await screen.findByText(
          "Dr Test Doctor"
        );

        selectDate(
          container,
          "2030-01-07"
        );

        expect(
          await screen.findByRole(
            "button",
            {
              name: "09:00 AM",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            "button",
            {
              name: "09:30 AM",
            }
          )
        ).toBeInTheDocument();

        expect(API.get).toHaveBeenCalledWith(
          "/appointment/available-slots",
          {
            params: {
              doctorId: "doctor-1",
              appointmentDate:
                "2030-01-07",
            },
          }
        );
      }
    );


    test(
      "books an appointment and redirects to appointments",
      async () => {
        API.post.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Appointment booked successfully",
          },
        });

        const { container } =
          renderBookingPage();

        await screen.findByText(
          "Dr Test Doctor"
        );

        selectDate(
          container,
          "2030-01-07"
        );

        const slotButton =
          await screen.findByRole(
            "button",
            {
              name: "09:00 AM",
            }
          );

        fireEvent.click(slotButton);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Confirm Appointment",
            }
          )
        );

        await waitFor(() => {
          expect(API.post).toHaveBeenCalledWith(
            "/appointment/book",
            {
              doctorId: "doctor-1",
              appointmentDate:
                "2030-01-07",
              appointmentTime: "09:00",
              medicalDocument: "",
            }
          );
        });

        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Appointment booked successfully"
        );

        expect(
          navigateMock
        ).toHaveBeenCalledWith(
          "/my-appointments",
          {
            replace: true,
          }
        );
      }
    );


    test(
      "shows booking error and refreshes available slots",
      async () => {
        API.post.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Time slot is no longer available",
            },
          },
        });

        const { container } =
          renderBookingPage();

        await screen.findByText(
          "Dr Test Doctor"
        );

        selectDate(
          container,
          "2030-01-07"
        );

        const slotButton =
          await screen.findByRole(
            "button",
            {
              name: "09:00 AM",
            }
          );

        fireEvent.click(slotButton);

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Confirm Appointment",
            }
          )
        );

        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Time slot is no longer available"
          );
        });

        expect(
          navigateMock
        ).not.toHaveBeenCalled();

        expect(
          API.get
        ).toHaveBeenCalledWith(
          "/appointment/available-slots",
          {
            params: {
              doctorId: "doctor-1",
              appointmentDate:
                "2030-01-07",
            },
          }
        );

        expect(
          API.get.mock.calls.filter(
            ([url]) =>
              url ===
              "/appointment/available-slots"
          )
        ).toHaveLength(2);
      }
    );
  }
);
