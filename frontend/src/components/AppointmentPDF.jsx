// AppointmentPDF.jsx
import { Document, Page, Text, View, StyleSheet, Font, Line, Svg } from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
});

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  ink:        "#0D1B2A",   // near-black for headings
  body:       "#2C3E50",   // body text
  muted:      "#7F8C9A",   // labels, secondary
  faint:      "#B0BEC5",   // dividers, borders
  bg:         "#F4F6F8",   // card backgrounds
  white:      "#FFFFFF",
  teal:       "#00697A",   // primary brand (deep teal — clinical, trustworthy)
  tealLight:  "#E0F2F4",   // tinted bg
  tealMid:    "#4CA3AE",   // accent stripe
  green:      "#1B6B45",
  greenBg:    "#E8F5EE",
  amber:      "#7A4F00",
  amberBg:    "#FFF3CD",
  red:        "#8B1A1A",
  redBg:      "#FDECEA",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
  },

  // ── TOP BAR ───────────────────────────────────────────────────────────
  topBar: {
    height: 5,
    backgroundColor: C.teal,
  },

  // ── HEADER ────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1.5px solid ${C.teal}`,
  },
  brandBlock: {},
  brandName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.teal,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 8,
    color: C.muted,
    letterSpacing: 1.5,
    marginTop: 3,
    textTransform: "uppercase",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    letterSpacing: 0.5,
  },
  reportMeta: {
    fontSize: 8,
    color: C.muted,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  reportId: {
    fontSize: 8,
    color: C.teal,
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // ── BODY ──────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 70,
  },

  // ── SECTION HEADING ───────────────────────────────────────────────────
  sectionWrap: { marginBottom: 22 },
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionBar: {
    width: 3,
    height: 13,
    backgroundColor: C.teal,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.teal,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: C.faint,
    marginLeft: 10,
  },

  // ── INFO GRID ─────────────────────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoCell: {
    width: "31.5%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: C.bg,
    borderRadius: 4,
    borderTop: `2px solid ${C.teal}`,
  },
  infoCellLabel: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  infoCellValue: {
    fontSize: 10,
    color: C.ink,
    fontFamily: "Helvetica-Bold",
  },

  // ── STATUS ROW ────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  pillText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },

  // ── NOTES BOX ─────────────────────────────────────────────────────────
  notesOuter: {
    backgroundColor: C.bg,
    borderRadius: 4,
    padding: 16,
    borderLeft: `3px solid ${C.teal}`,
  },
  notesText: {
    fontSize: 10,
    color: C.body,
    lineHeight: 1.7,
  },
  followUpStrip: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: `0.5px solid ${C.faint}`,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followUpLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  followUpValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.teal,
  },

  // ── TABLE ─────────────────────────────────────────────────────────────
  table: {
    borderRadius: 4,
    border: `0.5px solid ${C.faint}`,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.teal,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  tableHeadCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: `0.5px solid ${C.faint}`,
  },
  tableRowAlt: {
    backgroundColor: C.tealLight,
  },
  tableCell: {
    fontSize: 9.5,
    color: C.body,
  },
  col1: { flex: 2.5 },
  col2: { flex: 1.2 },
  col3: { flex: 1.2 },
  colFull: { flex: 1 },

  emptyRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 9,
    color: C.muted,
    fontFamily: "Helvetica-Oblique",
  },

  // ── FOOTER ────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTop: `0.5px solid ${C.faint}`,
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 7.5,
    color: C.muted,
    letterSpacing: 0.3,
  },
  footerCenter: {
    fontSize: 7.5,
    color: C.teal,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  footerRight: {
    fontSize: 7.5,
    color: C.muted,
    letterSpacing: 0.3,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────

const SectionBlock = ({ title, children }) => (
  <View style={styles.sectionWrap}>
    <View style={styles.sectionHeadRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
    {children}
  </View>
);

const InfoCell = ({ label, value }) => (
  <View style={styles.infoCell}>
    <Text style={styles.infoCellLabel}>{label}</Text>
    <Text style={styles.infoCellValue}>{value || "—"}</Text>
  </View>
);

const StatusPill = ({ label, active, activeColor, activeBg, inactiveColor, inactiveBg }) => (
  <View style={[styles.pill, { backgroundColor: active ? activeBg : C.bg }]}>
    <View style={[styles.pillDot, { backgroundColor: active ? activeColor : C.faint }]} />
    <Text style={[styles.pillText, { color: active ? activeColor : C.muted }]}>{label}</Text>
  </View>
);

const MedicinesTable = ({ medicines = [] }) => {
  const rows = medicines.map((med) => {
    if (typeof med === "string") return { name: med, dosage: "—", duration: "—" };
    return {
      name:     med.name     ?? med.medicine ?? "—",
      dosage:   med.dosage   ?? med.dose     ?? "—",
      duration: med.duration ?? med.days     ?? "—",
    };
  });

  return (
    <View style={styles.table}>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadCell, styles.col1]}>Medicine</Text>
        <Text style={[styles.tableHeadCell, styles.col2]}>Dosage</Text>
        <Text style={[styles.tableHeadCell, styles.col3]}>Duration</Text>
      </View>
      {rows.length > 0 ? rows.map((r, i) => (
        <View key={i} style={[styles.tableRow, i % 2 !== 0 && styles.tableRowAlt]}>
          <Text style={[styles.tableCell, styles.col1]}>{r.name}</Text>
          <Text style={[styles.tableCell, styles.col2]}>{r.dosage}</Text>
          <Text style={[styles.tableCell, styles.col3]}>{r.duration}</Text>
        </View>
      )) : (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No medicines prescribed</Text>
        </View>
      )}
    </View>
  );
};

const TestsTable = ({ tests = [] }) => {
  const rows = tests.map((t) =>
    typeof t === "string" ? t : t.name ?? t.test ?? JSON.stringify(t)
  );

  return (
    <View style={styles.table}>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadCell, styles.colFull]}>Test Name</Text>
      </View>
      {rows.length > 0 ? rows.map((r, i) => (
        <View key={i} style={[styles.tableRow, i % 2 !== 0 && styles.tableRowAlt]}>
          <Text style={[styles.tableCell, styles.colFull]}>{r}</Text>
        </View>
      )) : (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No tests prescribed</Text>
        </View>
      )}
    </View>
  );
};

