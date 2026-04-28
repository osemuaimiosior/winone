import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import winOneLogo from "@/assets/winone-logo.png";

const solutions = [
  {
    title: "Licensing",
    href: "/license",
    accent: "Licensing",
  },
  {
    title: "Monte Carlo Sim",
    href: "/tools/monte-carlo",
    accent: "MC Sim",
    // accent: "Monte Carlo Sim",
  },
];

const SolutionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solutions" ref={ref} className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-3xl mx-auto text-center"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Solutions</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Choose the <span className="text-gradient-primary">service</span> you need
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {solutions.map((solution, i) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={solution.href}
                className="group flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-7 card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
                  <img src={winOneLogo} alt="WinOne logo" className="h-9 w-9 rounded-md object-contain" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  Win<span className="text-gradient-primary">One</span> {solution.accent}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;