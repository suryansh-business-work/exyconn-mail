import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

interface ToastMessage {
  message: string;
  severity: AlertColor;
}

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setToast({ message, severity });
      setOpen(true);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            onClose={handleClose}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
};
