import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

/**
 * Consistent back navigation. If `to` is provided, navigates to that path.
 * Otherwise uses browser history (falls back to "/" if no history).
 */
const BackButton = ({ to, label = "Back", className }: BackButtonProps) => {
  const navigate = useNavigate();

  const baseClasses = cn(
    "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        <ArrowLeft size={16} /> {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
      className={baseClasses}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
};

export default BackButton;
