'use client';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Account Settings</h2>
        <p className="mb-2">Manage your account details here.</p>
        {/* Placeholder for account settings form */}

        <h2 className="text-xl font-semibold mt-6 mb-3">Notification Preferences</h2>
        <p className="mb-2">Configure your notification settings.</p>
        {/* Placeholder for notification settings */}

        <h2 className="text-xl font-semibold mt-6 mb-3">Theme</h2>
        <p className="mb-2">Choose your preferred theme (Light/Dark).</p>
        {/* Placeholder for theme switcher */}
      </div>
    </div>
  );
} 