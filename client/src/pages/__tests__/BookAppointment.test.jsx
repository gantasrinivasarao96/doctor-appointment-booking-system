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
          expect(
            API.post
          ).toHaveBeenCalledTimes(1);
        });

        const [
          requestUrl,
          requestBody,
        ] = API.post.mock.calls[0];

        expect(requestUrl).toBe(
          "/appointment/book"
        );

        expect(
          requestBody
        ).toBeInstanceOf(FormData);

        expect(
          requestBody.get("doctorId")
        ).toBe("doctor-1");

        expect(
          requestBody.get(
            "appointmentDate"
          )
        ).toBe("2030-01-07");

        expect(
          requestBody.get(
            "appointmentTime"
          )
        ).toBe("09:00");

        expect(
          requestBody.has(
            "medicalDocument"
          )
        ).toBe(false);

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
      "includes a selected medical document in the booking request",
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

        const fileInput =
          screen.getByLabelText(
            /Medical Document/i
          );

        const file = new File(
          ["medical report"],
          "medical-report.pdf",
          {
            type: "application/pdf",
          }
        );

        fireEvent.change(
          fileInput,
          {
            target: {
              files: [file],
            },
          }
        );

        expect(
          await screen.findByText(
            "medical-report.pdf"
          )
        ).toBeInTheDocument();

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
            API.post
          ).toHaveBeenCalledTimes(1);
        });

        const requestBody =
          API.post.mock.calls[0][1];

        expect(
          requestBody
        ).toBeInstanceOf(FormData);

        const uploadedFile =
          requestBody.get(
            "medicalDocument"
          );

        expect(
          uploadedFile
        ).toBeInstanceOf(File);

        expect(
          uploadedFile.name
        ).toBe(
          "medical-report.pdf"
        );

        expect(
          uploadedFile.type
        ).toBe(
          "application/pdf"
        );
      }
    );


    test(
      "rejects unsupported medical document types",
      async () => {
        renderBookingPage();

        await screen.findByText(
          "Dr Test Doctor"
        );

        const fileInput =
          screen.getByLabelText(
            /Medical Document/i
          );

        const file = new File(
          ["plain text"],
          "report.txt",
          {
            type: "text/plain",
          }
        );

        fireEvent.change(
          fileInput,
          {
            target: {
              files: [file],
            },
          }
        );

        expect(
          toastErrorMock
        ).toHaveBeenCalledWith(
          "Only PDF, JPEG and PNG medical documents are allowed."
        );

        expect(
          screen.queryByText(
            "report.txt"
          )
        ).not.toBeInTheDocument();

        expect(
          API.post
        ).not.toHaveBeenCalled();
      }
    );


    test(
      "rejects medical documents larger than 5 MB",
      async () => {
        renderBookingPage();

        await screen.findByText(
          "Dr Test Doctor"
        );

        const fileInput =
          screen.getByLabelText(
            /Medical Document/i
          );

        const oversizedFile =
          new File(
            [
              new Uint8Array(
                5 * 1024 * 1024 + 1
              ),
            ],
            "large-report.pdf",
            {
              type:
                "application/pdf",
            }
          );

        fireEvent.change(
          fileInput,
          {
            target: {
              files: [
                oversizedFile,
              ],
            },
          }
        );

        expect(
          toastErrorMock
        ).toHaveBeenCalledWith(
          "Medical document must not exceed 5 MB."
        );

        expect(
          screen.queryByText(
            "large-report.pdf"
          )
        ).not.toBeInTheDocument();

        expect(
          API.post
        ).not.toHaveBeenCalled();
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
