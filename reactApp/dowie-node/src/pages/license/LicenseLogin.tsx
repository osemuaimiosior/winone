import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import winOneLogo from "@/assets/winone-logo.png";

const LicenseLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const response = await fetch(`${backendUrl}/api/v1/licensing/account-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          EMAIL: email,
          PASSWORD: password,
        }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.ok && data.StatusCode === 200) {
        localStorage.setItem('userData', JSON.stringify(data.userData));
        // localStorage.setItem('licensingData', JSON.stringify(data.licensingData));
       
        navigate("/license/dashboard", { replace: true });
      } else {
        setError(data.Data || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // setError(err instanceof Error ? "Try again later" : "Network error. Please try again.");
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <BackButton to="/license" label="Back to home" className="mb-4" />
        <div className="text-center mb-8">
          <Link to="/license" className="inline-flex items-center gap-2 mb-6">
            <img src={winOneLogo} alt="WinOne logo" className="h-8 w-8 rounded-md object-contain" />
            <span className="text-lg font-bold text-foreground">
              Win<span className="text-gradient-primary">One</span> Licensing
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm">Access your vehicle licensing dashboard.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/license/signup" className="text-primary hover:text-primary/80 font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LicenseLogin;
