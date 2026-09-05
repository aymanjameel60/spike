import { Navigate } from "react-router-dom";

/**
 * Spike uses its own admin pages and settings flows.
 * The legacy Mercur /settings section is intentionally disabled.
 */
export const SettingsLayout = () => {
  return <Navigate to="/" replace />;
};
