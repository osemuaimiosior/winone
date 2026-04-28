import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Image, Brain, AudioLines } from "lucide-react";

const useCases = [
  {
    icon: MessageSquare,
    title: "Batch Inference",
    description: "Queue thousands of LLM or vision model inference requests. Jobs auto-scale across the GPU network.",
  },
  {
    icon: Image,
    title: "Media Processing",
    description: "Batch image generation, video transcoding, and rendering pipelines distributed across edge GPU nodes.",
  },
  {
    icon: AudioLines,
    title: "Data Pipelines",
    description: "Run ETL, feature engineering, and preprocessing jobs on GPU-accelerated distributed compute.",
  },
  {
    icon: Brain,
    title: "Model Training",
    description: "Submit training jobs with your datasets. Our scheduler finds the cheapest available GPU capacity.",
  },
];

const UseCasesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="use-cases" ref={ref} className="py-24 bg-card/50 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">
            Use Cases
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Built for <span className="text-gradient-primary">batch workloads</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-border bg-background p-6 text-center border-glow card-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mx-auto mb-4">
                <uc.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {uc.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {uc.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
