import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import winOneLogo from "@/assets/winone-logo.png";

const LicenseSettings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData") || "null") as { email?: string } | null;

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
            <CardTitle>Account settings</CardTitle>
            <CardDescription>Manage preferences for {user.email}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <Bell size={18} className="mt-0.5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Service notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates about payments and license status.</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Security alerts</div>
                  <div className="text-sm text-muted-foreground">Get notified when account access changes.</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LicenseSettings;