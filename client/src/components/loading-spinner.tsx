import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ className = "" }: { className?: string }) => {
  return <Loader2 className={`h-4 w-4 animate-spin mr-2 ${className}`} />;
};