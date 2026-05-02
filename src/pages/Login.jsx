import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser } from "../utils/auth";
import { API_BASE_URL, BACKEND_BASE_URL } from "@/utils/api";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
  Zoom,
  Divider
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  AdminPanelSettings,
  WhatsApp,
  Forest,
  Spa,
  Grass
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import { motion } from "framer-motion";

// Import Navbar dan Footer
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

// Warna tema
const colors = {
  green: {
    light: "#4ade80", // hijau muda
    main: "#22c55e", // hijau
    dark: "#16a34a", // hijau tua
    darker: "#15803d", // hijau lebih tua
    forest: "#14532d", // hijau hutan
    leaf: "#86efac", // hijau daun
  },
  gold: {
    light: "#fcd34d", // emas muda
    main: "#fbbf24", // emas
    dark: "#f59e0b", // emas tua
    deeper: "#d97706", // emas lebih tua
  },
  silver: {
    light: "#f3f4f6", // silver sangat muda
    main: "#e5e7eb", // silver
    dark: "#9ca3af", // silver tua
    charcoal: "#4b5563", // abu-abu arang
  }
};

// Animasi daun berjatuhan
const leafFall = keyframes`
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0.2;
  }
`;

// Animasi gradient yang bergerak (seperti ombak di hutan)
const forestGradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled components dengan nuansa hijau daun, emas, dan silver
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: "32px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: `0 25px 50px -12px ${colors.green.darker}40`,
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${colors.gold.light}30`,
  width: "100%",
  maxWidth: "450px",
  margin: "0 auto",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: `0 30px 60px -12px ${colors.green.forest}60`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${colors.green.main}, ${colors.gold.main}, ${colors.green.main})`,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${colors.gold.main}, ${colors.green.main}, ${colors.gold.main})`,
  }
}));

// Background dengan elemen daun
const ForestBackground = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: `linear-gradient(135deg, ${colors.green.darker}, ${colors.green.forest}, ${colors.green.dark})`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 30% 50%, ${colors.gold.light}20 0%, transparent 50%)`,
  }
});

