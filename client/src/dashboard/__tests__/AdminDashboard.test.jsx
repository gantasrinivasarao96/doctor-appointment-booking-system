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
import AdminDashboard from "../AdminDashboard";

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
const pendingDoctors = [
  {
    _id: "doctor-1",
    fullName: "Dr Pending One",
    email: "doctor1@example.com",
    phone: "9876543210",
    specialization: "Cardiology",
    experience: "5 years",
    fees: 500,
    status: "pending",
  },

  {
    _id: "doctor-2",
    fullName: "Dr Pending Two",
    email: "doctor2@example.com",
    phone: "9876543211",
    specialization: "Neurology",
    experience: "7 years",
    fees: 700,
    status: "pending",
  },
];


// ======================================
// Admin Dashboard
// ======================================
describe(
  "AdminDashboard",
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
      "loads and displays pending doctor applications",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            doctors: pendingDoctors,
          },
        });


        render(<AdminDashboard />);


        expect(
          screen.getByText(
            "Loading applications..."
          )
        ).toBeInTheDocument();


        expect(
          await screen.findByText(
            "Dr Pending One"
          )
        ).toBeInTheDocument();


        expect(API.get).toHaveBeenCalledWith(
          "/admin/doctors/pending"
        );


        expect(API.get).toHaveBeenCalledTimes(1);


        expect(
          screen.getByText(
            "doctor1@example.com"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("9876543210")
        ).toBeInTheDocument();


        expect(
          screen.getByText("Cardiology")
        ).toBeInTheDocument();


        expect(
          screen.getByText("5 years")
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Dr Pending Two"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("Neurology")
        ).toBeInTheDocument();


        expect(
          screen.getByText("2")
        ).toBeInTheDocument();


        expect(
          screen.getAllByText("pending")
        ).toHaveLength(2);
      }
    );


    test(
      "approves a pending doctor and refreshes the list",
      async () => {
        API.get.mockResolvedValue({
          data: {
            success: true,
            doctors: pendingDoctors,
          },
        });

        API.put.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Doctor approved successfully",
          },
        });


        render(<AdminDashboard />);


        await screen.findByText(
          "Dr Pending One"
        );


        const approveButtons =
          screen.getAllByRole(
            "button",
            {
              name: "Approve",
            }
          );


        fireEvent.click(
          approveButtons[0]
        );


        await waitFor(() => {
          expect(
            API.put
          ).toHaveBeenCalledWith(
            "/admin/doctors/approve/doctor-1",
            {}
          );
        });


        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Doctor approved successfully"
        );


        await waitFor(() => {
          expect(
            API.get
          ).toHaveBeenCalledTimes(2);
        });


        expect(
          API.get
        ).toHaveBeenLastCalledWith(
          "/admin/doctors/pending"
        );
      }
    );


    test(
      "rejects a pending doctor and refreshes the list",
      async () => {
        API.get.mockResolvedValue({
          data: {
            success: true,
            doctors: pendingDoctors,
          },
        });

        API.put.mockResolvedValueOnce({
          data: {
            success: true,
            message:
              "Doctor application rejected",
          },
        });


        render(<AdminDashboard />);


        await screen.findByText(
          "Dr Pending One"
        );


        const rejectButtons =
          screen.getAllByRole(
            "button",
            {
              name: "Reject",
            }
          );


        fireEvent.click(
          rejectButtons[0]
        );


        await waitFor(() => {
          expect(
            API.put
          ).toHaveBeenCalledWith(
            "/admin/doctors/reject/doctor-1",
            {}
          );
        });


        expect(
          toastSuccessMock
        ).toHaveBeenCalledWith(
          "Doctor application rejected"
        );


        await waitFor(() => {
          expect(
            API.get
          ).toHaveBeenCalledTimes(2);
        });


        expect(
          API.get
        ).toHaveBeenLastCalledWith(
          "/admin/doctors/pending"
        );
      }
    );


    test(
      "shows an empty state when there are no pending applications",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            doctors: [],
          },
        });


        render(<AdminDashboard />);


        expect(
          await screen.findByText(
            "No pending doctor applications."
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText("0")
        ).toBeInTheDocument();


        expect(API.get).toHaveBeenCalledWith(
          "/admin/doctors/pending"
        );
      }
    );


    test(
      "shows an error when pending applications cannot be loaded",
      async () => {
        API.get.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Unable to load applications",
            },
          },
        });


        render(<AdminDashboard />);


        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Unable to load applications"
          );
        });


        expect(
          await screen.findByText(
            "No pending doctor applications."
          )
        ).toBeInTheDocument();
      }
    );


    test(
      "shows an error when doctor approval fails",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            doctors: pendingDoctors,
          },
        });

        API.put.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Doctor approval failed",
            },
          },
        });


        render(<AdminDashboard />);


        await screen.findByText(
          "Dr Pending One"
        );


        const approveButtons =
          screen.getAllByRole(
            "button",
            {
              name: "Approve",
            }
          );


        fireEvent.click(
          approveButtons[0]
        );


        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Doctor approval failed"
          );
        });


        expect(API.get).toHaveBeenCalledTimes(1);


        expect(
          toastSuccessMock
        ).not.toHaveBeenCalled();
      }
    );


    test(
      "shows an error when doctor rejection fails",
      async () => {
        API.get.mockResolvedValueOnce({
          data: {
            success: true,
            doctors: pendingDoctors,
          },
        });

        API.put.mockRejectedValueOnce({
          response: {
            data: {
              message:
                "Doctor rejection failed",
            },
          },
        });


        render(<AdminDashboard />);


        await screen.findByText(
          "Dr Pending One"
        );


        const rejectButtons =
          screen.getAllByRole(
            "button",
            {
              name: "Reject",
            }
          );


        fireEvent.click(
          rejectButtons[0]
        );


        await waitFor(() => {
          expect(
            toastErrorMock
          ).toHaveBeenCalledWith(
            "Doctor rejection failed"
          );
        });


        expect(API.get).toHaveBeenCalledTimes(1);


        expect(
          toastSuccessMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);
