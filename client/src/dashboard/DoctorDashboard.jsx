import {
  useCallback,
  useEffect,
  useState,
} from "react";

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


const createDefaultAvailability = () =>
  DAYS.map((day) => ({
    day,
    enabled: false,
    sessions: [],
  }));


const normalizeAvailability = (
  availability
) => {
  const source = Array.isArray(
    availability
  )
    ? availability
    : [];

  return DAYS.map((day) => {
    const existing = source.find(
      (item) => item.day === day
    );

    return {
      day,

      enabled:
        Boolean(existing?.enabled),

      sessions: Array.isArray(
        existing?.sessions
      )
        ? existing.sessions.map(
            (session) => ({
              startTime:
                session.startTime || "",

              endTime:
                session.endTime || "",
            })
          )
        : [],
    };
  });
};


function DoctorDashboard() {
  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialization: "",
    experience: "",
    fees: "",
    address: "",
    slotDuration: 30,
    weeklyAvailability:
      createDefaultAvailability(),
    blockedDates: [],
  });

  const [
    newBlockedDate,
    setNewBlockedDate,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    editingProfile,
    setEditingProfile,
  ] = useState(false);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);


   const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hourString, minute] =
      time.split(":");

    let hour = Number(hourString);

    if (
      Number.isNaN(hour) ||
      minute === undefined
    ) {
      return time;
    }

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute} ${period}`;
  };


  const buildFormFromDoctor = (
    doctor
  ) => ({
    fullName:
      doctor.fullName || "",

    phone:
      doctor.phone || "",

    email:
      doctor.email || "",

    specialization:
      doctor.specialization || "",

    experience:
      doctor.experience || "",

    fees:
      doctor.fees ?? "",

    address:
      doctor.address || "",

    slotDuration:
      doctor.slotDuration || 30,

    weeklyAvailability:
      normalizeAvailability(
        doctor.weeklyAvailability
      ),

    blockedDates: Array.isArray(
      doctor.blockedDates
    )
      ? [...doctor.blockedDates]
      : [],
  });


  const fetchProfile =
    useCallback(async () => {
      try {
        const { data } =
          await API.get(
            "/doctor/profile"
          );

        if (data.success) {
          setProfile(data.doctor);

          setFormData(
            buildFormFromDoctor(
              data.doctor
            )
          );
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load doctor profile"
        );
      } finally {
        setProfileLoading(false);
      }
    }, []);


  const fetchAppointments =
    useCallback(async () => {
      try {
        const { data } =
          await API.get(
            "/appointment/doctor"
          );

        if (data.success) {
          setAppointments(
            data.appointments || []
          );
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, [
    fetchProfile,
    fetchAppointments,
  ]);


  const handleProfileChange = (
    event
  ) => {
    let {
      name,
      value,
    } = event.target;

    if (name === "phone") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );
  };


  const toggleDay = (
    dayIndex
  ) => {
    setFormData(
      (previousData) => {
        const availability =
          previousData
            .weeklyAvailability
            .map(
              (item, index) => {
                if (
                  index !== dayIndex
                ) {
                  return item;
                }

                const enabled =
                  !item.enabled;

                return {
                  ...item,

                  enabled,

                  sessions:
                    enabled &&
                    item.sessions
                      .length === 0
                      ? [
                          {
                            startTime:
                              "09:00",

                            endTime:
                              "17:00",
                          },
                        ]
                      : item.sessions,
                };
              }
            );

        return {
          ...previousData,

          weeklyAvailability:
            availability,
        };
      }
    );
  };


  const addSession = (
    dayIndex
  ) => {
    setFormData(
      (previousData) => {
        const availability =
          previousData
            .weeklyAvailability
            .map(
              (item, index) =>
                index === dayIndex
                  ? {
                      ...item,

                      sessions: [
                        ...item.sessions,

                        {
                          startTime:
                            "09:00",

                          endTime:
                            "17:00",
                        },
                      ],
                    }
                  : item
            );

        return {
          ...previousData,

          weeklyAvailability:
            availability,
        };
      }
    );
  };


  const updateSession = (
    dayIndex,
    sessionIndex,
    field,
    value
  ) => {
    setFormData(
      (previousData) => {
        const availability =
          previousData
            .weeklyAvailability
            .map(
              (item, index) => {
                if (
                  index !== dayIndex
                ) {
                  return item;
                }

                return {
                  ...item,

                  sessions:
                    item.sessions.map(
                      (
                        session,
                        index
                      ) =>
                        index ===
                        sessionIndex
                          ? {
                              ...session,

                              [field]:
                                value,
                            }
                          : session
                    ),
                };
              }
            );

        return {
          ...previousData,

          weeklyAvailability:
            availability,
        };
      }
    );
  };


  const removeSession = (
    dayIndex,
    sessionIndex
  ) => {
    setFormData(
      (previousData) => {
        const availability =
          previousData
            .weeklyAvailability
            .map(
              (item, index) =>
                index === dayIndex
                  ? {
                      ...item,

                      sessions:
                        item.sessions.filter(
                          (
                            _session,
                            index
                          ) =>
                            index !==
                            sessionIndex
                        ),
                    }
                  : item
            );

        return {
          ...previousData,

          weeklyAvailability:
            availability,
        };
      }
    );
  };


  const addBlockedDate = () => {
    if (!newBlockedDate) {
      toast.error(
        "Please select a leave date"
      );

      return;
    }

    if (
      formData.blockedDates.includes(
        newBlockedDate
      )
    ) {
      toast.warning(
        "This date is already blocked"
      );

      return;
    }

    setFormData(
      (previousData) => ({
        ...previousData,

        blockedDates: [
          ...previousData.blockedDates,
          newBlockedDate,
        ].sort(),
      })
    );

    setNewBlockedDate("");
  };


  const removeBlockedDate = (
    date
  ) => {
    setFormData(
      (previousData) => ({
        ...previousData,

        blockedDates:
          previousData.blockedDates
            .filter(
              (item) =>
                item !== date
            ),
      })
    );
  };


  const cancelEditing = () => {
    if (!profile) {
      return;
    }

    setFormData(
      buildFormFromDoctor(profile)
    );

    setNewBlockedDate("");
    setEditingProfile(false);
  };


  const validateSchedule = () => {
    const enabledDays =
      formData.weeklyAvailability
        .filter(
          (item) => item.enabled
        );

    if (
      enabledDays.length === 0
    ) {
      toast.error(
        "Please enable at least one working day"
      );

      return false;
    }

    for (
      const day of enabledDays
    ) {
      if (
        day.sessions.length === 0
      ) {
        toast.error(
          `${day.day} needs at least one working session`
        );

        return false;
      }

      for (
        const session of day.sessions
      ) {
        if (
          !session.startTime ||
          !session.endTime
        ) {
          toast.error(
            `Complete all session times for ${day.day}`
          );

          return false;
        }

        if (
          session.startTime >=
          session.endTime
        ) {
          toast.error(
            `${day.day}: end time must be after start time`
          );

          return false;
        }
      }
    }

    return true;
  };


  const saveProfile = async (
    event
  ) => {
    event.preventDefault();

    if (savingProfile) {
      return;
    }

    if (!validateSchedule()) {
      return;
    }

    setSavingProfile(true);

    try {
      const { data } =
        await API.put(
          "/doctor/profile",

          {
            fullName:
              formData.fullName.trim(),

            phone:
              formData.phone.trim(),

            email:
              formData.email.trim(),

            specialization:
              formData
                .specialization
                .trim(),

            experience:
              formData.experience.trim(),

            fees:
              Number(formData.fees),

            address:
              formData.address.trim(),

            slotDuration:
              Number(
                formData.slotDuration
              ),

            weeklyAvailability:
              formData
                .weeklyAvailability,

            blockedDates:
              formData.blockedDates,
          }
        );

      if (data.success) {
        setProfile(data.doctor);

        setFormData(
          buildFormFromDoctor(
            data.doctor
          )
        );

        setEditingProfile(false);

        toast.success(
          data.message ||
            "Doctor profile updated successfully"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to update doctor profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };


  const updateStatus = async (
    id,
    status
  ) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(id);

    try {
      const { data } =
        await API.put(
          `/appointment/update/${id}`,

          {
            status,
          }
        );

      toast.success(
        data.message ||
          "Appointment status updated successfully"
      );

      await fetchAppointments();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to update appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  };


  const total =
    appointments.length;

  const pending =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Pending"
    ).length;

  const approved =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Approved"
    ).length;

  const completed =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Completed"
    ).length;

  const rejected =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Rejected"
    ).length;


  const getStatusBadgeClass = (
    status
  ) => {
    switch (status) {
      case "Approved":
        return "badge bg-success";

      case "Rejected":
        return "badge bg-danger";

      case "Completed":
        return "badge bg-info text-dark";

      default:
        return "badge bg-warning text-dark";
    }
  };


  return (
    <>
      <Navbar />

      <main className="container py-5">

        <div className="text-center mb-5">
          <h2 className="text-primary fw-bold">
            Doctor Dashboard
          </h2>

          <p className="text-muted">
            Manage your profile,
            weekly availability,
            leave dates, and appointments
          </p>
        </div>


        <div className="card shadow border-0 rounded-4 mb-5">
          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

              <h3 className="text-primary fw-bold mb-0">
                Doctor Profile
              </h3>

              {!editingProfile &&
                !profileLoading && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() =>
                      setEditingProfile(
                        true
                      )
                    }
                  >
                    ✏️ Edit Profile
                  </button>
                )}
            </div>


            {profileLoading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border text-primary"
                  role="status"
                />

                <p className="mt-3 mb-0">
                  Loading profile...
                </p>
              </div>
            ) : editingProfile ? (

              <form onSubmit={saveProfile}>

                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">
                      Phone
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleProfileChange
                      }
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      required
                    />
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">
                      Specialization
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="specialization"
                      value={
                        formData
                          .specialization
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">
                      Experience
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="experience"
                      value={
                        formData.experience
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">
                      Consultation Fee
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="fees"
                      min="0"
                      value={
                        formData.fees
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>


                  <div className="col-12">
                    <label className="form-label">
                      Clinic Address
                    </label>

                    <textarea
                      className="form-control"
                      name="address"
                      rows="3"
                      value={
                        formData.address
                      }
                      onChange={
                        handleProfileChange
                      }
                      required
                    />
                  </div>

                </div>


                <hr className="my-4" />


                <div className="mb-4">
                  <h4 className="text-primary fw-bold">
                    Appointment Settings
                  </h4>

                  <label className="form-label fw-semibold">
                    Appointment Duration
                  </label>

                  <select
                    className="form-select"
                    name="slotDuration"
                    value={
                      formData.slotDuration
                    }
                    onChange={
                      handleProfileChange
                    }
                  >
                    <option value="15">
                      15 minutes
                    </option>

                    <option value="20">
                      20 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      60 minutes
                    </option>
                  </select>
                </div>


                <div className="mb-4">

                  <h4 className="text-primary fw-bold">
                    Weekly Availability
                  </h4>

                  <p className="text-muted">
                    Enable working days and
                    define one or more sessions.
                    For example, 09:00–13:00
                    and 14:00–17:00.
                  </p>


                  {formData
                    .weeklyAvailability
                    .map(
                      (
                        day,
                        dayIndex
                      ) => (

                        <div
                          key={day.day}
                          className="card border mb-3"
                        >
                          <div className="card-body">

                            <div className="form-check form-switch mb-3">

                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`day-${day.day}`}
                                checked={
                                  day.enabled
                                }
                                onChange={() =>
                                  toggleDay(
                                    dayIndex
                                  )
                                }
                              />

                              <label
                                className="form-check-label fw-bold"
                                htmlFor={`day-${day.day}`}
                              >
                                {day.day}
                              </label>

                            </div>


                            {day.enabled && (
                              <>

                                {day.sessions.map(
                                  (
                                    session,
                                    sessionIndex
                                  ) => (

                                    <div
                                      className="row g-2 align-items-end mb-3"
                                      key={`${day.day}-${sessionIndex}`}
                                    >

                                      <div className="col-md-5">

                                        <label className="form-label">
                                          Start Time
                                        </label>

                                        <input
                                          type="time"
                                          className="form-control"
                                          value={
                                            session.startTime
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateSession(
                                              dayIndex,
                                              sessionIndex,
                                              "startTime",
                                              event.target
                                                .value
                                            )
                                          }
                                          required
                                        />

                                      </div>


                                      <div className="col-md-5">

                                        <label className="form-label">
                                          End Time
                                        </label>

                                        <input
                                          type="time"
                                          className="form-control"
                                          value={
                                            session.endTime
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateSession(
                                              dayIndex,
                                              sessionIndex,
                                              "endTime",
                                              event.target
                                                .value
                                            )
                                          }
                                          required
                                        />

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
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() =>
                                    addSession(
                                      dayIndex
                                    )
                                  }
                                >
                                  + Add Session
                                </button>

                              </>
                            )}

                          </div>
                        </div>
                      )
                    )}

                </div>


                <div className="mb-4">

                  <h4 className="text-primary fw-bold">
                    Leave / Blocked Dates
                  </h4>

                  <p className="text-muted">
                    Patients cannot book
                    appointments on these dates.
                  </p>


                  <div className="row g-2 align-items-end">

                    <div className="col-md-8">

                      <label className="form-label">
                        Select Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          newBlockedDate
                        }
                        onChange={(
                          event
                        ) =>
                          setNewBlockedDate(
                            event.target
                              .value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-4">

                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={
                          addBlockedDate
                        }
                      >
                        + Block Date
                      </button>

                    </div>

                  </div>


                  <div className="d-flex flex-wrap gap-2 mt-3">

                    {formData.blockedDates.map(
                      (date) => (

                        <div
                          key={date}
                          className="border rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                        >
                          <strong>
                            {date}
                          </strong>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle"
                            onClick={() =>
                              removeBlockedDate(
                                date
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}

                  </div>

                </div>


                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      savingProfile
                    }
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Profile"}
                  </button>


                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={
                      savingProfile
                    }
                    onClick={
                      cancelEditing
                    }
                  >
                    Cancel
                  </button>

                </div>

              </form>

            ) : profile ? (

              <div>

                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>Name:</strong>{" "}
                    {profile.fullName}
                  </div>

                  <div className="col-md-6">
                    <strong>Phone:</strong>{" "}
                    {profile.phone}
                  </div>

                  <div className="col-md-6">
                    <strong>Email:</strong>{" "}
                    {profile.email}
                  </div>

                  <div className="col-md-6">
                    <strong>
                      Specialization:
                    </strong>{" "}
                    {
                      profile.specialization
                    }
                  </div>

                  <div className="col-md-6">
                    <strong>
                      Experience:
                    </strong>{" "}
                    {profile.experience}
                  </div>

                  <div className="col-md-6">
                    <strong>
                      Consultation Fee:
                    </strong>{" "}
                    ₹{profile.fees}
                  </div>

                  <div className="col-md-6">
                    <strong>
                      Appointment Duration:
                    </strong>{" "}
                    {profile.slotDuration ||
                      30}{" "}
                    minutes
                  </div>

                  <div className="col-12">
                    <strong>
                      Clinic Address:
                    </strong>{" "}
                    {profile.address}
                  </div>

                </div>


                <hr className="my-4" />


                <h5 className="fw-bold">
                  Weekly Schedule
                </h5>


                <div className="row g-3 mt-1">

                  {normalizeAvailability(
                    profile
                      .weeklyAvailability
                  )
                    .filter(
                      (day) =>
                        day.enabled
                    )
                    .map((day) => (

                      <div
                        className="col-md-6"
                        key={day.day}
                      >
                        <div className="border rounded-3 p-3 h-100">

                          <strong className="text-primary">
                            {day.day}
                          </strong>

                          {day.sessions.map(
                            (
                              session,
                              index
                            ) => (

                              <div
                                className="mt-2"
                                key={`${day.day}-${index}`}
                              >
                                {formatTime(
                                  session.startTime
                                )}
                                {" – "}
                                {formatTime(
                                  session.endTime
                                )}
                              </div>
                            )
                          )}

                        </div>
                      </div>
                    ))}

                </div>


                {profile.blockedDates
                  ?.length > 0 && (
                  <>
                    <hr className="my-4" />

                    <h5 className="fw-bold">
                      Blocked Dates
                    </h5>

                    <div className="d-flex flex-wrap gap-2 mt-2">

                      {profile.blockedDates.map(
                        (date) => (
                          <span
                            key={date}
                            className="badge bg-danger fs-6 p-2"
                          >
                            {date}
                          </span>
                        )
                      )}

                    </div>
                  </>
                )}

              </div>

            ) : (

              <div className="alert alert-danger">
                Doctor profile could not
                be loaded.
              </div>

            )}

          </div>
        </div>


        <div className="row g-4 mb-5">

          {[
            [
              "Total",
              total,
              "text-primary",
            ],
            [
              "Pending",
              pending,
              "text-warning",
            ],
            [
              "Approved",
              approved,
              "text-success",
            ],
            [
              "Completed",
              completed,
              "text-info",
            ],
            [
              "Rejected",
              rejected,
              "text-danger",
            ],
          ].map(
            ([
              label,
              value,
              className,
            ]) => (

              <div
                className="col-lg col-md-4 col-sm-6"
                key={label}
              >
                <div className="card shadow border-0 text-center h-100">
                  <div className="card-body">

                    <h1
                      className={`${className} fw-bold`}
                    >
                      {value}
                    </h1>

                    <h5>
                      {label}
                    </h5>

                  </div>
                </div>
              </div>
            )
          )}

        </div>


        {loading ? (

          <div className="text-center py-5">
            <h4>
              Loading appointments...
            </h4>
          </div>

        ) : appointments.length === 0 ? (

          <div className="alert alert-warning text-center">
            No appointments found.
          </div>

        ) : (

          <div className="row">

            {appointments.map(
              (appointment) => {
                const isUpdating =
                  updatingId ===
                  appointment._id;

                return (
                  <div
                    className="col-lg-6 mb-4"
                    key={
                      appointment._id
                    }
                  >

                    <div className="card shadow border-0 rounded-4 h-100">

                      <div className="card-body">

                        <h4 className="text-primary fw-bold">
                          👤{" "}
                          {appointment.userId
                            ?.name ||
                            "Patient unavailable"}
                        </h4>

                        <hr />

                        <p>
                          <strong>
                            Email:
                          </strong>{" "}
                          {appointment.userId
                            ?.email ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>
                            Appointment Date:
                          </strong>{" "}
                          {
                            appointment
                              .appointmentDate
                          }
                        </p>

                        <p>
                          <strong>
                            Appointment Time:
                          </strong>{" "}
                          {formatTime(
                            appointment
                              .appointmentTime
                          )}
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{" "}

                          <span
                            className={
                              getStatusBadgeClass(
                                appointment
                                  .status
                              )
                            }
                          >
                            {
                              appointment
                                .status
                            }
                          </span>
                        </p>


                        {appointment.status ===
                          "Pending" && (

                          <div className="d-flex gap-2 mt-3">

                            <button
                              type="button"
                              className="btn btn-success flex-fill"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "Approved"
                                )
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : "Approve"}
                            </button>


                            <button
                              type="button"
                              className="btn btn-danger flex-fill"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "Rejected"
                                )
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : "Reject"}
                            </button>

                          </div>
                        )}


                        {appointment.status ===
                          "Approved" && (

                          <div className="mt-3">

                            <button
                              type="button"
                              className="btn btn-info w-100"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "Completed"
                                )
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : "✔ Mark as Completed"}
                            </button>

                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </main>

      <Footer />
    </>
  );
}


export default DoctorDashboard;
