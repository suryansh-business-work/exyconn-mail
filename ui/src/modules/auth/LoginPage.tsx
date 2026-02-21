import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../modules/auth/AuthContext";
import { useToast } from "../../hooks/useToast";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Min 6 characters")
    .required("Password is required"),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        showToast("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Login failed";
        showToast(msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: "background.default", px: 2 }}
    >
      <Card sx={{ maxWidth: 440, width: "100%" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Exyconn Mail
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Sign in to your account
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && !!formik.errors.email}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && !!formik.errors.password}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              sx={{ mt: 2, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <Typography variant="body2" textAlign="center">
            Don&apos;t have an account?{" "}
            <MuiLink component={Link} to="/register" underline="hover">
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
