import React from "react";
import { Spinner } from "reactstrap";

// Loader component to show centered spinner (e.g., during async operations)
export default function Loader() {
  return (
    <div className="spinner-center">
      <Spinner style={{ width: "2rem", height: "2rem" }} /> {/* Custom size */}
    </div>
  );
}
