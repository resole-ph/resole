'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useMyProfile, useUpdateMyProfile } from '../queries/profile.queries';
import type { MyProfile } from '../types/profile.types';
import { isStrongPassword, isValidEmail, PASSWORD_REQUIREMENT_MESSAGE } from '@/lib/auth';
import { ProfileClient } from '../services/profile.client';

// These are the four categories the API actually stores; the labels below name
// them as the server does rather than inventing a mapping.
type NotifKey = 'listing' | 'offer' | 'promotion' | 'system';

const ACCOUNT_FIELDS: { id: keyof MyProfile; label: string; value: string, icon: string }[] = [
  { id: 'name',           label: 'Full name',       value: '', icon: 'person' },
  { id: 'email',          label: 'Email',           value: '', icon: 'mail' },
  { id: 'contactNo',      label: 'Phone',           value: '', icon: 'call' },
  { id: 'location',       label: 'Location',        value: '', icon: 'location_on' },
  { id: 'unit',           label: 'Unit',            value: '', icon: 'deployed_code' },
  { id: 'classification', label: 'Classification',  value: '', icon: 'wc' },
];

const NOTIF_ROWS: { key: NotifKey; label: string; sub: string }[] = [
  { key: 'listing', label: 'Listings', sub: 'Updates about your listings' },
  { key: 'offer', label: 'Offers & bids', sub: 'When someone makes an offer on your listing' },
  { key: 'promotion', label: 'Promotions', sub: 'Sales, deals, and platform news' },
  { key: 'system', label: 'System', sub: 'Account and service announcements' },
];

const MORE_ROWS = [
  { label: 'Privacy policy', icon: 'shield' },
  { label: 'Terms of service', icon: 'description' },
  { label: 'Help & support', icon: 'help' },
  { label: 'About Resole', icon: 'info' },
];

const UNIT_OPTIONS = ['us', 'uk', 'eu', 'cm'];
const CLASSIFICATION_OPTIONS = ["men", "women"];

function fieldOptions(fieldId: string): string[] | null {
  if (fieldId === 'unit') return UNIT_OPTIONS;
  if (fieldId === 'classification') return CLASSIFICATION_OPTIONS;
  return null;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="text-on-surface-variant text-[12px] font-semibold uppercase tracking-wide mt-6 mb-2">
      {title}
    </p>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-variant last:border-b-0">
      {children}
    </div>
  );
}

function IconTile({ icon }: { icon: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </div>
  );
}

function AccountRow({ label, value, icon, onClick }: { label: string; value: string; icon: string, onClick: () => void }) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Row>
        <IconTile icon={icon} />
        <div className="flex-1">
          <p className="text-on-surface-variant text-[12px]">{label}</p>
          <p className="text-on-surface font-medium text-[14px] mt-0.5">{value}</p>
        </div>
        <span className="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
      </Row>
    </div>
  );
}

function DialogShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.15)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
 
        {children}
 
        <div className="flex gap-3 mt-6">{footer}</div>
      </div>
    </div>
  );
}
 
function FooterButtons({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled: boolean;
}) {
  return (
    <>
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {confirmLabel}
      </button>
    </>
  );
}
 
