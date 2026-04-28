import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  LogOut,
  User,
  LineChart,
  Cpu,
  RefreshCw,
  Wallet,
  Activity,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import winOneLogo from "@/assets/winone-logo.png";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  token: string;
  accessToken: string;
}

interface NodeData {
  id: string;
  nodeId: string;
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  lastHeartbeat: string;
  [key: string]: any;
}

// ----------------------------------------------------------------------------
const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [nodeData, setNodeData] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);


  useEffect(() => {
  const loadData = async () => {
    try {
      const storedUserData = localStorage.getItem('userData');
        //  console.log("user data: ", storedUserData)

      if (!storedUserData) {
        navigate('/');
        return;
      }

      const user = JSON.parse(storedUserData);
   
      setUserData(user);

      // 🔥 ALWAYS fetch fresh nodes
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const res = await fetch(`${backendUrl}/api/v1/get-user-nodes`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      const data = await res.json();

      console.log("Fetched nodes:", data);

      setNodeData(Array.isArray(data.nodes) ? data.nodes : []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // try {
    //   // Refresh from localStorage (in a real app, you'd fetch updated data from API)
    //   const storedUserData = localStorage.getItem('userData');
    //   const storedNodeData = localStorage.getItem('nodeData');
      
    //   if (storedUserData) {
    //     setUserData(JSON.parse(storedUserData));
    //   }
    //   if (storedNodeData) {
    //     const parsedNodes = JSON.parse(storedNodeData);
    //     setNodeData(Array.isArray(parsedNodes) ? parsedNodes : []);
    //   }
      
    //   toast({ title: "Dashboard refreshed", description: "Data updated successfully." });
    // } catch (error) {
    //   toast({ title: "Error", description: "Failed to refresh data" });
    // } finally {
    //   setRefreshing(false);
    // }

    try {
      const storedUserData = localStorage.getItem('userData');

      if (!storedUserData) {
        navigate('/');
        return;
      }

      const user = JSON.parse(storedUserData);
   
      setUserData(user);

      // 🔥 ALWAYS fetch fresh nodes
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const res = await fetch(`${backendUrl}/api/v1/get-user-nodes`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      const data = await res.json();

      console.log("Fetched nodes:", data);

      setNodeData(Array.isArray(data.nodes) ? data.nodes : []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {

    try {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData?.accessToken) {

       const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (err) {
    console.error('Logout API failed:', err);
  } finally {
    // Always clear local data
    localStorage.removeItem('userData');
    localStorage.removeItem('nodeData');
    navigate('/');
  }

  };

  const handleCopyToken = async () => {
    if (!userData?.token) return;

    await navigator.clipboard.writeText(userData.token);
    setCopiedToken(true);
    toast({ title: "Token copied", description: "Your token has been copied to clipboard." });
    setTimeout(() => setCopiedToken(false), 1500);
  };

  const handleRequestNewToken = async () => {
    if (!userData?.email) return;

    setRequestingToken(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/v1/account-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ EMAIL: userData.email }),
      });
      const data = await response.json();

      if (data.StatusCode === 200 && data.Data?.token) {
        const updatedUser = {
          ...userData,
          token: data.Data.token,
        };
        setUserData(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        toast({ title: "Token refreshed", description: "A new token was generated." });
      } else {
        toast({ title: "Token refresh failed", description: data.Data || "Unable to generate a new token." });
      }
    } catch (error) {
      toast({ title: "Request failed", description: "Could not request a new token." });
    } finally {
      setRequestingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="text-destructive">No user data found. Please log in again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Top bar */}
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={winOneLogo} alt="WinOne logo" className="h-8 w-8 rounded-md object-contain" />
            <span className="text-lg font-bold text-foreground">
              Win<span className="text-gradient-primary">One</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* <Button asChild variant="ghost" size="sm">
              <Link to="/tools/monte-carlo">
                <LineChart size={16} /> Monte Carlo
              </Link>
            </Button> */}
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="absolute inset-0 bg-glow pointer-events-none" />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userData.fullName.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here's your account information and registered nodes.
            </p>
          </div>

          {/* Earnings & Runs Summary */}
          {(() => {
            const PER_RUN_RATE = 0.05; // USD per run
            const nodesWithRuns = nodeData.map((n) => ({
              ...n,
              runs: Number(n.runs ?? n.totalRuns ?? n.jobsCompleted ?? 0),
            }));
            const totalRuns = nodesWithRuns.reduce((acc, n) => acc + n.runs, 0);
            const earnings = totalRuns * PER_RUN_RATE;
            const topNode = [...nodesWithRuns].sort((a, b) => b.runs - a.runs)[0];

            return (
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Wallet size={16} className="text-primary" /> Earnings wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">${earnings.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned across {nodeData.length} node{nodeData.length === 1 ? "" : "s"} @ ${PER_RUN_RATE.toFixed(2)}/run
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity size={16} className="text-primary" /> Total runs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{totalRuns.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">All jobs completed by your nodes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Cpu size={16} className="text-primary" /> Top performing node
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-foreground truncate">
                      {topNode?.nodeId || "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topNode ? `${topNode.runs.toLocaleString()} runs` : "No nodes yet"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          <Card className="mb-8">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                <CardTitle className="text-base">User Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-foreground mt-1">{userData.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-foreground mt-1">{userData.lastName}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground mt-1">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-foreground mt-1">{userData.phoneNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground mt-1">{userData.fullName}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Token</label>
                  <div className="mt-1 flex flex-col gap-2">
                    <code className="text-foreground text-xs break-all font-mono bg-muted/40 p-3 rounded-md">
                      {userData.token
                        ? showToken
                          ? userData.token
                          : `${userData.token.slice(0, 12)}${'•'.repeat(Math.max(0, Math.min(userData.token.length - 16, 24)))}${userData.token.slice(-4)}`
                        : 'N/A'}
                    </code>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setShowToken((v) => !v)}>
                        {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleCopyToken} disabled={!userData.token}>
                        {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                      <Button variant="outline" onClick={handleRequestNewToken} disabled={requestingToken}>
                        <RefreshCw size={14} className={requestingToken ? 'animate-spin' : ''} /> Request new token
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nodes Information */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-primary" />
                <CardTitle className="text-base">Registered Nodes</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {nodeData.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {nodeData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No nodes registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Node ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">CPU Usage</TableHead>
                        <TableHead className="text-right">Total Installed RAM</TableHead>
                        <TableHead className="text-right">CPU Cores</TableHead>
                        <TableHead className="text-right">Platform</TableHead>
                        <TableHead className="text-right">Location/Time Zone</TableHead>
                        <TableHead className="text-right">Runs</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                        <TableHead>Last Heartbeat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nodeData.map((node) => {
                        const systemInfo = node.systemInfo ? JSON.parse(node.systemInfo) : null;
                        const runs = Number(node.runs ?? node.totalRuns ?? node.jobsCompleted ?? 0);
                        const nodeEarnings = runs * 0.05;

                        return (
                          <TableRow key={node.nodeId}>
                            <TableCell>
                              <div className="font-medium text-foreground">{node.nodeId}</div>
                            </TableCell>

                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={node.nodeStatus === 'online'
                                  ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                  : 'bg-red-500/15 text-red-400 border-red-500/30'}
                              >
                                {node.nodeStatus || 'unknown'}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right tabular-nums">
                              {node.cpuUsage ? `${node.cpuUsage}%` : 'N/A'}
                            </TableCell>

                            <TableCell className="text-right tabular-nums">
                              {node.ramTotal ? `${node.ramTotal}GB` : 'N/A'}
                            </TableCell>

                            <TableCell className="text-right tabular-nums">
                              {node.cpuCores ? `${node.cpuCores}` : 'N/A'}
                            </TableCell>

                            <TableCell className="text-right tabular-nums">
                              {node.platform || 'N/A'}
                            </TableCell>

                            <TableCell className="text-right tabular-nums">
                              {systemInfo?.timezone || 'N/A'}
                            </TableCell>

                            <TableCell className="text-right tabular-nums font-medium text-foreground">
                              {runs.toLocaleString()}
                            </TableCell>

                            <TableCell className="text-right tabular-nums text-primary">
                              ${nodeEarnings.toFixed(2)}
                            </TableCell>

                            <TableCell className="text-muted-foreground text-sm">
                              {node.lastHeartbeat
                                ? new Date(node.lastHeartbeat).toLocaleString()
                                : 'Never'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
