import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

// ── Shimmer card, defined outside the component so it isn't recreated
//    on every render ──────────────────────────────────────────────────
const ShimmerCard = () => (
  <div className="col-lg-3 col-12 mb-4">
    <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
      <div
        className="shimmer-line rounded mb-3"
        style={{ width: "200px", height: "200px" }}
      ></div>
      <div className="w-75 text-center">
        <div className="shimmer-line mb-2" style={{ height: "18px" }}></div>
        <div className="shimmer-line mb-2" style={{ height: "18px" }}></div>
        <div className="shimmer-line" style={{ height: "14px" }}></div>
      </div>
    </div>
  </div>
);

const DoctorList = () => {
  const { getAllDoctors, doctor, adminToken, changeAvailability } =
    useContext(AdminContext);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      await getAllDoctors();
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  // ── Filtering: matches against doctor name or speciality ──────────
  const filteredDoctors = (doctor || []).filter((doc) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      doc.name?.toLowerCase().includes(term) ||
      doc.speciality?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="margin-left-side">
      <h2 className="fs-4 mt-3 ml-3">
        Doctor <span className="text-primary">List</span>
      </h2>

      {/* ── Search Bar ──────────────────────────────────────────── */}
      <div className="mb-3 ml-3" style={{ maxWidth: "320px" }}>
        <div className="position-relative">
          <i
            className="fas fa-search position-absolute text-muted"
            style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
          ></i>
          <input
            type="text"
            className="form-control rounded-3 ps-5"
            placeholder="Search by name or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row text-center">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div className="col-lg-3 col-12 mb-4 no-underline" key={doc._id}>
              <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
                <img
                  src={doc.image}
                  alt={doc.name}
                  width={200}
                  className="doctor-card rounded shadow-sm p-3 border-0 h-100"
                />
                <div>
                  <p className="text-success">
                    <input
                      type="checkbox"
                      onClick={() => changeAvailability(doc._id)}
                      defaultChecked={doc.available}
                      name="available"
                    />{" "}
                    Available
                  </p>
                  <p className="fw-semibold fs-5">{doc.name}</p>
                  <span className="text-secondary">{doc.speciality}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted mt-4">No doctors found.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorList;