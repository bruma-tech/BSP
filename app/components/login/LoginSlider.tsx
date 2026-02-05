import { cn } from "@/app/lib/utils";

interface LoginSliderProps {
  value: "tpa" | "sponsor";
  onChange: (value: "tpa" | "sponsor") => void;
}

const LoginSlider = ({ value, onChange }: LoginSliderProps) => {
  return (
    <div className="relative w-full bg-gray-50 rounded-full p-[1.5%] flex">
      <div
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-8px)] bg-blue-500 px-4 text-sm font-medium text-white transition-colors rounded-full transition-all duration-200 ease-out shadow-slider",
          value === "sponsor" ? "left-[calc(50%+2px)]" : "left-1"
        )}
      />
      <button
        type="button"
        onClick={() => onChange("tpa")}
        className={cn(
          "relative z-10 flex-1 py-2.5 text-sm font-medium rounded-full transition-colors duration-200",
          value === "tpa" ? "text-white" : "text-black/50 hover:text-black/80"
        )}
      >
        TPA
      </button>
      <button
        type="button"
        onClick={() => onChange("sponsor")}
        className={cn(
          "relative z-10 flex-1 py-2.5 text-sm font-medium rounded-full transition-colors duration-200",
          value === "sponsor" ? "text-white" : "text-black/50 hover:text-black/80"
        )}
      >
        Sponsor
      </button>
    </div>
  );
};

export default LoginSlider;
