import { motion } from "framer-motion";

const sizeClassMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-xl ${
          sizeClassMap[size] || sizeClassMap.md
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4">
          <h2 className="pr-4 text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-slate-500">
            x
          </button>
        </div>

        <div className="overflow-y-auto p-6">{children}</div>
      </motion.div>
    </div>
  );
}
