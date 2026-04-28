import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import winOneLogo from "@/assets/winone-logo.png";

const SimulationHistory = () => {
  // TODO: Replace with actual API call to fetch history from your backend
  const history: Array<{
    id: string;
    timestamp: string;
    spotPrice: number;
    strikePrice: number;
    callPrice: number;
    putPrice: number;
    numSimulations: number;
  }> = [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={winOneLogo} alt="WinOne logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-sm font-bold text-foreground">
              Win<span className="text-gradient-primary">One</span>
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Simulation History</h1>
          <p className="text-muted-foreground text-sm">View your past Monte Carlo simulation runs</p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-secondary/50 p-6 mb-4">
              <Database size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No history yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Connect your backend to store simulation results. Each run will appear here with full details.
            </p>
            <Button asChild>
              <Link to="/dashboard">Run Your First Simulation</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border bg-card card-hover cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          S={item.spotPrice} K={item.strikePrice}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()} · {item.numSimulations.toLocaleString()} sims
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Call</p>
                        <p className="text-sm font-semibold text-foreground">${item.callPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Put</p>
                        <p className="text-sm font-semibold text-foreground">${item.putPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationHistory;
