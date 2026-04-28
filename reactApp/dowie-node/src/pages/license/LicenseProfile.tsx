import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import winOneLogo from "@/assets/winone-logo.png";

const LicenseProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData") || "null") as { fullName?: string; email?: string } | null;

  if (!user) {
    navigate("/license/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <main className="relative z-10 container max-w-3xl py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/license/dashboard">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <div className="mb-3 flex items-center gap-2">
              <img src={winOneLogo} alt="WinOne logo" className="h-8 w-8 rounded-md object-contain" />
              <span className="font-semibold text-foreground">WinOne Licensing</span>
            </div>
            <CardTitle>Account profile</CardTitle>
            <CardDescription>Your licensing account information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <UserRound size={16} className="text-primary" /> Full name
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">{user.fullName || "Not provided"}</div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" /> Email address
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">{user.email || "Not provided"}</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LicenseProfile;