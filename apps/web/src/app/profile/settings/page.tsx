import SettingsSections from '@/features/profile/components/SettingsSections';

export default function SettingsPage() {
  return (
    <>
      <div>
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">Settings</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Manage your account and preferences</p>
      </div>

      <SettingsSections />
    </>
  );
}
