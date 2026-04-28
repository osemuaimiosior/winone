import { motion } from "framer-motion";
import { ArrowRight, Car, ClipboardCheck, FileText, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import winOneLogo from "@/assets/winone-logo.png";

const services = [
  { icon: Car, title: "Tokunbo Cars", detail: "Capture owner details, address, phone number, chassis number, and vehicle color." },
  { icon: FileText, title: "Nigerian Used Cars", detail: "Prepare the required vehicle records for local registration support." },
  { icon: RefreshCw, title: "Plate Number Renewal", detail: "Submit proof of ownership, allocation papers, and vehicle license details." },
  { icon: ClipboardCheck, title: "Change of Ownership", detail: "Manage previous-owner documents and new-owner information in one flow." },
];

const LicenseLanding = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="relative overflow-hidden bg-grid pt-6 pb-20 md:pb-28">
          <div className="absolute inset-0 bg-glow pointer-events-none" />
          <div className="container relative">
            <BackButton to="/" label="Back to home" className="mb-10" />
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link to="/" className="inline-flex items-center gap-2 mb-8">
                  <img src={winOneLogo} alt="WinOne logo" className="h-9 w-9 rounded-md object-contain" />
                  <span className="text-xl font-bold text-foreground">
                    Win<span className="text-gradient-primary">One</span> Licensing
                  </span>
                </Link>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                  Vehicle licensing services, organized from start to finish
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-9">
                  Select the vehicle service you need, provide the required information, and continue into your licensing dashboard to manage the process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg">
                    <Link to="/license/signup">Sign up <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/license/login">Sign in</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {services.map((service) => (
                  <div key={service.title} className="rounded-xl border border-border bg-card p-5 card-hover">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">{service.title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{service.detail}</p>
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

export default LicenseLanding;