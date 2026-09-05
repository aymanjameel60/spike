import { Navigate } from "react-router-dom";

export default function LegacySettingsSubpagesDisabled() {
  return <Navigate to="/" replace />;
}
