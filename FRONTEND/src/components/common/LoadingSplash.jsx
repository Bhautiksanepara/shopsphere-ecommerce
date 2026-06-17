import { useEffect, useState, useRef } from "react";

const ECOMMERCE_FACTS = [
  "Waking up our servers... This can take up to 60 seconds on Render's free tier. ☕",
  "Preparing the digital shelves and polishing products... 📦",
  "Did you know? The first online shopping transaction occurred in 1994, for a CD of Sting's 'Ten Summoner's Tales'. 💿",
  "Loading the best deals for you... ✨",
  "Did you know? Pizza Hut claims to have opened the first online store in 1994, selling pepperoni pizzas! 🍕",
  "Gathering your shopping cart items... 🛍️",
  "Did you know? Online shopping was invented in 1979 by Michael Aldrich in the UK. 🇬🇧",
  "Configuring secure checkout lanes... 🔐",
  "Did you know? Cyber Monday was coined in 2005 to encourage people to shop online from work. 💻",
  "Connecting to our cloud database. Almost there! 🚀"
];

function LoadingSplash({ onAwake }) {
  const [factIndex, setFactIndex] = useState(0);
  const [status, setStatus] = useState("connecting"); // 'connecting' | 'waiting' | 'failed'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dots, setDots] = useState("");
  const retryTimerRef = useRef(null);
  const secondsTimerRef = useRef(null);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000")
    .replace(/\/+$/, "");

  // Cycle facts every 5 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ECOMMERCE_FACTS.length);
    }, 5000);
    return () => clearInterval(messageInterval);
  }, []);

  // Animating loading dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  // Track elapsed time to adjust message and show warning
  useEffect(() => {
    secondsTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 25 && status === "connecting") {
          setStatus("waiting"); // Display custom free tier explanation
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    };
  }, [status]);

  // Main check function
  const checkServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for each request

      const response = await fetch(`${apiBaseUrl}/api/health`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        // Server is awake!
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
        if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
        
        // Add a slight visual delay for smooth transition
        setTimeout(() => {
          onAwake();
        }, 800);
      }
    } catch (error) {
      console.log("Keep-alive connection check failed: server is starting up or unreachable.");
      // If server doesn't respond and it's been more than 50s, mark as potentially failed
      if (elapsedSeconds > 50) {
        setStatus("failed");
      }
    }
  };

  // Poll server every 2.5 seconds
  useEffect(() => {
    checkServer(); // First check immediately
    
    retryTimerRef.current = setInterval(checkServer, 2500);

    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, [elapsedSeconds]);

  const handleManualRetry = () => {
    setStatus("connecting");
    setElapsedSeconds(0);
    checkServer();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f3ecdf] p-6 text-gray-900 transition-all duration-700 dark:bg-[#0b1114] dark:text-slate-200">
      {/* CSS Styles injection for high-fidelity animations */}
      <style>{`
        @keyframes cartBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes wheelRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes roadMove {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -40; }
        }
        @keyframes bagJump {
          0%, 100% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.05, 0.95) translateY(0); }
          50% { transform: scale(0.95, 1.05) translateY(-12px); }
          60% { transform: scale(1.02, 0.98) translateY(0); }
        }
        @keyframes itemDrop {
          0% { transform: translateY(-40px) scale(0); opacity: 0; }
          40% { transform: translateY(0) scale(1); opacity: 1; }
          80%, 100% { transform: translateY(15px) scale(0); opacity: 0; }
        }
        .anim-cart {
          animation: cartBounce 1.6s ease-in-out infinite;
        }
        .anim-wheel {
          animation: wheelRotate 1.2s linear infinite;
          transform-origin: center;
        }
        .anim-road {
          animation: roadMove 0.8s linear infinite;
        }
        .anim-bag {
          animation: bagJump 2s ease-in-out infinite;
        }
        .anim-item-1 {
          animation: itemDrop 2s ease-in-out infinite;
          animation-delay: 0s;
        }
        .anim-item-2 {
          animation: itemDrop 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }
        .anim-item-3 {
          animation: itemDrop 2s ease-in-out infinite;
          animation-delay: 1.2s;
        }
      `}</style>

      {/* Main card container */}
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/40 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/30">
        
        {/* Animated Visual Section */}
        <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
          {status === "failed" ? (
            /* Error Icon */
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            /* Interactive Shopping Animation */
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {/* Floating Items falling into bag */}
              <g className="anim-item-1" transform="translate(100, 45)">
                {/* Small Package */}
                <rect x="-10" y="-10" width="20" height="20" rx="3" fill="#2f7a6f" className="opacity-80" />
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#f3ecdf" strokeWidth="1.5" />
              </g>
              <g className="anim-item-2" transform="translate(115, 30)">
                {/* Heart / Favorite Icon */}
                <path d="M0,-8 C-5,-13 -13,-8 -13,0 C-13,6 0,14 0,14 C0,14 13,6 13,0 C13,-8 5,-13 0,-8 Z" fill="#e11d48" transform="scale(0.6)" />
              </g>
              <g className="anim-item-3" transform="translate(85, 35)">
                {/* Tag */}
                <path d="M-8,-8 L2,-8 L10,0 L2,10 L-8,10 Z" fill="#d97706" transform="scale(0.7)" />
                <circle cx="-3" cy="1" r="1.5" fill="#f3ecdf" />
              </g>

              {/* Shopping Bag / Cart */}
              <g className="anim-cart">
                {/* Cart Body */}
                <path d="M40 70 L60 70 L75 120 L140 120 L155 80 L55 80" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M60 85 L145 85 M64 100 L140 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                {/* Front Wheel */}
                <circle cx="82" cy="142" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="82" cy="142" r="4" fill="currentColor" />
                <line x1="82" y1="128" x2="82" y2="156" stroke="currentColor" strokeWidth="2" className="anim-wheel" />
                <line x1="68" y1="142" x2="96" y2="142" stroke="currentColor" strokeWidth="2" className="anim-wheel" />
                
                {/* Back Wheel */}
                <circle cx="132" cy="142" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="132" cy="142" r="4" fill="currentColor" />
                <line x1="132" y1="128" x2="132" y2="156" stroke="currentColor" strokeWidth="2" className="anim-wheel" />
                <line x1="118" y1="142" x2="146" y2="142" stroke="currentColor" strokeWidth="2" className="anim-wheel" />
              </g>

              {/* Road / Ground Line */}
              <line x1="20" y1="162" x2="180" y2="162" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10" className="anim-road" />
            </svg>
          )}
        </div>

        {/* Text Section */}
        <h2 className="mb-2 text-xl font-bold tracking-wide text-gray-800 dark:text-slate-100">
          {status === "failed" ? "Connection Issue" : "ShopSphere is Waking Up"}
        </h2>

        {/* Status Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${
            status === "connecting" ? "bg-amber-500 animate-pulse" :
            status === "waiting" ? "bg-amber-400 animate-ping" : "bg-red-500"
          }`} />
          <span>
            {status === "connecting" && `Connecting to server${dots}`}
            {status === "waiting" && `Spinning up server environment (est. 30s)${dots}`}
            {status === "failed" && "Server connection timed out"}
          </span>
        </div>

        {/* Progress Bar (Simulated or Real connection pulse) */}
        {status !== "failed" && (
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
            <div 
              className="h-full bg-[#2f7a6f] transition-all duration-500 ease-out"
              style={{
                width: status === "connecting" 
                  ? `${Math.min(elapsedSeconds * 4, 45)}%` 
                  : `${Math.min(45 + (elapsedSeconds - 10) * 1.5, 92)}%`
              }}
            />
          </div>
        )}

        {/* Rotating Fact Card */}
        <div className="min-h-[72px] rounded-xl bg-gray-100/50 p-4 text-sm font-medium leading-relaxed text-[#2f7a6f]/90 shadow-inner dark:bg-slate-950/40 dark:text-slate-300">
          {status === "failed" ? (
            <span className="text-red-500 dark:text-red-400">
              We couldn't connect to our services. Render free services spin down after inactivity. Please verify your connection or click Retry to wake the backend again.
            </span>
          ) : (
            ECOMMERCE_FACTS[factIndex]
          )}
        </div>

        {/* Action Button for Timeout */}
        {status === "failed" && (
          <button
            onClick={handleManualRetry}
            className="mt-6 w-full rounded-xl bg-[#2f7a6f] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#20554c] active:scale-[0.98]"
          >
            Retry Connection
          </button>
        )}

        {/* Extra helpful tip for free tiers */}
        {status === "waiting" && (
          <p className="mt-4 text-xs leading-normal text-gray-400 dark:text-slate-500">
            ℹ️ Inactivity puts free tier servers to sleep. This happens once a day or after 15 minutes of idle time. The pings we are sending now are starting the server boot process.
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingSplash;