function EditFieldModal({
  visible,
  field,
  onClose,
  onSave,
}: {
  visible: boolean;
  field: (typeof ACCOUNT_FIELDS)[number] | null;
  onClose: () => void;
  onSave: (id: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    if (field) setValue(field.value);
  }, [field]);
 
  if (!visible || !field) return null;

  const options = fieldOptions(field.id);
  const isEmailField = field.id === 'email';
  const trimmedValue = value.trim();
  const emailInvalid = isEmailField && trimmedValue !== '' && !isValidEmail(trimmedValue);
 
  const handleSave = async (nextValue: string) => {
    setSaving(true);
    try {
      await onSave(field.id, nextValue);
      onClose();
      window.alert(`Success!\n\nSuccessfully saved changes to ${field.label.toLowerCase()}.`);
    } catch {
      // Parent already surfaces an alert on failure — keep the sheet open
      // so the user can retry instead of losing what they typed.
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <DialogShell
      title={`Edit ${field.label}`}
      onClose={onClose}
      footer={
        options ? (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            Close
          </button>
        ) : (
          <FooterButtons
            onCancel={onClose}
            onConfirm={() => handleSave(value)}
            confirmLabel={saving ? 'Saving...' : 'Save changes'}
            confirmDisabled={saving || !value.trim() || emailInvalid}
          />
        )
      }
    >
      {options ? (
        <div className="flex flex-col gap-1">
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                onClick={() => handleSave(option)}
                disabled={saving}
                className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-[14px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>{option}</span>
                {selected && <span className="material-symbols-outlined text-[18px]">check</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-[13px] font-semibold">{field.label}</span>
          <input
            type={isEmailField ? 'email' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.label}
            autoFocus
            autoComplete={isEmailField ? 'email' : undefined}
            className="rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {emailInvalid && <p className="text-error text-[13px]">Enter a valid email address.</p>}
        </label>
      )}
    </DialogShell>
  );
}
 
function PasswordEditModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const resetAndClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };
 
  const handleSubmit = async () => {
    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError(PASSWORD_REQUIREMENT_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }
 
    setError(null);
    setSaving(true);
    try {
      await onSave(currentPassword, newPassword);
      resetAndClose();
      window.alert('Success!\n\nSuccessfully changed password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };
 
  if (!visible) return null;
 
  const isValid = !!currentPassword && newPassword.length >= 8 && newPassword === confirmPassword;
  const inputClassName =
    'rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
 
  return (
    <DialogShell
      title="Change password"
      onClose={resetAndClose}
      footer={
        <FooterButtons
          onCancel={resetAndClose}
          onConfirm={handleSubmit}
          confirmLabel={saving ? 'Saving...' : 'Update password'}
          confirmDisabled={saving || !isValid}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-[13px] font-semibold">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
            placeholder="Current password"
            autoComplete="current-password"
            className={inputClassName}
          />
        </label>
 
        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-[13px] font-semibold">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className={inputClassName}
          />
        </label>
 
        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-[13px] font-semibold">Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            className={inputClassName}
          />
        </label>
 
        {error && <p className="text-error text-[13px]">{error}</p>}
      </div>
    </DialogShell>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <Row>
      <div className="flex-1 mr-4">
        <p className="text-on-surface font-medium text-[14px]">{label}</p>
        <p className="text-on-surface-variant text-[12px] mt-0.5">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={[
          'w-10 h-6 rounded-full relative transition-colors shrink-0',
          checked ? 'bg-primary' : 'bg-surface-variant',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[-2px]' : 'translate-x-[-18px]',
          ].join(' ')}
        />
      </button>
    </Row>
  );
}

function ActionRow({
  label,
  icon,
  tone = 'default',
  onClick,
  disabled = false,
  note,
}: {
  label: string;
  icon: string;
  tone?: 'default' | 'warning' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  note?: string;
}) {
  const toneClass = disabled
    ? 'text-on-surface-variant'
    : tone === 'danger' ? 'text-error' : tone === 'warning' ? 'text-tertiary' : 'text-on-surface';

  return (
    <button onClick={onClick} disabled={disabled} className={`w-full text-left ${disabled ? 'cursor-not-allowed' : ''}`}>
      <Row>
        <span className={`material-symbols-outlined text-[18px] ${toneClass}`}>{icon}</span>
        <span className="flex-1">
          <span className={`block font-medium text-[14px] ${toneClass}`}>{label}</span>
          {note && <span className="block text-on-surface-variant text-[12px] mt-0.5">{note}</span>}
        </span>
        {!disabled && (
          <span className="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
        )}
      </Row>
    </button>
  );
}

export default function SettingsSections() {
  const router = useRouter();
  const { signOut } = useAuth();
  // Shared with the profile header, so this page usually needs no request.
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [editingField, setEditingField] = useState<(typeof ACCOUNT_FIELDS)[number] | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    listing: false,
    offer: false,
    promotion: false,
    system: false,
  });
  const [notifsLoaded, setNotifsLoaded] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/users/me/notification-preferences')
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Failed to load notification preferences');
        return data.preferences as Partial<Record<NotifKey, boolean>>;
      })
      .then((preferences) => {
        if (cancelled) return;
        setNotifs((prev) => ({ ...prev, ...preferences }));
        setNotifsLoaded(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to load notification preferences:', error);
        setNotifError('Could not load your notification settings.');
      });

    return () => {
      cancelled = true;
    };
  }, []);


  const accountFields = useMemo(
    () =>
      ACCOUNT_FIELDS.map((field) => ({
        ...field,
        value: profile ? String(profile[field.id]) ?? '—' : '—',
      })),
      [profile]
  );  
    
  const toggle = (key: NotifKey) => async () => {
    const next = !notifs[key];
    setNotifs((prev) => ({ ...prev, [key]: next }));
    setNotifError(null);

    try {
      const response = await fetch('/api/users/me/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to save preference');
    } catch (error) {
      console.error('Failed to save notification preference:', error);
      setNotifs((prev) => ({ ...prev, [key]: !next }));
      setNotifError('Could not save that change. Please try again.');
    }
  };

  async function handleSaveField(id: string, value: string) {
    try {
      const field = { [id]: value };
      await updateProfile.mutateAsync(field);
    } catch (error) {
      alert(
        `Could not update. ${error instanceof Error ? error.message : "Please try again."}`,
      );
      throw error;
    }
  }

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    // Surfacing the error message inline in the sheet (via the thrown error)
    // rather than an Alert here, since "wrong current password" etc. reads
    // better right next to the field than in a popup.
    await ProfileClient.updatePassword({ currentPassword, newPassword })
  }

  const handleLogout = async () => {
    if (window.confirm('Log out? You will need to sign in again.')) {
      await signOut();
      router.push('/');
    }
  };


  return (
    <>
      <div>
        <SectionTitle title="Account" />
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          {accountFields.map((f) => (
            <AccountRow
              key={f.id}
              label={f.label}
              value={f.value}
              icon={f.icon}
              onClick={() => setEditingField(f)}
            />
          ))}
          <AccountRow label="Password" value="••••••••" icon="lock" onClick={() => setShowPasswordModal(true)} />
        </div> 

        <SectionTitle title="Notifications" />
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          {NOTIF_ROWS.map((n) => (
            <ToggleRow
              key={n.key}
              label={n.label}
              sub={n.sub}
              checked={notifs[n.key]}
              onChange={notifsLoaded ? toggle(n.key) : () => {}}
            />
          ))}
          {notifError && <p className="text-error text-[13px] px-4 pb-3">{notifError}</p>}
        </div>

        <SectionTitle title="More" />
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          {MORE_ROWS.map((m) => (
            <ActionRow key={m.label} label={m.label} icon={m.icon} />
          ))}
        </div>

        <SectionTitle title="Account actions" />
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <ActionRow label="Log out" icon="logout" tone="warning" onClick={handleLogout} />
          {/* Deliberately inert rather than wired: the button used to warn that
              all data would be erased and then do nothing at all. */}
          <ActionRow label="Delete account" icon="delete" disabled note="Coming soon" />
        </div>
      </div>

      <EditFieldModal
        visible={!!editingField}
        field={editingField}
        onClose={() => setEditingField(null)}
        onSave={handleSaveField}
      />

      <PasswordEditModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handleChangePassword}
      />
    </>
  );
}
