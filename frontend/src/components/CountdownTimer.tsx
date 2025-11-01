import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: number;
  onComplete?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function CountdownTimer({
  endTime,
  onComplete,
  size = "md",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("00:00");
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);

      if (diff === 0) {
        setTimeLeft("CLOSED");
        onComplete?.();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
        setIsLow(diff < 30000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} font-bold tabular-nums ${
        isLow ? "text-red-600 animate-countdown" : "text-green-600"
      }`}
    >
      {timeLeft}
    </div>
  );
}
