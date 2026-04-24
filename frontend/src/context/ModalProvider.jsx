import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, CircleAlert, CircleX, Sparkles } from "lucide-react";

const ModalContext = createContext(null);

const ICONS = {
  info: Sparkles,
  success: CheckCircle2,
  warning: CircleAlert,
  error: CircleX,
  confirm: AlertCircle,
};

const ICON_STYLES = {
  info: "bg-sky-100 text-sky-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  error: "bg-rose-100 text-rose-600",
  confirm: "bg-violet-100 text-violet-600",
};

const DEFAULT_LABELS = {
  alert: "OK",
  confirm: "Confirm",
  prompt: "Submit",
};

function AppModal({ config, onClose }) {
  if (!config) return null;

  const {
    variant = "info",
    title,
    message,
    type = "alert",
    confirmLabel = DEFAULT_LABELS[type] || "OK",
    cancelLabel = "Cancel",
    inputLabel = "Reason",
    inputPlaceholder = "",
    inputValue = "",
    inputRequired = false,
    inputError = "",
    onConfirm,
    onCancel,
  } = config;

  const Icon = ICONS[variant] || ICONS.info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#ffffff,_#f8fafc)] px-6 py-6">
          <div className="mb-5 flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ICON_STYLES[variant] || ICON_STYLES.info}`}
            >
              <Icon size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h3>
              {message && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {message}
                </p>
              )}
            </div>
          </div>

          {type === "prompt" && (
            <div className="mb-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {inputLabel}
              </label>
              <input
                autoFocus
                value={inputValue}
                onChange={(event) => config.onInputChange(event.target.value)}
                placeholder={inputPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              {inputError && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {inputError}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {type !== "alert" && (
              <button
                onClick={() => {
                  onCancel?.();
                  onClose();
                }}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => {
                if (type === "prompt" && inputRequired && !inputValue.trim()) {
                  onConfirm?.(null, "Please fill in this field.");
                  return;
                }
                onConfirm?.(inputValue);
              }}
              className="rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200/70 transition hover:scale-[1.01] hover:shadow-xl hover:shadow-fuchsia-200 active:scale-[0.99]"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalProvider({ children }) {
  const [config, setConfig] = useState(null);

  const closeModal = useCallback(() => {
    setConfig(null);
  }, []);

  const showAlert = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        type: "alert",
        ...options,
        onConfirm: () => {
          closeModal();
          resolve();
        },
      });
    });
  }, [closeModal]);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        type: "confirm",
        variant: "confirm",
        ...options,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  }, [closeModal]);

  const showPrompt = useCallback((options) => {
    return new Promise((resolve) => {
      const initialValue = options?.defaultValue || "";

      setConfig({
        type: "prompt",
        variant: "warning",
        inputValue: initialValue,
        ...options,
        onInputChange: (value) =>
          setConfig((current) => ({
            ...current,
            inputValue: value,
            inputError: "",
          })),
        onConfirm: (value, validationError) => {
          if (validationError) {
            setConfig((current) => ({
              ...current,
              inputError: validationError,
            }));
            return;
          }
          closeModal();
          resolve(value.trim());
        },
        onCancel: () => {
          resolve(null);
        },
      });
    });
  }, [closeModal]);

  const value = useMemo(
    () => ({ showAlert, showConfirm, showPrompt, closeModal }),
    [showAlert, showConfirm, showPrompt, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <AppModal config={config} onClose={closeModal} />
    </ModalContext.Provider>
  );
}

export function useAppModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useAppModal must be used within a ModalProvider");
  }

  return context;
}
