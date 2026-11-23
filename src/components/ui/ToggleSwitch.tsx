import { motion } from 'motion/react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`btn-tactile relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ${
        checked ? 'bg-[#0057FF]' : 'bg-[#D1D5DB]'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', duration: 0.28, bounce: 0.18 }}
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ${
          checked ? 'ml-auto' : 'mr-auto'
        }`}
      />
    </button>
  );
}
