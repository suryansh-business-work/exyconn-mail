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
  name: Yup.string().min(2, "Min 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Min 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        showToast("Account created successfully!");
        navigate("/dashboard");
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Registration failed";
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
            Create Account
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Join Exyconn Mail
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              margin="normal"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
            />
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              margin="normal"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                !!formik.errors.confirmPassword
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              sx={{ mt: 2, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <Typography variant="body2" textAlign="center">
            Already have an account?{" "}
            <MuiLink component={Link} to="/login" underline="hover">
              Sign In
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
