import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import VuiSnackbar from "components/VuiSnackbar/Vuisnackbar";

function SarcomaTable() {
  const [columns] = useState([
    { name: "Patient ID", align: "left" },
    { name: "Tumor Size (cm)", align: "center" },
    { name: "Tumor Location", align: "center" },
    { name: "Histological Grade", align: "center" },
    { name: "Metastasis", align: "center" },
    // { name: "Survival Months", align: "center" },
    // { name: "Survival Status", align: "center" },
    { name: "File", align: "center" }
  ]);
  

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState("");

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (page) => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/sarcoma?page=${page}&limit=10`);
      const newRows = response.data.data.map((item) => ({
        "Patient ID": (
          <VuiTypography
            variant="button"
            color="primary"
            style={{ cursor: "pointer", textDecoration: "bold" }}
            onClick={() => handleSnackbarOpen(item)}
          >
            {item.patient_id}
          </VuiTypography>
        ),
        age: item.age,
        gender: item.gender,
        country: item.country,
        "Tumor Size (cm)": item.tumor_size_cm,
        "Tumor Location": item.tumor_location,
        "Histological Grade": (
          <VuiTypography
            variant="button"
            style={{
              color: item.histological_grade === "High" ? "red" :
                     item.histological_grade === "Intermediate" ? "orange" :
                     "yellow",
            }}
          >
            {item.histological_grade}
          </VuiTypography>
        ),
        "Metastasis": item.metastasis,
        "Survival Months": item.survival_months,
  "Survival Status": item.survival_status === "Alive" ? (
    <VuiTypography variant="button" color="success">
      {item.survival_status}
    </VuiTypography>
  ) : (
    <VuiTypography variant="button" color="error">
      {item.survival_status}
    </VuiTypography>
  ),
        File: (
          <VuiTypography
            variant="button"
            color="primary"
            style={{ cursor: "pointer", textDecoration: "bold" }}
            onClick={() => handleOpenModal(item.file)}
          >
            View Image
          </VuiTypography>
        )
      }));
      setRows((prevRows) => [...prevRows, ...newRows]);
      setHasMore(response.data.currentPage < response.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const lastRowRef = useCallback((node) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleOpenModal = (fileName) => {
    setSelectedImage(`http://localhost:4000/images/${fileName}.jpg`);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleSnackbarOpen = (patient) => {
    setSnackbarContent(
      `Country: ${patient.country}\nGender: ${patient.gender}\nAge: ${patient.age}\nSurvival Status: ${patient.survival_status}`
    );
    setShowSnackbar(true);
    // setTimeout(() => setShowSnackbar(false), 3000);
  };
  

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3}>
          <Card>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="22px">
              <VuiTypography variant="lg" color="white">
                Sarcoma Data
              </VuiTypography>
            </VuiBox>
            <VuiBox style={{ maxHeight: "445px", overflowY: "auto" }}>
              <Table columns={columns} rows={rows} />
              <div ref={lastRowRef} style={{ height: "20px" }} />
              {loading && <VuiTypography variant="caption" color="white">Loading...</VuiTypography>}
            </VuiBox>
          </Card>
        </VuiBox>
      </VuiBox>
      <Footer />

      {/* Image Modal */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md">
        <DialogTitle>Patient File</DialogTitle>
        <DialogContent>
          <img 
            src={selectedImage} 
            alt="Patient File" 
            style={{ width: "100%", height: "auto", borderRadius: "8px" }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <VuiSnackbar
        color="info"
        icon="notifications"
        title="Patient Info"
        content={snackbarContent}
        open={showSnackbar}
        close={() => setShowSnackbar(false)}
      />
    </DashboardLayout>
  );
}

export default SarcomaTable;
