import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, Globe, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Job Scheduling",
    description:
      "Submit batch jobs and our orchestrator routes them to the optimal GPU nodes across 47 countries — automatic placement, zero config.",
  },
  {
    icon: Cpu,
    title: "Heterogeneous GPU Pool",
    description:
      "From consumer RTX cards to enterprise A100s — our scheduler matches your job requirements to the right hardware class automatically.",
  },
  {
    icon: Shield,
    title: "Verifiable Execution",
    description:
      "Every batch job is cryptographically attested on-chain. Get proof that your workload ran correctly, on the hardware you paid for.",
  },
  {
    icon: Zap,
    title: "Pay-Per-Job Pricing",
    description:
      "No reserved instances, no idle costs. Pay only for the GPU-seconds your jobs consume — at 80% less than AWS Batch.",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-24 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Batch compute,{" "}
            <span className="text-gradient-primary">decentralized</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-8 border-glow card-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mb-5">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
