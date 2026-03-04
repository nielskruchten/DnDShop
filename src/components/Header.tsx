interface HeaderProps {
  onShowSaved: () => void;
  onToggleConfig: () => void;
  configVisible: boolean;
}

export default function Header({ onShowSaved, onToggleConfig, configVisible }: HeaderProps) {
  return (
    <header className="no-print h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 z-10">
      <h1 className="font-display text-lg text-gold-400 tracking-wide select-none">
        ⚔ Magic Item Shop
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowSaved}
          className="text-sm px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 active:bg-zinc-600 transition-colors"
        >
          Saved Shops
        </button>

        {/* Config toggle — only visible on small screens */}
        <button
          onClick={onToggleConfig}
          className="md:hidden text-sm px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 active:bg-zinc-600 transition-colors"
        >
          {configVisible ? 'Hide Config' : 'Config'}
        </button>
      </div>
    </header>
  );
}
