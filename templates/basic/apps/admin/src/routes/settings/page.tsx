import { Navigate } from "react-router-dom";

export default function LegacySettingsDisabled() {
  return <Navigate to="/" replace />;
}
