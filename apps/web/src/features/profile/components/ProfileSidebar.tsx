const NAV_ITEMS = [
  { icon: 'person', label: 'Profile', active: true },
  { icon: 'list_alt', label: 'My Listings', active: false },
  { icon: 'favorite', label: 'Favourites', active: false },
  { icon: 'receipt_long', label: 'Transactions', active: false },
];

export default function ProfileSidebar() {
  return (
    <aside className="hidden md:flex md:col-span-3 flex-col gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <button
              key={label}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                active
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container',
              ].join(' ')}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-[14px] font-semibold tracking-[0.05em]">{label}</span>
            </button>
          ))}

          <hr className="my-2 border-surface-variant" />

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[14px] font-semibold tracking-[0.05em]">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