// Elemen daun dekoratif
const Leaf = styled(Box)(({ delay, left, size, rotation }) => ({
  position: "absolute",
  top: "-10vh",
  left: left || `${Math.random() * 100}%`,
  fontSize: size || "24px",
  color: colors.green.leaf,
  opacity: 0.6,
  animation: `${leafFall} ${15 + Math.random() * 10}s linear infinite`,
  animationDelay: delay || "0s",
  transform: `rotate(${rotation || 0}deg)`,
  zIndex: 0,
  pointerEvents: "none",
  textShadow: `0 0 10px ${colors.gold.light}40`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: `${colors.silver.light}`,
    backdropFilter: "blur(5px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: `1px solid ${colors.gold.light}30`,
    "&:hover": {
      backgroundColor: "#ffffff",
      transform: "translateY(-2px)",
      boxShadow: `0 8px 20px ${colors.green.main}40`,
      border: `1px solid ${colors.gold.main}`,
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      transform: "translateY(-2px)",
      boxShadow: `0 8px 25px ${colors.green.main}60`,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.gold.main,
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: colors.silver.charcoal,
    "&.Mui-focused": {
      color: colors.gold.dark,
      fontWeight: 600,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "14px 24px",
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
  background: `linear-gradient(135deg, ${colors.green.main} 0%, ${colors.gold.main} 50%, ${colors.green.main} 100%)`,
  backgroundSize: "200% auto",
  boxShadow: `0 8px 20px ${colors.green.dark}60`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  color: "white",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 12px 30px ${colors.gold.dark}80`,
    backgroundPosition: "right center",
  },
  "&:disabled": {
    background: `linear-gradient(135deg, ${colors.silver.dark} 0%, ${colors.silver.main} 100%)`,
  },
}));

const LogoContainer = styled(Box)({
  width: "100px",
  height: "100px",
  borderRadius: "20px",
  background: `linear-gradient(135deg, ${colors.green.light}20, ${colors.gold.light}20)`,
  margin: "0 auto 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 10px 30px ${colors.green.dark}40`,
  position: "relative",
  overflow: "hidden",
  border: `2px solid ${colors.gold.main}`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: "24px",
    background: `linear-gradient(135deg, ${colors.green.main} 0%, ${colors.gold.main} 100%)`,
    opacity: 0.3,
    zIndex: -1,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at 30% 30%, ${colors.gold.light}40, transparent 70%)`,
  },
});

const WhatsAppButton = styled(Button)(({ theme }) => ({
  color: colors.green.dark,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
  padding: "8px 16px",
  borderRadius: "30px",
  backgroundColor: `${colors.green.light}20`,
  border: `1px solid ${colors.green.main}40`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: `${colors.green.light}40`,
    transform: "translateY(-2px)",
    boxShadow: `0 5px 15px ${colors.green.main}40`,
    border: `1px solid ${colors.gold.main}`,
  },
  "& .MuiButton-startIcon": {
    color: colors.green.main,
  },
}));

// Wrapper untuk halaman login dengan padding-top untuk navbar
const PageWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const ContentWrapper = styled(Box)({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem 1rem",
  marginTop: "73px",
  marginBottom: "auto",
  position: "relative",
});

const FooterWrapper = styled(Box)({
  marginTop: "auto",
});

const GoldDivider = styled(Divider)({
  margin: "20px 0 15px",
  background: `linear-gradient(90deg, transparent, ${colors.gold.main}, transparent)`,
  height: "2px",
});

function Login() {
  const navigate = useNavigate();
  const logoUrl = `${BACKEND_BASE_URL}/uploads/profil/logo.png`;
  
  // State untuk form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  // State untuk UI
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [isLogoError, setIsLogoError] = useState(false);

  // State untuk validasi
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // Constants
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_DURATION = 300; // 5 menit dalam detik
  const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp desa
  const WHATSAPP_MESSAGE = "Halo%20Admin%20Desa%2C%20saya%20ingin%20reset%20password%20akun%20SIDA%20Cengkilung"; // Pesan default

  // 🔒 Cek session
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (token && user) {
      redirectBasedOnRole(user.role);
    }
  }, [navigate]);

  // Timer untuk lock
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const redirectBasedOnRole = (role) => {
    switch(role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "masyarakat":
        navigate("/");
        break;
      default:
        setError("Role tidak dikenali");
    }
  };

  // Validasi form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email wajib diisi";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password wajib diisi";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (error) setError("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Akun terkunci. Silakan coba lagi dalam ${Math.floor(lockTimer / 60)}:${(lockTimer % 60).toString().padStart(2, '0')} menit`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Device-Info": navigator.userAgent,
          },
          timeout: 10000,
        }
      );

      const { token, user } = response.data.data;

      // Simpan token dan user di localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("lastLogin", new Date().toISOString());

      // Reset login attempts
      setLoginAttempts(0);
      setSuccess("Login berhasil! Mengalihkan...");

      // Redirect setelah delay
      setTimeout(() => {
        redirectBasedOnRole(user.role);
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login gagal";
      
      if (error.code === "ECONNABORTED") {
        errorMessage = "Koneksi timeout. Silakan coba lagi.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Email atau password salah";
        
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLocked(true);
          setLockTimer(LOCK_DURATION);
          errorMessage = `Terlalu banyak percobaan login. Akun terkunci selama ${Math.floor(LOCK_DURATION / 60)} menit.`;
        }
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        errorMessage = error.message || "Terjadi kesalahan";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatLockTime = () => {
    const minutes = Math.floor(lockTimer / 60);
    const seconds = lockTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate random leaves
  const leaves = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    size: `${20 + Math.random() * 20}px`,
    rotation: Math.random() * 360,
    icon: i % 3 === 0 ? "🌿" : i % 3 === 1 ? "🍃" : "🌱"
  }));

  return (
    <PageWrapper>
      <ForestBackground />
      
      {/* Decorative leaves */}
      {leaves.map((leaf) => (
        <Leaf
          key={leaf.id}
          left={leaf.left}
          delay={leaf.delay}
          size={leaf.size}
          rotation={leaf.rotation}
        >
          {leaf.icon}
        </Leaf>
      ))}
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <ContentWrapper>
        <Container maxWidth="xs" sx={{ px: 2, position: "relative", zIndex: 10 }}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <StyledPaper elevation={0}>
              {/* Header dengan desain elegan */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LogoContainer>
                  {isLogoError ? (
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${colors.green.main}, ${colors.gold.main})`,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Forest sx={{ fontSize: 50, color: "white" }} />
                    </Box>
                  ) : (
                    <img 
                      src={logoUrl}
                      alt="Logo Desa Adat Cengkilung"
                      className="w-full h-full object-contain p-2"
                      onError={() => setIsLogoError(true)}
                    />
                  )}
                </LogoContainer>
                
                <Box textAlign="center" mb={3}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                      background: `linear-gradient(135deg, ${colors.green.darker} 0%, ${colors.gold.dark} 50%, ${colors.green.dark} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                      fontSize: { xs: "1.8rem", sm: "2rem" },
                      textShadow: `2px 2px 4px ${colors.green.light}40`,
                    }}
                  >
                    DESA ADAT
                  </Typography>
                  
                  <Typography 
                    variant="h5"
                    sx={{ 
                      color: colors.silver.charcoal,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      mt: -0.5,
                      mb: 1
                    }}
                  >
                    CENGKILUNG
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      mt: 1,
                      px: 3,
                      py: 1,
                      borderRadius: "30px",
                      background: `linear-gradient(135deg, ${colors.green.light}20, ${colors.gold.light}20)`,
                      border: `1px solid ${colors.gold.main}40`,
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <Spa sx={{ fontSize: 18, color: colors.green.dark, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: colors.green.darker, fontWeight: 600 }}>
                      SIDA • Harmoni Alam & Teknologi
                    </Typography>
                    <Grass sx={{ fontSize: 18, color: colors.green.dark, ml: 0.5 }} />
                  </Box>
                </Box>
              </motion.div>

              {/* Alert messages */}
              <Fade in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: "16px",
                    "& .MuiAlert-message": { width: "100%" },
                    border: `1px solid ${colors.gold.dark}40`,
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                  {isLocked && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                      Waktu tunggu: {formatLockTime()}
                    </Typography>
                  )}
                </Alert>
              </Fade>

              <Fade in={!!success}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: "16px",
                    border: `1px solid ${colors.green.main}40`,
                  }}
                >
                  {success}
                </Alert>
              </Fade>

              {/* Login form */}
              <form onSubmit={handleLogin}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <StyledTextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    id="email"
                    name="email"
                    label="Alamat Email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    disabled={loading || isLocked}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: colors.green.dark }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <StyledTextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                    disabled={loading || isLocked}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: colors.green.dark }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: colors.silver.charcoal }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </motion.div>

                {/* Informasi login attempts */}
                {loginAttempts > 0 && !isLocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Box 
                      sx={{ 
                        mb: 2,
                        p: 1.5,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${colors.gold.light}20, ${colors.green.light}20)`,
                        border: `1px solid ${colors.gold.main}40`,
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: colors.green.darker,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 500
                        }}
                      >
                        <Spa sx={{ fontSize: 16, mr: 0.5 }} />
                        Percobaan login: {loginAttempts} dari {MAX_LOGIN_ATTEMPTS}
                        <Grass sx={{ fontSize: 16, ml: 0.5 }} />
                      </Typography>
                    </Box>
                  </motion.div>
                )}

                {/* Login button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <StyledButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || isLocked}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      <>
                        <LoginIcon sx={{ mr: 1 }} />
                        Masuk ke Sistem
                      </>
                    )}
                  </StyledButton>
                </motion.div>

                {/* Gold Divider */}
                <GoldDivider />

                {/* Lupa Password - Hubungi Admin via WhatsApp */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Box textAlign="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.silver.charcoal,
                        mb: 1,
                        fontWeight: 500
                      }}
                    >
                      Lupa Kata Sandi?
                    </Typography>
                    
                    <WhatsAppButton
                      component="a"
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<WhatsApp />}
                      fullWidth
                    >
                      Hubungi Admin Desa
                    </WhatsAppButton>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.silver.dark,
                        display: "block",
                        mt: 1,
                        fontStyle: "italic"
                      }}
                    >
                      Admin akan membantu mereset password Anda
                    </Typography>
                  </Box>
                </motion.div>

                {/* Link ke halaman utama (tetap ada sebagai opsi) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Box mt={2} textAlign="center">
                    <Typography variant="caption" sx={{ color: colors.silver.dark }}>
                      Atau{" "}
                      <Button
                        component={Link}
                        to="/"
                        sx={{
                          color: colors.green.dark,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          "&:hover": {
                            background: "transparent",
                            textDecoration: "underline",
                            color: colors.gold.dark,
                          }
                        }}
                      >
                        Kembali ke Beranda
                      </Button>
                    </Typography>
                  </Box>
                </motion.div>
              </form>
            </StyledPaper>
          </Zoom>
        </Container>
      </ContentWrapper>

      {/* Footer */}
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    </PageWrapper>
  );
}

export default Login;