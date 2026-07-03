import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const createInitialAvailability = () =>
  DAYS.map((day) => ({
    day,
    enabled: false,
    sessions: [],
  }));

function ApplyDoctor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialization: "",
    experience: "",
    fees: "",
    address: "",
  });

  const [
    weeklyAvailability,
    setWeeklyAvailability,
  ] = useState(createInitialAvailability);

  const [slotDuration, setSlotDuration] =
    useState(30);

  const [submitting, setSubmitting] =
    useState(false);


  // ======================================
  // Basic Form Fields
  // ======================================
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };


  // ======================================
  // Format HH:mm to AM/PM
  // ======================================
  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hourString, minute] =
      time.split(":");

    let hour = Number(hourString);

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute} ${period}`;
  };


  // ======================================
  // Enable / Disable Day
  // ======================================
  const toggleDay = (dayIndex) => {
    setWeeklyAvailability(
      (previousAvailability) =>
        previousAvailability.map(
          (dayItem, index) => {
            if (index !== dayIndex) {
              return dayItem;
            }

            const nextEnabled =
              !dayItem.enabled;

            return {
              ...dayItem,

              enabled:
                nextEnabled,

              sessions:
                nextEnabled &&
                dayItem.sessions.length === 0
                  ? [
                      {
                        startTime: "09:00",
                        endTime: "17:00",
                      },
                    ]
                  : nextEnabled
                    ? dayItem.sessions
                    : [],
            };
          }
        )
    );
  };


  // ======================================
  // Update Session Time
  // ======================================
  const updateSession = (
    dayIndex,
    sessionIndex,
    field,
    value
  ) => {
    setWeeklyAvailability(
      (previousAvailability) =>
        previousAvailability.map(
          (dayItem, index) => {
            if (index !== dayIndex) {
              return dayItem;
            }

            const updatedSessions =
              dayItem.sessions.map(
                (session, currentIndex) => {
                  if (
                    currentIndex !==
                    sessionIndex
                  ) {
                    return session;
                  }

                  return {
                    ...session,
                    [field]: value,
                  };
                }
              );

            return {
              ...dayItem,
              sessions: updatedSessions,
            };
          }
        )
    );
  };


  // ======================================
  // Add Session
  // ======================================
  const addSession = (dayIndex) => {
    setWeeklyAvailability(
      (previousAvailability) =>
        previousAvailability.map(
          (dayItem, index) => {
            if (index !== dayIndex) {
              return dayItem;
            }

            const sessions =
              dayItem.sessions;

            let startTime = "09:00";
            let endTime = "17:00";

            if (sessions.length > 0) {
              const lastSession =
                sessions[
                  sessions.length - 1
                ];

              startTime =
                lastSession.endTime;

              endTime =
                addMinutes(
                  lastSession.endTime,
                  60
                );
            }

            return {
              ...dayItem,

              sessions: [
                ...sessions,
                {
                  startTime,
                  endTime,
                },
              ],
            };
          }
        )
    );
  };


  // ======================================
  // Remove Session
  // ======================================
  const removeSession = (
    dayIndex,
    sessionIndex
  ) => {
    setWeeklyAvailability(
      (previousAvailability) =>
        previousAvailability.map(
          (dayItem, index) => {
            if (index !== dayIndex) {
              return dayItem;
            }

            return {
              ...dayItem,

              sessions:
                dayItem.sessions.filter(
                  (_, currentIndex) =>
                    currentIndex !==
                    sessionIndex
                ),
            };
          }
        )
    );
  };


  // ======================================
  // Add Minutes to HH:mm
  // ======================================
  const addMinutes = (
    time,
    minutesToAdd
  ) => {
    const [hour, minute] =
      time.split(":").map(Number);

    let totalMinutes =
      hour * 60 +
      minute +
      minutesToAdd;

    if (totalMinutes >= 1440) {
      totalMinutes = 1439;
    }

    const newHour =
      Math.floor(
        totalMinutes / 60
      );

    const newMinute =
      totalMinutes % 60;

    return `${String(
      newHour
    ).padStart(
      2,
      "0"
    )}:${String(
      newMinute
    ).padStart(
      2,
      "0"
    )}`;
  };


  // ======================================
  // Copy Monday Schedule to Weekdays
  // ======================================
  const copyMondayToWeekdays = () => {
    const monday =
      weeklyAvailability.find(
        (item) =>
          item.day === "Monday"
      );

    if (
      !monday ||
      !monday.enabled ||
      monday.sessions.length === 0
    ) {
      toast.error(
        "Set Monday working hours first"
      );

      return;
    }

    setWeeklyAvailability(
      (previousAvailability) =>
        previousAvailability.map(
          (dayItem) => {
            if (
              [
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ].includes(dayItem.day)
            ) {
              return {
                ...dayItem,

                enabled: true,

                sessions:
                  monday.sessions.map(
                    (session) => ({
                      ...session,
                    })
                  ),
              };
            }

            return dayItem;
          }
        )
    );

    toast.success(
      "Monday schedule copied to Tuesday–Friday"
    );
  };


  // ======================================
  // Frontend Schedule Validation
  // ======================================
  const validateSchedule = () => {
    const enabledDays =
      weeklyAvailability.filter(
        (item) => item.enabled
      );

    if (enabledDays.length === 0) {
      toast.error(
        "Please enable at least one working day"
      );

      return false;
    }

    for (const dayItem of enabledDays) {
      if (
        dayItem.sessions.length === 0
      ) {
        toast.error(
          `${dayItem.day} has no working session`
        );

        return false;
      }

      for (
        let index = 0;
        index <
        dayItem.sessions.length;
        index += 1
      ) {
        const session =
          dayItem.sessions[index];

        if (
          !session.startTime ||
          !session.endTime
        ) {
          toast.error(
            `Select start and end time for ${dayItem.day}`
          );

          return false;
        }

        if (
          session.startTime >=
          session.endTime
        ) {
          toast.error(
            `${dayItem.day}: end time must be after start time`
          );

          return false;
        }
      }

      const sortedSessions = [
        ...dayItem.sessions,
      ].sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime
        )
      );

      for (
        let index = 1;
        index <
        sortedSessions.length;
        index += 1
      ) {
        const previous =
          sortedSessions[index - 1];

        const current =
          sortedSessions[index];

        if (
          current.startTime <
          previous.endTime
        ) {
          toast.error(
            `${dayItem.day} has overlapping sessions`
          );

          return false;
        }
      }
    }

    return true;
  };


  // ======================================
  // Submit Application
  // ======================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login to apply as a doctor"
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!validateSchedule()) {
      return;
    }

    setSubmitting(true);

    try {
      const { data } =
        await API.post(
          "/doctor/apply",

          {
            fullName:
              formData.fullName.trim(),

            phone:
              formData.phone,

            email:
              formData.email.trim(),

            specialization:
              formData.specialization.trim(),

            experience:
              formData.experience.trim(),

            fees:
              Number(formData.fees),

            address:
              formData.address.trim(),

            weeklyAvailability,

            slotDuration:
              Number(slotDuration),

            blockedDates: [],
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      toast.success(
        data.message ||
          "Doctor application submitted successfully"
      );

      navigate(
        "/user/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to submit doctor application"
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <>
      <Navbar />

      <main className="container py-5">

        <div className="row justify-content-center">

          <div className="col-xl-10 col-lg-11">

            <div className="card shadow border-0 rounded-4">

              <div className="card-body p-4 p-md-5">

                <div className="text-center mb-5">

                  <h2 className="text-primary fw-bold">
                    Apply as Doctor
                  </h2>

                  <p className="text-muted mb-0">
                    Add your professional details
                    and weekly consultation schedule.
                  </p>

                </div>


                <form onSubmit={handleSubmit}>

                  <h5 className="fw-bold mb-3">
                    Professional Information
                  </h5>


                  <div className="row g-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        placeholder="Enter full name"
                        value={
                          formData.fullName
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Enter email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Specialization
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="specialization"
                        placeholder="Example: Cardiologist"
                        value={
                          formData.specialization
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Experience
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="experience"
                        placeholder="Example: 5 years"
                        value={
                          formData.experience
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Consultation Fee
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="fees"
                        placeholder="Example: 500"
                        value={
                          formData.fees
                        }
                        onChange={
                          handleChange
                        }
                        min="0"
                        required
                      />

                    </div>


                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Clinic Address
                      </label>

                      <textarea
                        className="form-control"
                        name="address"
                        placeholder="Enter clinic address"
                        value={
                          formData.address
                        }
                        onChange={
                          handleChange
                        }
                        rows="3"
                        required
                      />

                    </div>

                  </div>


                  <hr className="my-5" />


                  <div className="d-md-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h4 className="text-primary fw-bold mb-1">
                        Weekly Availability
                      </h4>

                      <p className="text-muted mb-md-0">
                        Set working sessions. Appointment
                        slots will be generated automatically.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary mt-3 mt-md-0"
                      onClick={
                        copyMondayToWeekdays
                      }
                    >
                      Copy Monday to Weekdays
                    </button>

                  </div>


                  <div className="card bg-light border-0 mb-4">

                    <div className="card-body">

                      <div className="row align-items-center">

                        <div className="col-md-7">

                          <h6 className="fw-bold mb-1">
                            Appointment Duration
                          </h6>

                          <small className="text-muted">
                            The system generates patient
                            booking slots using this duration.
                          </small>

                        </div>


                        <div className="col-md-5 mt-3 mt-md-0">

                          <select
                            className="form-select"
                            value={
                              slotDuration
                            }
                            onChange={(e) =>
                              setSlotDuration(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          >
                            <option value={15}>
                              15 minutes
                            </option>

                            <option value={20}>
                              20 minutes
                            </option>

                            <option value={30}>
                              30 minutes
                            </option>

                            <option value={45}>
                              45 minutes
                            </option>

                            <option value={60}>
                              60 minutes
                            </option>
                          </select>

                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="d-flex flex-column gap-3">

                    {weeklyAvailability.map(
                      (
                        dayItem,
                        dayIndex
                      ) => (

                        <div
                          key={
                            dayItem.day
                          }
                          className={
                            dayItem.enabled
                              ? "card border-primary shadow-sm"
                              : "card border"
                          }
                        >

                          <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                              <div>

                                <h5 className="fw-bold mb-1">
                                  {dayItem.day}
                                </h5>

                                <small
                                  className={
                                    dayItem.enabled
                                      ? "text-success"
                                      : "text-muted"
                                  }
                                >
                                  {dayItem.enabled
                                    ? "Available"
                                    : "Not available"}
                                </small>

                              </div>


                              <div className="form-check form-switch">

                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  checked={
                                    dayItem.enabled
                                  }
                                  onChange={() =>
                                    toggleDay(
                                      dayIndex
                                    )
                                  }
                                />

                              </div>

                            </div>


                            {dayItem.enabled && (

                              <div className="mt-4">

                                {dayItem.sessions.map(
                                  (
                                    session,
                                    sessionIndex
                                  ) => (

                                    <div
                                      className="row g-2 align-items-end mb-3"
                                      key={
                                        sessionIndex
                                      }
                                    >

                                      <div className="col-md-5">

                                        <label className="form-label small fw-semibold">
                                          Start Time
                                        </label>

                                        <input
                                          type="time"
                                          className="form-control"
                                          value={
                                            session.startTime
                                          }
                                          onChange={(e) =>
                                            updateSession(
                                              dayIndex,
                                              sessionIndex,
                                              "startTime",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />

                                        <small className="text-muted">
                                          {formatTime(
                                            session.startTime
                                          )}
                                        </small>

                                      </div>


                                      <div className="col-md-5">

                                        <label className="form-label small fw-semibold">
                                          End Time
                                        </label>

                                        <input
                                          type="time"
                                          className="form-control"
                                          value={
                                            session.endTime
                                          }
                                          onChange={(e) =>
                                            updateSession(
                                              dayIndex,
                                              sessionIndex,
                                              "endTime",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />

                                        <small className="text-muted">
                                          {formatTime(
                                            session.endTime
                                          )}
                                        </small>

                                      </div>


                                      <div className="col-md-2">

                                        <button
                                          type="button"
                                          className="btn btn-outline-danger w-100"
                                          onClick={() =>
                                            removeSession(
                                              dayIndex,
                                              sessionIndex
                                            )
                                          }
                                        >
                                          Remove
                                        </button>

                                      </div>

                                    </div>

                                  )
                                )}


                                <button
                                  type="button"
                                  className="btn btn-outline-success"
                                  onClick={() =>
                                    addSession(
                                      dayIndex
                                    )
                                  }
                                >
                                  + Add Session
                                </button>

                              </div>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>


                  <div className="alert alert-info mt-4">

                    <strong>
                      Example:
                    </strong>{" "}

                    If Monday is set to
                    09:00 AM–01:00 PM and
                    02:00 PM–05:00 PM with a
                    30-minute duration, patients
                    will see automatically generated
                    slots such as 09:00 AM,
                    09:30 AM, 10:00 AM, and so on.
                    The lunch break will not appear.

                  </div>


                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mt-3"
                    disabled={
                      submitting
                    }
                  >
                    {submitting
                      ? "Submitting Application..."
                      : "Submit Doctor Application"}
                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default ApplyDoctor;
