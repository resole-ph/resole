'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useMyProfile } from '../queries/profile.queries';
import type { MyProfile } from '../types/profile.types';

type NotifKey = 'messages' | 'offers' | 'promos' | 'recycleReminders';

/**
 * Labels and icons only — the values come from the signed-in user. This list
 * used to carry hardcoded details ("Marc Andre Santos", "marc@example.com"),
 * so every account saw the same fictional person on its own settings page.
 */
const ACCOUNT_FIELDS: { id: keyof MyProfile; label: string; icon: string }[] = [
  { id: 'name', label: 'Full name', icon: 'person' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'contactNo', label: 'Phone', icon: 'call' },
  { id: 'location', label: 'Location', icon: 'location_on' },
];

const NOTIF_ROWS: { key: NotifKey; label: string; sub: string }[] = [
  { key: 'messages', label: 'Messages', sub: 'Buyer and seller chats' },
  { key: 'offers', label: 'Offers & bids', sub: 'When someone makes an offer on your listing' },
  { key: 'promos', label: 'Promotions', sub: 'Sales, deals, and platform news' },
  { key: 'recycleReminders', label: 'Recycle reminders', sub: 'Tips and pickup reminders' },
];

const MORE_ROWS = [
  { label: 'Privacy policy', icon: 'shield' },
  { label: 'Terms of service', icon: 'description' },
  { label: 'Help & support', icon: 'help' },
  { label: 'About Resole', icon: 'info' },
];

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

function AccountRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Row>
      <IconTile icon={icon} />
      <div className="flex-1">
        <p className="text-on-surface-variant text-[12px]">{label}</p>
        <p className="text-on-surface font-medium text-[14px] mt-0.5">{value}</p>
      </div>
      <span className="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
    </Row>
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
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
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
}: {
  label: string;
  icon: string;
  tone?: 'default' | 'warning' | 'danger';
  onClick?: () => void;
}) {
  const toneClass =
    tone === 'danger' ? 'text-error' : tone === 'warning' ? 'text-tertiary' : 'text-on-surface';

  return (
    <button onClick={onClick} className="w-full text-left">
      <Row>
        <span className={`material-symbols-outlined text-[18px] ${toneClass}`}>{icon}</span>
        <span className={`flex-1 font-medium text-[14px] ${toneClass}`}>{label}</span>
        <span className="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
      </Row>
    </button>
  );
}

export default function SettingsSections() {
  const router = useRouter();
  const { signOut } = useAuth();
  // Shared with the profile header, so this page usually needs no request.
  const { data: profile } = useMyProfile();
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    messages: true,
    offers: false,
    promos: false,
    recycleReminders: true,
  });

  const toggle = (key: NotifKey) => () =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = async () => {
    if (window.confirm('Log out? You will need to sign in again.')) {
      await signOut();
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Delete account? All your data will be permanently removed. This cannot be undone.')) {
      // Account deletion wiring pending auth integration.
    }
  };

  return (
    <div>
      <SectionTitle title="Account" />
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        {ACCOUNT_FIELDS.map((f) => (
          <AccountRow
            key={f.id}
            label={f.label}
            value={profile ? String(profile[f.id] ?? '—') : '—'}
            icon={f.icon}
          />
        ))}
        <AccountRow label="Password" value="••••••••" icon="lock" />
      </div>

      <SectionTitle title="Notifications" />
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        {NOTIF_ROWS.map((n) => (
          <ToggleRow
            key={n.key}
            label={n.label}
            sub={n.sub}
            checked={notifs[n.key]}
            onChange={toggle(n.key)}
          />
        ))}
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
        <ActionRow label="Delete account" icon="delete" tone="danger" onClick={handleDeleteAccount} />
      </div>
    </div>
  );
}
