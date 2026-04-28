import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  CarFront,
  Repeat,
  UserCog,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addActivity,
  addWalletTxn,
  getWalletBalance,
  type LicenseActivity,
  type LicenseService,
  type LicenseStatus,
  type WalletTxn,
} from "@/lib/license-store";
import { toast } from "@/hooks/use-toast";
import winOneLogo from "@/assets/winone-logo.png";

const statusBadge = (s: LicenseStatus) => {
  const map: Record<LicenseStatus, { icon: JSX.Element; cls: string; label: string }> = {
    pending: { icon: <Clock size={12} />, cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Pending" },
    in_review: { icon: <Loader2 size={12} className="animate-spin" />, cls: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "In review" },
    approved: { icon: <CheckCircle2 size={12} />, cls: "bg-green-500/10 text-green-500 border-green-500/30", label: "Approved" },
    rejected: { icon: <XCircle size={12} />, cls: "bg-red-500/10 text-red-500 border-red-500/30", label: "Rejected" },
  };
  const v = map[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${v.cls}`}>
      {v.icon}
      {v.label}
    </span>
  );
};

type ServiceField = { key: string; label: string; placeholder?: string; multiline?: boolean };

type ServiceConfig = {
  value: LicenseService;
  label: string;
  description: string;
  type: "new" | "renewal";
  fee: number;
  titleField: string; // which field key to use for the activity title
  fields: ServiceField[];
};

const SERVICES: ServiceConfig[] = [
  {
    value: "tokunbo",
    label: "Tokunbo car registration",
    description: "First-time registration for a foreign-used (Tokunbo) vehicle.",
    type: "new",
    fee: 150,
    titleField: "chassisNumber",
    fields: [
      { key: "name", label: "Full name", placeholder: "Owner's full name" },
      { key: "address", label: "Address", placeholder: "Residential address", multiline: true },
      { key: "phoneNumber", label: "Phone number", placeholder: "+234..." },
      { key: "chassisNumber", label: "Chassis number", placeholder: "Vehicle chassis (VIN)" },
      { key: "color", label: "Vehicle color", placeholder: "e.g. Black" },
    ],
  },
  {
    value: "plate_renewal",
    label: "Plate number renewal (Nigerian used)",
    description: "Renew the plate number of a Nigerian-used vehicle.",
    type: "renewal",
    fee: 80,
    titleField: "plateAllocation",
    fields: [
      { key: "proofOfOwnership", label: "Proof of ownership", placeholder: "Document reference / ID number" },
      { key: "plateAllocation", label: "Plate number allocation", placeholder: "e.g. ABC-123-XY" },
      { key: "vehicleLicense", label: "Vehicle license", placeholder: "License number" },
      { key: "proofOfOwnership2", label: "Proof of ownership (secondary)", placeholder: "Additional proof reference" },
    ],
  },
  {
    value: "change_of_ownership",
    label: "Change of ownership",
    description: "Transfer ownership from a previous owner to a new owner.",
    type: "new",
    fee: 200,
    titleField: "prevPlateAllocation",
    fields: [
      { key: "prevPlateAllocation", label: "Previous owner — plate allocation", placeholder: "Plate of previous owner" },
      { key: "prevProofOfOwnership", label: "Previous owner — proof of ownership", placeholder: "Document reference" },
      { key: "prevVehicleLicense", label: "Previous owner — vehicle license", placeholder: "License number" },
      { key: "newOwnerName", label: "New owner — name", placeholder: "Full name" },
      { key: "newOwnerAddress", label: "New owner — address", placeholder: "Residential address", multiline: true },
      { key: "newOwnerPhone", label: "New owner — phone number", placeholder: "+234..." },
      { key: "purchaseReceipt", label: "Purchase receipt (if applicable)", placeholder: "Receipt number / reference" },
    ],
  },
];

const SUB_SERVICES: ServiceConfig[] = [
  {
    value: "Driver's_License_renewal",
    label: "Driver's License renewal",
    description: "Renew your driver's vehicle license.",
    type: "renewal",
    fee: 150,
    titleField: "chassisNumber",
    fields: [
      { key: "name", label: "Full name", placeholder: "Owner's full name" },
      { key: "address", label: "Address", placeholder: "Residential address", multiline: true },
      { key: "phoneNumber", label: "Phone number", placeholder: "+234..." },
      { key: "chassisNumber", label: "Chassis number", placeholder: "Vehicle chassis (VIN)" },
      { key: "color", label: "Vehicle color", placeholder: "e.g. Black" },
    ],
  },
  {
    value: "motor_vehicle_third_party_insurance",
    label: "Motor vehicle third party insurance",
    description: "Renew your motor vehicle third party insurance.",
    type: "renewal",
    fee: 80,
    titleField: "plateAllocation",
    fields: [
      { key: "proofOfOwnership", label: "Proof of ownership", placeholder: "Document reference / ID number" },
      { key: "plateAllocation", label: "Plate number allocation", placeholder: "e.g. ABC-123-XY" },
      { key: "vehicleLicense", label: "Vehicle license", placeholder: "License number" },
      { key: "proofOfOwnership2", label: "Proof of ownership (secondary)", placeholder: "Additional proof reference" },
    ],
  },
  {
    value: "motor_vehicle_tinted_glass_permit",
    label: "Motor vehicle tinted glass permit",
    description: "Renew your motor vehicle tinted glass permit.",
    type: "renewal",
    fee: 200,
    titleField: "prevPlateAllocation",
    fields: [
      { key: "prevPlateAllocation", label: "Previous owner — plate allocation", placeholder: "Plate of previous owner" },
      { key: "prevProofOfOwnership", label: "Previous owner — proof of ownership", placeholder: "Document reference" },
      { key: "prevVehicleLicense", label: "Previous owner — vehicle license", placeholder: "License number" },
      { key: "newOwnerName", label: "New owner — name", placeholder: "Full name" },
      { key: "newOwnerAddress", label: "New owner — address", placeholder: "Residential address", multiline: true },
      { key: "newOwnerPhone", label: "New owner — phone number", placeholder: "+234..." },
      { key: "purchaseReceipt", label: "Purchase receipt (if applicable)", placeholder: "Receipt number / reference" },
    ],
  },
  {
    value: "motor_vehicle_license",
    label: "Motor vehicle license",
    description: "Renew your private motor vehicle license.",
    type: "renewal",
    fee: 200,
    titleField: "prevPlateAllocation",
    fields: [
      { key: "prevPlateAllocation", label: "Previous owner — plate allocation", placeholder: "Plate of previous owner" },
      { key: "prevProofOfOwnership", label: "Previous owner — proof of ownership", placeholder: "Document reference" },
      { key: "prevVehicleLicense", label: "Previous owner — vehicle license", placeholder: "License number" },
      { key: "newOwnerName", label: "New owner — name", placeholder: "Full name" },
      { key: "newOwnerAddress", label: "New owner — address", placeholder: "Residential address", multiline: true },
      { key: "newOwnerPhone", label: "New owner — phone number", placeholder: "+234..." },
      { key: "purchaseReceipt", label: "Purchase receipt (if applicable)", placeholder: "Receipt number / reference" },
    ],
  },
  {
    value: "certificate_roadworthiness",
    label: "Certificate_roadworthiness",
    description: "Renew your private motor vehicle license.",
    type: "renewal",
    fee: 200,
    titleField: "prevPlateAllocation",
    fields: [
      { key: "prevPlateAllocation", label: "Previous owner — plate allocation", placeholder: "Plate of previous owner" },
      { key: "prevProofOfOwnership", label: "Previous owner — proof of ownership", placeholder: "Document reference" },
      { key: "prevVehicleLicense", label: "Previous owner — vehicle license", placeholder: "License number" },
      { key: "newOwnerName", label: "New owner — name", placeholder: "Full name" },
      { key: "newOwnerAddress", label: "New owner — address", placeholder: "Residential address", multiline: true },
      { key: "newOwnerPhone", label: "New owner — phone number", placeholder: "+234..." },
      { key: "purchaseReceipt", label: "Purchase receipt (if applicable)", placeholder: "Receipt number / reference" },
    ],
  },
];

const REGISTRATION_GROUPS = [
  {
    title: "Register a new car",
    description: "Start the required first-registration services for a locally purchased vehicle.",
    services: SERVICES.filter((service) => service.value !== "tokunbo"),
  },
  {
    title: "Register a Tokunbo car",
    description: "Complete first registration for a foreign-used vehicle with the supporting services.",
    services: SERVICES.filter((service) => service.value === "tokunbo"),
  },
];

const ALL_SERVICES = [...SUB_SERVICES, ...SERVICES];

const LicenseDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [activities, setActivities] = useState<LicenseActivity[]>([]);

  // Dialog states
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("100");

  const [regOpen, setRegOpen] = useState(false);
  const [serviceFlow, setServiceFlow] = useState<"subscription" | "direct">("direct");
  const [serviceValue, setServiceValue] = useState<LicenseService>("motor_vehicle_license");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const activeService = useMemo(
    () => ALL_SERVICES.find((s) => s.value === serviceValue) ?? ALL_SERVICES[0],
    [serviceValue],
  );

  useEffect(() => {
    const raw = localStorage.getItem("userData");
    if (!raw) {
      navigate("/license/login");
      return;
    }
    setUser(JSON.parse(raw));
    refresh();
  }, [navigate]);

  const refresh = () => {
    setBalance(WalletBalance());
    setTxns(WalletTxns());
    setActivities(accActivities());
  };

  const pendingCount = useMemo(
    () => activities.filter((a) => a.status === "pending" || a.status === "in_review").length,
    [activities],
  );

  function WalletBalance() {
    const rawUserData = JSON.parse(localStorage.getItem("userData"));
    // console.log("rawUserData: ", rawUserData);
    return rawUserData.licensingData.walletBalance !== undefined ? rawUserData.licensingData.walletBalance : 0.00;
  };

  function WalletTxns() {
    const raw = JSON.parse(localStorage.getItem("userData") || "{}");

    const txns = raw?.licensingData?.walletTrxLogs;

    console.log("walletTrxLogs:", txns);

    return Array.isArray(txns?.transactions) ? txns.transactions : [];
  };

  function accActivities() {
    const raw = JSON.parse(localStorage.getItem("userData") || "{}");

    const actvt = raw?.licensingData?.licensingLogs;

    console.log("licensingLogs:", actvt);

    return Array.isArray(actvt?.activities) ? actvt.activities : [];
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0.", variant: "destructive" });
      return;
    }
    addWalletTxn({ kind: "deposit", amount: amt, description: "Wallet deposit" });
    setDepositOpen(false);
    setDepositAmount("100");
    refresh();
    toast({ title: "Deposit successful", description: `N${amt.toFixed(2)} added to your wallet.` });
  };

  const openSubscription = () => {
    setServiceValue("motor_vehicle_license");
    setServiceFlow("subscription");
    setFormValues({});
    setRegOpen(true);
  };

  const openService = (value: LicenseService) => {
    setServiceValue(value);
    setServiceFlow("direct");
    setFormValues({});
    setRegOpen(true);
  };

  const handleServiceChange = (v: LicenseService) => {
    setServiceValue(v);
    setFormValues({});
  };

  const handleSubmit = () => {
    const required = activeService.fields.filter((f) => f.key !== "purchaseReceipt");
    const missing = required.find((f) => !formValues[f.key]?.trim());
    if (missing) {
      toast({
        title: "Missing field",
        description: `Please fill in "${missing.label}".`,
        variant: "destructive",
      });
      return;
    }
    if (getWalletBalance() < activeService.fee) {
      toast({
        title: "Insufficient balance",
        description: `You need N${activeService.fee} to submit. Please deposit funds first.`,
        variant: "destructive",
      });
      return;
    }
    const title = formValues[activeService.titleField] || activeService.label;
    addWalletTxn({
      kind: "charge",
      amount: activeService.fee,
      description: `${activeService.label} — ${title}`,
    });
    addActivity({
      type: activeService.type,
      service: activeService.value,
      serviceLabel: activeService.label,
      title,
      details: { ...formValues },
      fee: activeService.fee,
    });
    setRegOpen(false);
    setFormValues({});
    refresh();
    toast({ title: "Submitted", description: "Your request is now pending review." });
  };

  // const handleSend = () => {
  //   const text = chatInput.trim();
  //   if (!text) return;
  //   addChatMessage("user", text);
  //   setChatInput("");
  //   setMessages(getChatMessages());
  //   setTimeout(() => {
  //     addChatMessage(
  //       "agent",
  //       "Thanks for reaching out! An agent will follow up shortly. Meanwhile, you can check the status of your activities in the Pending tab.",
  //     );
  //     setMessages(getChatMessages());
  //   }, 700);
  // };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/license/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <div className="relative z-10 container max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Dashboard</span>
              <span>/</span>
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs" type="button">
                <Link to="/license/profile">
                <UserCog size={14} /> Account profile & settings
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <img src={winOneLogo} alt="WinOne logo" className="h-8 w-8 rounded-md object-contain" />
              <h1 className="text-3xl font-bold text-foreground">Licensing Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground">Welcome back, {user.fullName.split(" ")[0]}.</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open account menu">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Account menu</SheetTitle>
                <SheetDescription>{user.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <Button asChild variant="outline" className="h-12 w-full justify-start">
                  <Link to="/license/profile">
                    <UserRound size={16} /> Account profile
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full justify-start">
                  <Link to="/license/settings">
                    <Settings size={16} /> Account settings
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 w-full justify-start" onClick={handleLogout}>
                  <LogOut size={16} /> Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Top stat cards */}
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <motion.div className="h-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet size={16} /> Wallet balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">N{balance}</div>
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="mt-3">
                      <Plus size={14} /> Deposit funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit funds</DialogTitle>
                      <DialogDescription>Add money to your wallet to pay for licensing services.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (Naira)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                      <div className="flex gap-2 pt-1">
                        {[50, 100, 250, 500].map((v) => (
                          <Button key={v} type="button" variant="outline" size="sm" onClick={() => setDepositAmount(String(v))}>
                            N{v}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDepositOpen(false)}>Cancel</Button>
                      <Button onClick={handleDeposit}>Deposit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock size={16} /> Pending activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review or approval</p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Repeat size={16} /> Recurring subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activities.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Auto-renews when each license expires</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={openSubscription}>
                <Plus size={14} /> Subscribe to a service
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle registration</CardTitle>
            <CardDescription>Select the car type, then choose the registration service you need.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {REGISTRATION_GROUPS.map((group) => (
              <div key={group.title} className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <CarFront size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{group.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  {group.services.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => openService(s.value)}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-left transition-colors hover:border-primary/60 hover:bg-card"
                    >
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      <span className="text-xs font-semibold text-primary">N{s.fee}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start a one-time service payment</CardTitle>
            <CardDescription>Pay once for a service without creating a recurring renewal subscription.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {SUB_SERVICES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => openService(s.value)}
                className="text-left rounded-lg border border-border bg-card/50 p-4 hover:border-primary/60 hover:bg-card transition-colors"
              >
                <div className="font-semibold text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
                <div className="mt-3 text-xs text-primary font-medium">Fee: N{s.fee}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Service form dialog */}
        <Dialog open={regOpen} onOpenChange={setRegOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeService.label}</DialogTitle>
              <DialogDescription>{activeService.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {serviceFlow === "subscription" && (
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={serviceValue} onValueChange={(v) => handleServiceChange(v as LicenseService)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_SERVICES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} (N{s.fee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeService.fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.multiline ? (
                    <Textarea
                      id={f.key}
                      placeholder={f.placeholder}
                      value={formValues[f.key] ?? ""}
                      onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      placeholder={f.placeholder}
                      value={formValues[f.key] ?? ""}
                      onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Submitting will deduct <span className="font-semibold text-foreground">N{activeService.fee}</span> from your wallet. Subscribed renewal services will recur when the license expires.
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRegOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit & pay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            {/* <TabsTrigger value="chat">
              <MessageSquare size={14} className="mr-1" /> Agent chat
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Licensing activities</CardTitle>
                <CardDescription>All your pending and completed requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activities yet. Pick a service above to get started.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {activities.map((a) => (
                      <div key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{a.title}</span>
                            <span className="text-xs text-muted-foreground">{a.serviceLabel}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">N{a.fee.toFixed(2)}</span>
                          {statusBadge(a.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Wallet history</CardTitle>
                <CardDescription>Deposits and charges for licensing services.</CardDescription>
              </CardHeader>
              <CardContent>
                {txns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {txns.map((t) => (
                      <div key={t.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{t.description}</div>
                          <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
                        </div>
                        <div className={t.kind === "deposit" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                          {t.kind === "deposit" ? "+" : "-"}N{t.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat with an agent</CardTitle>
                <CardDescription>Get help with your licensing requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-y-auto rounded-md border border-border bg-background/50 p-3 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center mt-24">
                      Start a conversation — an agent will reply shortly.
                    </p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button onClick={handleSend}>
                    <Send size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>

        <div className="text-center pt-4">
          <Link to="/license/login" className="text-xs text-muted-foreground hover:text-foreground">
            Switch account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LicenseDashboard;
