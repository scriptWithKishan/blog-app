import DisplaySettings from "./display";
import Profile from "./profile";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center">
      <Profile />
      <DisplaySettings />
    </div>
  );
}

