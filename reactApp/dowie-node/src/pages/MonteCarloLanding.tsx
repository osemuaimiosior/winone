import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Gauge, History, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import winOneLogo from "@/assets/winone-logo.png";

const highlights = [
  { icon: Gauge, title: "Set market inputs", detail: "Configure spot price, strike price, volatility, risk-free rate, and expiry period." },
  { icon: TrendingUp, title: "Price calls and puts", detail: "Run thousands of simulated price paths to estimate option values." },
  { icon: BarChart3, title: "Review distributions", detail: "See payoff ranges, expected outcomes, and model behavior visually." },
  { icon: History, title: "Track runs", detail: "Move from simulation to history when you need to compare previous results." },
];

const MonteCarloLanding = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="relative overflow-hidden bg-grid pt-6 pb-20 md:pb-28">
          <div className="absolute inset-0 bg-glow pointer-events-none" />
          <div className="container relative">
            <BackButton to="/" label="Back to home" className="mb-10" />
            <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link to="/" className="inline-flex items-center gap-2 mb-8">
                  <img src={winOneLogo} alt="WinOne logo" className="h-9 w-9 rounded-md object-contain" />
                  <span className="text-xl font-bold text-foreground">
                    Win<span className="text-gradient-primary">One</span> Monte Carlo
                  </span>
                </Link>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                  Options pricing simulation before you commit capital
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-9">
                  Model call and put prices using Black-Scholes inputs, run large simulation batches, and inspect the risk profile before moving forward.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg">
                    <Link to="/tools/monte-carlo/simulator">Continue to simulator <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/history">View history</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card p-5 card-hover">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MonteCarloLanding;