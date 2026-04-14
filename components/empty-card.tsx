import { Spinner } from "@/components/ui/Spinner";
import clsx from "clsx";

interface EmptyCardProps {
  title: string;
  description: string;
  className?: string;
}

const EmptyCard: React.FC<EmptyCardProps> = ({ title, description, className }) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center space-y-4 rounded-lg bg-white p-4 shadow-lg",
        className,
      )}
    >
      <Spinner className="w-8 h-8" />
      <div className="text-lg font-bold text-gray-800">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
};

export default EmptyCard;