// ── Main Document ──────────────────────────────────────────────────────────

const AppointmentPDF = ({ appointment }) => {
  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const reportId = `RPT-${appointment._id?.slice(-6).toUpperCase() ?? "000000"}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Top teal bar */}
        <View style={styles.topBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>DOCEASE</Text>
            <Text style={styles.brandSub}>Healthcare Management Platform</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Appointment Report</Text>
            <Text style={styles.reportMeta}>Generated on {generatedOn}</Text>
            <Text style={styles.reportId}>{reportId}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Patient & Appointment */}
          <SectionBlock title="Patient & Appointment Details">
            <View style={styles.infoGrid}>
              <InfoCell label="Patient Name"       value={appointment.userData?.name} />
              <InfoCell label="Consulting Doctor"  value={appointment.docData?.name} />
              <InfoCell label="Email Address"      value={appointment.userData?.email} />
              <InfoCell label="Appointment Date"   value={appointment.slotDate} />
              <InfoCell label="Appointment Time"   value={appointment.slotTime} />
              <InfoCell label="Amount Paid"        value={`Rs. ${appointment.amount}`} />
            </View>
            <View style={styles.statusRow}>
              <StatusPill
                label={appointment.isCompleted ? "Completed" : "Pending"}
                active={appointment.isCompleted}
                activeColor={C.green} activeBg={C.greenBg}
                inactiveColor={C.amber} inactiveBg={C.amberBg}
              />
              <StatusPill
                label={appointment.payment ? "Payment Received" : "Payment Pending"}
                active={appointment.payment}
                activeColor={C.green} activeBg={C.greenBg}
                inactiveColor={C.amber} inactiveBg={C.amberBg}
              />
            </View>
          </SectionBlock>

          {/* Doctor Notes */}
          <SectionBlock title="Doctor Notes">
            <View style={styles.notesOuter}>
              <Text style={styles.notesText}>
                {appointment.doctorNotes?.notes || "No clinical notes recorded for this appointment."}
              </Text>
              {appointment.doctorNotes?.followUpDate ? (
                <View style={styles.followUpStrip}>
                  <Text style={styles.followUpLabel}>Follow-up Date</Text>
                  <Text style={styles.followUpValue}>{appointment.doctorNotes.followUpDate}</Text>
                </View>
              ) : null}
            </View>
          </SectionBlock>

          {/* Medicines */}
          <SectionBlock title="Prescribed Medicines">
            <MedicinesTable medicines={appointment.doctorNotes?.medicines} />
          </SectionBlock>

          {/* Tests */}
          <SectionBlock title="Prescribed Tests">
            <TestsTable tests={appointment.doctorNotes?.tests} />
          </SectionBlock>

        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Confidential Medical Record — For Patient Use Only</Text>
          <Text style={styles.footerCenter}>DOCEASE</Text>
          <Text style={styles.footerRight}>{reportId}  •  {generatedOn}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default AppointmentPDF;
