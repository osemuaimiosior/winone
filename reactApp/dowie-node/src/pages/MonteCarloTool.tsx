import { useState } from "react";
import { motion } from "framer-motion";
import { Play, History, LogOut, TrendingUp, TrendingDown, Activity, Gauge, Clock, BarChart3, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runMonteCarloSimulation, type SimulationParams, type SimulationResult } from "@/lib/monte-carlo";
import PriceDistributionChart from "@/components/PriceDistributionChart";
import winOneLogo from "@/assets/winone-logo.png";

const defaultParams: SimulationParams = {
  spotPrice: 100,
  strikePrice: 105,
  volatility: 0.25,
  riskFreeRate: 0.05,
  timeToExpiry: 1,
  numSimulations: 10000,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    // Use setTimeout so the UI updates before the heavy computation
    setTimeout(() => {
      const res = runMonteCarloSimulation(params);
      setResult(res);
      setRunning(false);
      // TODO: Save to your backend for history
    }, 50);
  };

  const updateParam = (key: keyof SimulationParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={winOneLogo} alt="WinOne logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-sm font-bold text-foreground">
              Win<span className="text-gradient-primary">One</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">
                <History size={16} className="mr-1" /> History
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-muted-foreground"
            >
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Monte Carlo Simulator</h1>
          <p className="text-muted-foreground text-sm">Configure parameters and run Black-Scholes Monte Carlo pricing</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge size={18} className="text-primary" /> Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Spot Price ($)</Label>
                    <Input
                      type="number"
                      value={params.spotPrice}
                      onChange={(e) => updateParam("spotPrice", e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Strike Price ($)</Label>
                    <Input
                      type="number"
                      value={params.strikePrice}
                      onChange={(e) => updateParam("strikePrice", e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Volatility (%)</Label>
                    <Input
                      type="number"
                      value={(params.volatility * 100).toFixed(1)}
                      onChange={(e) => updateParam("volatility", String(parseFloat(e.target.value) / 100))}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Risk-Free Rate (%)</Label>
                    <Input
                      type="number"
                      value={(params.riskFreeRate * 100).toFixed(1)}
                      onChange={(e) => updateParam("riskFreeRate", String(parseFloat(e.target.value) / 100))}
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Time to Expiry (years)</Label>
                    <Input
                      type="number"
                      value={params.timeToExpiry}
                      onChange={(e) => updateParam("timeToExpiry", e.target.value)}
                      step="0.25"
                      min="0.01"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Simulations</Label>
                    <Input
                      type="number"
                      value={params.numSimulations}
                      onChange={(e) => updateParam("numSimulations", e.target.value)}
                      step="1000"
                      min="100"
                      max="1000000"
                    />
                  </div>
                </div>

                <Button onClick={handleRun} className="w-full mt-2" disabled={running}>
                  {running ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  ) : (
                    <>
                      <Play size={16} /> Run Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {result ? (
              <>
                {/* Price Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="border-border bg-card border-glow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Call Price</span>
                        <TrendingUp size={18} className="text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">${result.callPrice.toFixed(4)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card border-glow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Put Price</span>
                        <TrendingDown size={18} className="text-destructive" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">${result.putPrice.toFixed(4)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Greeks */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity size={18} className="text-primary" /> Greeks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Delta (Δ)", value: result.delta.toFixed(4) },
                        { label: "Gamma (Γ)", value: result.gamma.toFixed(6) },
                        { label: "Theta (Θ)", value: result.theta.toFixed(4) },
                        { label: "Vega (ν)", value: result.vega.toFixed(4) },
                      ].map((g) => (
                        <div key={g.label} className="rounded-lg bg-secondary/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">{g.label}</p>
                          <p className="text-lg font-semibold text-foreground font-mono">{g.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chart */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 size={18} className="text-primary" /> Simulated Price Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PriceDistributionChart
                      prices={result.simulatedPrices}
                      strikePrice={params.strikePrice}
                      spotPrice={params.spotPrice}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="rounded-full bg-secondary/50 p-6 mb-4">
                  <Clock size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No simulation yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Configure the parameters on the left and click "Run Simulation" to generate pricing and distribution data.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
