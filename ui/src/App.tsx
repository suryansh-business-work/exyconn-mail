import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Dashboard from "./pages/Dashboard";
import Compose from "./pages/Compose";
import Inbox from "./pages/Inbox";
import { Domains } from "./pages/Domains";
import { Mailboxes } from "./pages/Mailboxes";
import { VersionFooter } from "./components/VersionFooter";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3b82f6",
    },
    secondary: {
      main: "#22c55e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/mailboxes" element={<Mailboxes />} />
        </Routes>
        <VersionFooter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
