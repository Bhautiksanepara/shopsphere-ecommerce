import { useEffect, useState, useRef } from "react";

const ECOMMERCE_FACTS = [
  "Preparing the digital shelves and polishing products... 📦",
  "Did you know? The first online shopping transaction occurred in 1994, for a CD of Sting's 'Ten Summoner's Tales'. 💿",
  "Loading the best deals for you... ✨",
  "Did you know? Pizza Hut claims to have opened the first online store in 1994, selling pepperoni pizzas! 🍕",
  "Gathering your shopping cart items... 🛍️",
  "Did you know? Online shopping was invented in 1979 by Michael Aldrich in the UK. 🇬🇧",
  "Configuring secure checkout lanes... 🔐",
  "Did you know? Cyber Monday was coined in 2005 to encourage people to shop online from work. 💻",
  "Connecting to our cloud database. Almost there! 🚀",
  "Waking up our servers... This can take up to 60 seconds on Render's free tier. ☕"
];

function LoadingSplash({ onAwake }) {
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get("demo") === "true";

  const [factIndex, setFactIndex] = useState(0);
  const [status, setStatus] = useState("connecting"); // 'connecting' | 'waiting' | 'failed'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dots, setDots] = useState("");
  const retryTimerRef = useRef(null);
  const secondsTimerRef = useRef(null);
  const elapsedRef = useRef(0);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000")
    .replace(/\/+$/, "");

  // Update the ref to prevent stale closures in server polling
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Cycle all 4 animation phases (12s each, 48s total) repeatedly while waiting
  const phaseSeconds = elapsedSeconds % 48;
  const phase = phaseSeconds < 12 ? 1 : phaseSeconds < 24 ? 2 : phaseSeconds < 36 ? 3 : 4;

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
        if (isDemoMode) {
          // Hold the splash screen for demonstration purposes; log only occasionally
          if (elapsedRef.current % 5 === 0) {
            console.log("Server is awake (Demo Mode active: holding splash)");
          }
          return;
        }

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
      // If server doesn't respond and it's been more than 90s, mark as potentially failed
      if (elapsedRef.current > 90) {
        setStatus("failed");
      }
    }
  };

  // Poll server every 2.5 seconds (only registered once to avoid multiple intervals/spam)
  useEffect(() => {
    checkServer(); // First check immediately
    retryTimerRef.current = setInterval(checkServer, 2500);

    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, []);

  const handleManualRetry = () => {
    setStatus("connecting");
    setElapsedSeconds(0);
    checkServer();
  };

  const renderAnimation = () => {
    switch (phase) {
      case 1: {
        const loopIdx = Math.floor(elapsedSeconds / 4) % 4;
        
        // Determine coordinate locations of click targets for cursor transform-origin
        const clickOriginStr = 
          loopIdx === 0 ? "180px 180px" : 
          loopIdx === 1 ? "60px 60px" : 
          loopIdx === 2 ? "60px 180px" : "180px 60px";
        const clickCx = (loopIdx === 0 || loopIdx === 3) ? "180" : "60";
        const clickCy = (loopIdx === 0 || loopIdx === 2) ? "180" : "60";

        return (
          <svg viewBox="0 0 240 240" style={{ overflow: "visible" }} className="h-full w-full">
            <defs>
              <linearGradient id="p1-cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f5f0e6" />
              </linearGradient>
              <linearGradient id="p1-activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#dcefe9" />
              </linearGradient>
              <linearGradient id="p1-accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2f7a6f" />
                <stop offset="100%" stopColor="#1f4d46" />
              </linearGradient>
              <filter id="p1-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1f3d36" floodOpacity="0.08" />
              </filter>
              <filter id="p1-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#2f7a6f" floodOpacity="0.3" />
              </filter>
            </defs>

            <style>{`
              @keyframes p1-card1 { 0%, 100% { opacity: 0; transform: scale(0.8); } 5%, 72% { opacity: 1; transform: scale(1); } 75%, 95% { opacity: 0; transform: scale(0.8); } }
              @keyframes p1-card2 { 0%, 100% { opacity: 0; transform: scale(0.8); } 8%, 20% { opacity: 1; transform: scale(1); } 22%, 40% { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 10px 20px rgba(47,122,111,0.15)); } 42%, 72% { opacity: 1; transform: scale(1); } 75%, 95% { opacity: 0; transform: scale(0.8); } }
              @keyframes p1-card3 { 0%, 100% { opacity: 0; transform: scale(0.8); } 11%, 72% { opacity: 1; transform: scale(1); } 75%, 95% { opacity: 0; transform: scale(0.8); } }
              @keyframes p1-card4-inactive { 0%, 100% { opacity: 0; transform: scale(0.8); } 14%, 72% { opacity: 1; transform: scale(1); } 75%, 95% { opacity: 0; transform: scale(0.8); } }
              
              @keyframes p1-card-selected-0 { 
                0%, 100% { opacity: 0; transform: translate(0px, 0px) scale(0.8); } 
                14%, 58% { opacity: 1; transform: translate(0px, 0px) scale(1); } 
                60%, 72% { opacity: 1; transform: translate(0px, 0px) scale(1.15); filter: url(#p1-glow); } 
                75%, 95% { opacity: 1; transform: translate(-60px, -60px) scale(1.4); filter: url(#p1-glow); } 
              }
              @keyframes p1-card-selected-1 { 
                0%, 100% { opacity: 0; transform: translate(0px, 0px) scale(0.8); } 
                14%, 58% { opacity: 1; transform: translate(0px, 0px) scale(1); } 
                60%, 72% { opacity: 1; transform: translate(0px, 0px) scale(1.15); filter: url(#p1-glow); } 
                75%, 95% { opacity: 1; transform: translate(60px, 60px) scale(1.4); filter: url(#p1-glow); } 
              }
              @keyframes p1-card-selected-2 { 
                0%, 100% { opacity: 0; transform: translate(0px, 0px) scale(0.8); } 
                14%, 58% { opacity: 1; transform: translate(0px, 0px) scale(1); } 
                60%, 72% { opacity: 1; transform: translate(0px, 0px) scale(1.15); filter: url(#p1-glow); } 
                75%, 95% { opacity: 1; transform: translate(60px, -60px) scale(1.4); filter: url(#p1-glow); } 
              }
              @keyframes p1-card-selected-3 { 
                0%, 100% { opacity: 0; transform: translate(0px, 0px) scale(0.8); } 
                14%, 58% { opacity: 1; transform: translate(0px, 0px) scale(1); } 
                60%, 72% { opacity: 1; transform: translate(0px, 0px) scale(1.15); filter: url(#p1-glow); } 
                75%, 95% { opacity: 1; transform: translate(-60px, 60px) scale(1.4); filter: url(#p1-glow); } 
              }

              @keyframes p1-grid-dim {
                0%, 72% { opacity: 1; }
                75%, 95% { opacity: 0.15; }
              }
              @keyframes p1-cursor-0 {
                0% { transform: translate(240px, 240px); opacity: 0; }
                10% { transform: translate(220px, 220px); opacity: 1; }
                22%, 40% { transform: translate(180px, 60px); opacity: 1; }
                58%, 73% { transform: translate(180px, 180px); opacity: 1; }
                74% { transform: translate(180px, 180px) scale(0.8); opacity: 1; }
                76% { transform: translate(180px, 180px) scale(1); opacity: 1; }
                82%, 100% { transform: translate(240px, 240px); opacity: 0; }
              }
              @keyframes p1-cursor-1 {
                0% { transform: translate(240px, 240px); opacity: 0; }
                10% { transform: translate(220px, 220px); opacity: 1; }
                22%, 40% { transform: translate(180px, 60px); opacity: 1; }
                58%, 73% { transform: translate(60px, 60px); opacity: 1; }
                74% { transform: translate(60px, 60px) scale(0.8); opacity: 1; }
                76% { transform: translate(60px, 60px) scale(1); opacity: 1; }
                82%, 100% { transform: translate(240px, 240px); opacity: 0; }
              }
              @keyframes p1-cursor-2 {
                0% { transform: translate(240px, 240px); opacity: 0; }
                10% { transform: translate(220px, 220px); opacity: 1; }
                22%, 40% { transform: translate(180px, 60px); opacity: 1; }
                58%, 73% { transform: translate(60px, 180px); opacity: 1; }
                74% { transform: translate(60px, 180px) scale(0.8); opacity: 1; }
                76% { transform: translate(60px, 180px) scale(1); opacity: 1; }
                82%, 100% { transform: translate(240px, 240px); opacity: 0; }
              }
              @keyframes p1-cursor-3 {
                0% { transform: translate(240px, 240px); opacity: 0; }
                10% { transform: translate(220px, 220px); opacity: 1; }
                22%, 40% { transform: translate(60px, 180px); opacity: 1; }
                58%, 73% { transform: translate(180px, 60px); opacity: 1; }
                74% { transform: translate(180px, 60px) scale(0.8); opacity: 1; }
                76% { transform: translate(180px, 60px) scale(1); opacity: 1; }
                82%, 100% { transform: translate(240px, 240px); opacity: 0; }
              }

              @keyframes p1-click-ring {
                0%, 72% { transform: scale(0); opacity: 0; }
                74% { transform: scale(0.4); opacity: 0.8; }
                88%, 100% { transform: scale(1.8); opacity: 0; }
              }
            `}</style>

            {/* Grid Line Layout */}
            <g className="p1-grid" style={{ animation: "p1-grid-dim 4s ease-in-out infinite" }}>
              <line x1="120" y1="20" x2="120" y2="220" stroke="#1f3d36" strokeOpacity="0.08" strokeDasharray="4 4" />
              <line x1="20" y1="120" x2="220" y2="120" stroke="#1f3d36" strokeOpacity="0.08" strokeDasharray="4 4" />
            </g>

            {/* Card 1: Top-Left - Smartwatch */}
            <g transform="translate(20, 20)">
              <g style={{ 
                animation: loopIdx === 1 ? "p1-card-selected-1 4s cubic-bezier(0.25, 1, 0.5, 1) infinite" : "p1-card1 4s ease-in-out infinite", 
                transformOrigin: "40px 40px" 
              }} filter="url(#p1-shadow)">
                <rect x="0" y="0" width="80" height="80" rx="16" fill={loopIdx === 1 ? "url(#p1-activeGrad)" : "url(#p1-cardGrad)"} stroke={loopIdx === 1 ? "#2f7a6f" : "#e8e2d5"} strokeWidth={loopIdx === 1 ? "2" : "1.5"} />
                <rect x="36" y="16" width="8" height="48" rx="2" fill="#1f3d36" opacity="0.15" />
                <circle cx="40" cy="40" r="16" fill="#1f3d36" />
                <circle cx="40" cy="40" r="13" fill="none" stroke="#2f7a6f" strokeWidth="1.5" />
                <rect x="33" y="38" width="14" height="4" rx="1" fill="#fff" opacity="0.8" />
              </g>
            </g>

            {/* Card 2: Top-Right - Headphones (Hover target 1 & Click target 4) */}
            <g transform="translate(140, 20)">
              <g style={{ 
                animation: loopIdx === 3 ? "p1-card-selected-3 4s cubic-bezier(0.25, 1, 0.5, 1) infinite" : "p1-card2 4s ease-in-out infinite", 
                transformOrigin: "40px 40px" 
              }} filter="url(#p1-shadow)">
                <rect x="0" y="0" width="80" height="80" rx="16" fill={loopIdx === 3 ? "url(#p1-activeGrad)" : "url(#p1-cardGrad)"} stroke={loopIdx === 3 ? "#2f7a6f" : "#e8e2d5"} strokeWidth={loopIdx === 3 ? "2" : "1.5"} />
                <path d="M26,46 C26,30 54,30 54,46" fill="none" stroke={loopIdx === 3 ? "#1f4d46" : "#1f3d36"} strokeWidth="3.5" strokeLinecap="round" />
                <rect x="21" y="40" width="7" height="14" rx="2" fill="#2f7a6f" />
                <rect x="52" y="40" width="7" height="14" rx="2" fill="#2f7a6f" />
              </g>
            </g>

            {/* Card 3: Bottom-Left - T-Shirt */}
            <g transform="translate(20, 140)">
              <g style={{ 
                animation: loopIdx === 2 ? "p1-card-selected-2 4s cubic-bezier(0.25, 1, 0.5, 1) infinite" : "p1-card3 4s ease-in-out infinite", 
                transformOrigin: "40px 40px" 
              }} filter="url(#p1-shadow)">
                <rect x="0" y="0" width="80" height="80" rx="16" fill={loopIdx === 2 ? "url(#p1-activeGrad)" : "url(#p1-cardGrad)"} stroke={loopIdx === 2 ? "#2f7a6f" : "#e8e2d5"} strokeWidth={loopIdx === 2 ? "2" : "1.5"} />
                <path d="M25,28 L34,28 C36,32 44,32 46,28 L55,28 L64,36 L58,42 L54,39 L54,58 L26,58 L26,39 L22,42 L16,36 Z" fill="#2f7a6f" opacity="0.85" />
              </g>
            </g>

            {/* Card 4: Bottom-Right - Sneaker (Hover & Click target) */}
            <g transform="translate(140, 140)">
              <g style={{ 
                animation: loopIdx === 0 ? "p1-card-selected-0 4s cubic-bezier(0.25, 1, 0.5, 1) infinite" : "p1-card4-inactive 4s ease-in-out infinite", 
                transformOrigin: "40px 40px" 
              }} filter="url(#p1-shadow)">
                <rect x="0" y="0" width="80" height="80" rx="16" fill={loopIdx === 0 ? "url(#p1-activeGrad)" : "url(#p1-cardGrad)"} stroke={loopIdx === 0 ? "#2f7a6f" : "#e8e2d5"} strokeWidth={loopIdx === 0 ? "2" : "1.5"} />
                
                {/* Sneaker Graphic */}
                <g transform="translate(40, 40) scale(1.15)" fill="url(#p1-accentGrad)">
                  <path d="M-18,8 C-12,9 -6,11 5,11 C12,11 18,5 20,2 L18,-1 C12,1 4,6 -10,5 Z" />
                  <path d="M-17,6 C-10,7 2,4 8,0 C12,-3 16,-8 18,-11 L6,-14 C2,-11 -4,-10 -8,-5 C-12,-2 -15,3 -17,6 Z" opacity="0.9" />
                  <path d="M-2,-7 L2,-11 M-5,-4 L-1,-8 M-8,-1 L-4,-5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
                </g>
              </g>
            </g>

            {/* Click animation ring */}
            <circle style={{ animation: "p1-click-ring 4s ease-out infinite", transformOrigin: clickOriginStr }} cx={clickCx} cy={clickCy} r="15" fill="none" stroke="#ef4444" strokeWidth="3.5" />
            <circle style={{ animation: "p1-click-ring 4s ease-out infinite", transformOrigin: clickOriginStr }} cx={clickCx} cy={clickCy} r="28" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />

            {/* Mouse Cursor */}
            <g style={{ animation: `p1-cursor-${loopIdx} 4s cubic-bezier(0.25, 1, 0.5, 1) infinite` }}>
              <path d="M0,0 L7,20 L12,14 L20,18 Z" fill="#1f3d36" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </g>
          </svg>
        );
      }
      case 2: {
        const loopIdx = Math.floor((elapsedSeconds - 12) / 3) % 4;

        const renderFlyingItem = (idx) => {
          switch (idx) {
            case 1: // Smartwatch
              return (
                <g transform="translate(0, 0) scale(1.15)" fill="url(#p2-shoeGrad)">
                  <rect x="-4" y="-18" width="8" height="36" rx="2" fill="#1f3d36" opacity="0.15" />
                  <circle cx="0" cy="0" r="11" fill="#1f3d36" />
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#2f7a6f" strokeWidth="1.5" />
                  <rect x="-5" y="-1.5" width="10" height="3" rx="0.5" fill="#fff" opacity="0.8" />
                </g>
              );
            case 2: // T-Shirt
              return (
                <g transform="translate(0, 0) scale(0.95)" fill="url(#p2-shoeGrad)">
                  <path d="M-22,-18 L-14,-18 C-12,-14 -4,-14 -2,-18 L6,-18 L14,-10 L8,-4 L4,-7 L4,12 L-14,12 L-14,-7 L-18,-4 L-22,-10 Z" opacity="0.9" />
                </g>
              );
            case 3: // Headphones
              return (
                <g transform="translate(0, 0) scale(0.95)" fill="none" stroke="url(#p2-shoeGrad)" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M-14,6 C-14,-10 14,-10 14,6" />
                  <rect x="-18" y="2" width="6" height="10" rx="2" fill="#2f7a6f" stroke="none" />
                  <rect x="12" y="2" width="6" height="10" rx="2" fill="#2f7a6f" stroke="none" />
                </g>
              );
            case 0:
            default: // Sneaker
              return (
                <g transform="translate(0, 0) scale(0.85)" fill="url(#p2-shoeGrad)">
                  <path d="M-18,8 C-12,9 -6,11 5,11 C12,11 18,5 20,2 L18,-1 C12,1 4,6 -10,5 Z" />
                  <path d="M-17,6 C-10,7 2,4 8,0 C12,-3 16,-8 18,-11 L6,-14 C2,-11 -4,-10 -8,-5 C-12,-2 -15,3 -17,6 Z" />
                </g>
              );
          }
        };

        return (
          <svg viewBox="0 0 240 240" style={{ overflow: "visible" }} className="h-full w-full">
            <defs>
              <linearGradient id="p2-cartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="p2-shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2f7a6f" />
                <stop offset="100%" stopColor="#1f4d46" />
              </linearGradient>
              <filter id="p2-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
              </filter>
            </defs>

            <style>{`
              @keyframes p2-sneaker {
                0%        { transform: translate(45px, 45px) scale(1) rotate(0deg); opacity: 1; }
                15%       { transform: translate(55px, 25px) scale(0.95) rotate(-15deg); opacity: 1; }
                45%       { transform: translate(95px, 50px) scale(0.8) rotate(-45deg); opacity: 1; }
                58%       { transform: translate(126px, 100px) scale(0.65) rotate(-72deg); opacity: 1; }
                65%       { transform: translate(126px, 118px) scale(0.48) rotate(-83deg); opacity: 0.85; }
                73%, 100% { transform: translate(126px, 138px) scale(0.25) rotate(-90deg); opacity: 0; }
              }
              @keyframes p2-cart {
                0%, 62%, 100% { transform: translateY(0) scale(1); }
                68% { transform: translateY(8px) scale(1.12, 0.82); }
                74% { transform: translateY(-16px) scale(0.88, 1.15); }
                82% { transform: translateY(3px) scale(1.04, 0.96); }
                90% { transform: translateY(0) scale(1); }
              }
              @keyframes p2-badge {
                0%, 66% { transform: scale(0); opacity: 0; }
                74% { transform: scale(1.4); opacity: 1; }
                82% { transform: scale(0.9); opacity: 1; }
                90%, 100% { transform: scale(1); opacity: 1; }
              }
              @keyframes p2-sparkle1 {
                0% { transform: translate(55px, 55px) scale(0); opacity: 0; }
                12% { transform: translate(60px, 35px) scale(1.2); opacity: 0.8; }
                32%, 100% { transform: translate(75px, 20px) scale(0); opacity: 0; }
              }
              @keyframes p2-sparkle2 {
                0% { transform: translate(75px, 40px) scale(0); opacity: 0; }
                28% { transform: translate(95px, 50px) scale(1.2); opacity: 0.8; }
                48%, 100% { transform: translate(110px, 75px) scale(0); opacity: 0; }
              }
              @keyframes p2-burst {
                0%, 64% { transform: scale(0); opacity: 0; }
                70% { transform: scale(1.2); opacity: 1; }
                88%, 100% { transform: scale(2); opacity: 0; }
              }
              @keyframes p2-wheel-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .p2-wheel {
                animation: p2-wheel-spin 1.2s linear infinite;
                transform-origin: center;
              }
            `}</style>

            {/* Path Guide */}
            <path d="M45,45 Q75,10 126,135" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.15" />

            {/* Flying Sparkles */}
            <circle style={{ animation: "p2-sparkle1 3s ease-out infinite", transformOrigin: "0px 0px" }} cx="0" cy="0" r="3" fill="#eab308" />
            <circle style={{ animation: "p2-sparkle2 3s ease-out infinite", transformOrigin: "0px 0px" }} cx="0" cy="0" r="2.5" fill="#eab308" />

            {/* Flying Item */}
            <g style={{ animation: "p2-sneaker 3s cubic-bezier(0.25, 1, 0.5, 1) infinite", transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="20" fill="#2f7a6f" opacity="0.1" />
              {renderFlyingItem(loopIdx)}
            </g>

            {/* Cart Container with elastic effect (Translated to 126px for perfect bounding box centering) */}
            <g transform="translate(126, 140)" filter="url(#p2-shadow)">
              <g style={{ animation: "p2-cart 3s ease-in-out infinite", transformOrigin: "0px 10px" }}>
                {/* Symmetrical basket profile */}
                <path d="M-48,-28 L-36,-28 L-20,10 L20,10 L36,-28 L48,-28" fill="none" stroke="url(#p2-cartGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                {/* Symmetrical inner grid details */}
                <path d="M-17,-28 L-12,10 M-6,-28 L-4,10 M4,-28 L4,10 M14,-28 L12,10 M25,-28 L20,10" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                
                {/* Wheels */}
                <g transform="translate(-16, 22)">
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#1f3d36" strokeWidth="3" />
                  <circle cx="0" cy="0" r="2.5" fill="#1f3d36" />
                  <line className="p2-wheel" x1="-6" y1="0" x2="6" y2="0" stroke="#1f3d36" strokeWidth="1.5" />
                  <line className="p2-wheel" x1="0" y1="-6" x2="0" y2="6" stroke="#1f3d36" strokeWidth="1.5" />
                </g>
                <g transform="translate(16, 22)">
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#1f3d36" strokeWidth="3" />
                  <circle cx="0" cy="0" r="2.5" fill="#1f3d36" />
                  <line className="p2-wheel" x1="-6" y1="0" x2="6" y2="0" stroke="#1f3d36" strokeWidth="1.5" />
                  <line className="p2-wheel" x1="0" y1="-6" x2="0" y2="6" stroke="#1f3d36" strokeWidth="1.5" />
                </g>
              </g>
            </g>

            {/* Spark Bursts (Centered exactly at cart opening) */}
            <g style={{ animation: "p2-burst 3s ease-out infinite", transformOrigin: "125px 112px" }} stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <line x1="125" y1="105" x2="125" y2="93" />
              <line x1="140" y1="112" x2="152" y2="106" />
              <line x1="110" y1="112" x2="98" y2="106" />
              <line x1="135" y1="100" x2="145" y2="90" />
              <line x1="115" y1="100" x2="105" y2="90" />
            </g>

            {/* Item Count Red Badge */}
            <g style={{ animation: "p2-badge 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite", transformOrigin: "158px 95px" }} transform="translate(158, 95)">
              <circle cx="0" cy="0" r="11" fill="#ef4444" filter="url(#p2-shadow)" />
              <text x="0" y="3.5" fill="white" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{loopIdx + 1}</text>
            </g>
          </svg>
        );
      }
      case 3: {
        const pins = [
          { x: 160, y: 140 },
          { x: 95, y: 110 },
          { x: 130, y: 90 },
          { x: 75, y: 150 }
        ];
        const loopIdx = Math.floor((elapsedSeconds - 24) / 3) % 4;
        const activePin = pins[loopIdx < 0 ? 0 : loopIdx];

        return (
          <svg 
            viewBox="0 0 240 240" 
            style={{ 
              overflow: "visible",
              "--active-pin-x": `${activePin.x}px`,
              "--active-pin-y": `${activePin.y}px`,
              "--active-pin-y-up": `${activePin.y - 15}px`,
              "--active-drone-y": `${activePin.y - 65}px`,
              "--active-package-start-y": `${activePin.y - 50}px`
            }} 
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="p3-droneBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="p3-mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
              <filter id="p3-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#ea580c" floodOpacity="0.08" />
              </filter>
            </defs>

            <style>{`
              @keyframes p3-drone {
                0% { transform: translate(65px, 80px); }
                15% { transform: translate(65px, 60px); }
                45%, 80% { transform: translate(var(--active-pin-x, 160px), var(--active-drone-y, 75px)); }
                95%, 100% { transform: translate(240px, 40px); }
              }
              @keyframes p3-prop-L {
                0% { transform: scaleX(1); }
                50% { transform: scaleX(0.15); }
                100% { transform: scaleX(1); }
              }
              @keyframes p3-prop-R {
                0% { transform: scaleX(1); }
                50% { transform: scaleX(0.15); }
                100% { transform: scaleX(1); }
              }
              @keyframes p3-package {
                0% { transform: translate(65px, 95px) scale(1); opacity: 1; }
                15% { transform: translate(65px, 75px) scale(1); opacity: 1; }
                45% { transform: translate(var(--active-pin-x, 160px), var(--active-package-start-y, 90px)) scale(1); opacity: 1; }
                55% { transform: translate(var(--active-pin-x, 160px), var(--active-pin-y, 140px)) scale(0.65); opacity: 1; }
                58%, 100% { transform: translate(var(--active-pin-x, 160px), var(--active-pin-y, 140px)) scale(0.65); opacity: 0; }
              }
              @keyframes p3-pin-bounce {
                0%, 50% { transform: scale(0); opacity: 0; }
                55% { transform: scale(1.2, 0.85); opacity: 1; }
                66% { transform: translateY(-15px) scale(0.9, 1.12); }
                74% { transform: scale(1.05, 0.95); }
                82%, 100% { transform: scale(1); opacity: 1; }
              }
              @keyframes p3-path {
                0% { stroke-dashoffset: 160; }
                50%, 100% { stroke-dashoffset: 0; }
              }
              @keyframes p3-radar-scale {
                0%, 53% { transform: scale(0.1); opacity: 0; }
                66% { transform: scale(0.9); opacity: 0.6; }
                85%, 100% { transform: scale(1.6); opacity: 0; }
              }
            `}</style>

            {/* Isometric map card background */}
            <g transform="translate(30, 70)" filter="url(#p3-shadow)">
              <rect x="0" y="0" width="180" height="110" rx="16" fill="url(#p3-mapGrad)" stroke="#fed7aa" strokeWidth="1.5" />
              
              {/* Isometric grid */}
              <g stroke="#ea580c" strokeWidth="1" opacity="0.06">
                <line x1="30" y1="0" x2="30" y2="110" />
                <line x1="60" y1="0" x2="60" y2="110" />
                <line x1="90" y1="0" x2="90" y2="110" />
                <line x1="120" y1="0" x2="120" y2="110" />
                <line x1="150" y1="0" x2="150" y2="110" />
                
                <line x1="0" y1="22" x2="180" y2="22" />
                <line x1="0" y1="55" x2="180" y2="55" />
                <line x1="0" y1="88" x2="180" y2="88" />
              </g>
              
              {/* Start point marker */}
              <circle cx="35" cy="70" r="4" fill="#f97316" />
              <circle cx="35" cy="70" r="10" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.3" />
            </g>

            {/* Static Already-Dropped Pins */}
            {pins.map((pin, index) => {
              if (index < loopIdx) {
                return (
                  <g key={index} transform={`translate(${pin.x}, ${pin.y})`}>
                    <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="#1f3d36" opacity="0.25" />
                    <path d="M0,0 C-9,-9 -15,-18 -15,-28 C-15,-38 -8,-45 0,-45 C8,-45 15,-38 15,-28 C15,-18 9,-9 0,0 Z" fill="#ea580c" opacity="0.7" />
                    <circle cx="0" cy="-28" r="6" fill="#fef3c7" />
                  </g>
                );
              }
              return null;
            })}

            {/* Neon Connection Path */}
            <path 
              className="p3-path" 
              style={{ animation: "p3-path 3s linear infinite", strokeDasharray: 160 }} 
              d={`M65,140 Q${(65 + activePin.x) / 2},${Math.min(140, activePin.y) - 30} ${activePin.x},${activePin.y}`}
              fill="none" 
              stroke="#ea580c" 
              strokeWidth="3" 
              strokeLinecap="round" 
              opacity="0.75" 
            />

            {/* Radar Wave rings expanding beneath pin */}
            <g transform={`translate(${activePin.x}, ${activePin.y})`}>
              <g style={{ animation: "p3-radar-scale 3s ease-out infinite", transformOrigin: "0px 3px" }}>
                <ellipse cx="0" cy="3" rx="20" ry="7" fill="none" stroke="#ea580c" strokeWidth="2.5" />
              </g>
            </g>

            {/* Dropped Package */}
            <g style={{ animation: "p3-package 3s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}>
              <rect x="-10" y="-10" width="20" height="20" rx="3" fill="#d97706" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#fef3c7" strokeWidth="2" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#fef3c7" strokeWidth="2" />
            </g>

            {/* Drone */}
            <g style={{ animation: "p3-drone 3s ease-in-out infinite" }}>
              <line x1="-24" y1="-8" x2="24" y2="-8" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="-16" y1="-14" x2="-16" y2="0" stroke="#475569" strokeWidth="2" />
              <line x1="16" y1="-14" x2="16" y2="0" stroke="#475569" strokeWidth="2" />

              <g transform="translate(-24, -12)">
                <g style={{ animation: "p3-prop-L 0.2s linear infinite", transformOrigin: "0px 0px" }}>
                  <ellipse cx="0" cy="0" rx="14" ry="3" fill="none" stroke="#64748b" strokeWidth="1.5" />
                </g>
                <rect x="-3" y="-2" width="6" height="4" fill="#1e293b" />
              </g>
              <g transform="translate(24, -12)">
                <g style={{ animation: "p3-prop-R 0.2s linear infinite", transformOrigin: "0px 0px" }}>
                  <ellipse cx="0" cy="0" rx="14" ry="3" fill="none" stroke="#64748b" strokeWidth="1.5" />
                </g>
                <rect x="-3" y="-2" width="6" height="4" fill="#1e293b" />
              </g>

              <rect x="-14" y="-12" width="28" height="14" rx="7" fill="url(#p3-droneBody)" />
              <circle cx="0" cy="0" r="4.5" fill="#0f172a" />
              <circle cx="1.5" cy="-1.5" r="1.5" fill="#ffffff" opacity="0.8" />
            </g>

            {/* Active Pin drop */}
            <g transform={`translate(${activePin.x}, ${activePin.y})`}>
              <g style={{ animation: "p3-pin-bounce 3s cubic-bezier(0.25, 1, 0.5, 1) infinite", transformOrigin: "0px 0px" }}>
                <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="#1f3d36" opacity="0.25" />
                <path d="M0,0 C-9,-9 -15,-18 -15,-28 C-15,-38 -8,-45 0,-45 C8,-45 15,-38 15,-28 C15,-18 9,-9 0,0 Z" fill="#ea580c" />
                <circle cx="0" cy="-28" r="6" fill="#fef3c7" />
              </g>
            </g>
          </svg>
        );
      }
      case 4:
      default: {
        const cardIndex = Math.max(0, Math.floor((elapsedSeconds - 36) / 3)) % 4;
        const cards = [
          { gradId: "p4-cardGrad-mc", name: "Mastercard" },
          { gradId: "p4-cardGrad-visa", name: "Visa" },
          { gradId: "p4-cardGrad-travel", name: "Travel" },
          { gradId: "p4-cardGrad-vip", name: "VIP" }
        ];
        const card = cards[cardIndex];

        return (
          <svg viewBox="0 0 240 240" style={{ overflow: "visible", animation: "p4-shake 3s infinite" }} className="h-full w-full">
            <defs>
              <linearGradient id="p4-cardGrad-mc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b1d2f" />
                <stop offset="50%" stopColor="#4c121e" />
                <stop offset="100%" stopColor="#2c050c" />
              </linearGradient>
              <linearGradient id="p4-cardGrad-visa" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#f3e5ab" />
                <stop offset="100%" stopColor="#aa7c11" />
              </linearGradient>
              <linearGradient id="p4-cardGrad-travel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065f46" />
                <stop offset="50%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="p4-cardGrad-vip" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="50%" stopColor="#111827" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>
              <linearGradient id="p4-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="p4-receiptGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="90%" stopColor="#fbf9f4" />
                <stop offset="100%" stopColor="#f3ecdf" />
              </linearGradient>
              <filter id="p4-shadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#1f3d36" floodOpacity="0.1" />
              </filter>
            </defs>

            <style>{`
              @keyframes p4-receipt {
                0% { transform: translateY(-130px); opacity: 0; }
                30% { transform: translateY(0); opacity: 1; }
                40% { transform: translateY(-4px); }
                48%, 100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes p4-card {
                0% { transform: translate(120px, 150px) rotateX(60deg) rotateY(0deg) scale(0.6); opacity: 0; }
                32% { transform: translate(120px, 145px) rotateX(30deg) rotateY(180deg) scale(0.8); opacity: 1; }
                60%, 100% { transform: translate(120px, 140px) rotateX(15deg) rotateY(360deg) scale(0.85); opacity: 1; }
              }
              @keyframes p4-card-shimmer {
                0% { transform: translate(-80px, -80px) rotate(35deg); }
                100% { transform: translate(120px, 120px) rotate(35deg); }
              }
              @keyframes p4-seal {
                0%, 58% { transform: translate(120px, 85px) scale(2.6); opacity: 0; }
                66% { transform: translate(120px, 85px) scale(0.9); opacity: 1; }
                74% { transform: translate(120px, 85px) scale(1.08); }
                82%, 100% { transform: translate(120px, 85px) scale(1); opacity: 1; }
              }
              @keyframes p4-shake {
                0%, 65%, 72%, 100% { transform: translate(0, 0); }
                66% { transform: translate(-3px, 2px) rotate(-0.6deg); }
                67% { transform: translate(2px, -3px) rotate(0.8deg); }
                68% { transform: translate(-2px, -1px) rotate(-0.4deg); }
                69% { transform: translate(1px, 2px) rotate(0.4deg); }
                70% { transform: translate(-1px, -1px) rotate(-0.2deg); }
              }
              @keyframes p4-confetti-1 {
                0%, 66% { transform: translate(70px, -10px) rotate(0deg); opacity: 0; }
                70% { opacity: 1; }
                100% { transform: translate(40px, 160px) rotate(270deg); opacity: 0; }
              }
              @keyframes p4-confetti-2 {
                0%, 66% { transform: translate(100px, -10px) rotate(0deg); opacity: 0; }
                70% { opacity: 1; }
                100% { transform: translate(110px, 170px) rotate(-180deg); opacity: 0; }
              }
              @keyframes p4-confetti-3 {
                0%, 66% { transform: translate(140px, -10px) rotate(0deg); opacity: 0; }
                70% { opacity: 1; }
                100% { transform: translate(170px, 165px) rotate(360deg); opacity: 0; }
              }
              @keyframes p4-confetti-4 {
                0%, 66% { transform: translate(170px, -10px) rotate(0deg); opacity: 0; }
                70% { opacity: 1; }
                100% { transform: translate(195px, 150px) rotate(-90deg); opacity: 0; }
              }
            `}</style>

            {/* Confetti falling particles */}
            <rect style={{ animation: "p4-confetti-1 3s ease-out infinite" }} width="6" height="6" fill="#f59e0b" rx="1.5" />
            <circle style={{ animation: "p4-confetti-2 3s ease-out infinite" }} r="3.5" fill="#3b82f6" />
            <rect style={{ animation: "p4-confetti-3 3s ease-out infinite" }} width="7" height="5" fill="#10b981" rx="1" />
            <circle style={{ animation: "p4-confetti-4 3s ease-out infinite" }} r="3" fill="#ec4899" />

            {/* Receipt invoice ticket container */}
            <g style={{ animation: "p4-receipt 3s cubic-bezier(0.25, 1, 0.5, 1) infinite", transformOrigin: "center top" }} filter="url(#p4-shadow)">
              <path d="M70,10 L170,10 L170,135 L162,130 L154,135 L146,130 L138,135 L130,130 L122,135 L114,130 L106,135 L98,130 L90,135 L82,130 L70,135 Z" fill="url(#p4-receiptGrad)" stroke="#e4dfd3" strokeWidth="1.5" />
              
              <line x1="66" y1="10" x2="174" y2="10" stroke="#1f3d36" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />

              <rect x="86" y="24" width="68" height="6" rx="2" fill="#2f7a6f" opacity="0.6" />
              
              <line x1="86" y1="44" x2="134" y2="44" stroke="#1f3d36" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
              {/* Receipt Title */}
              <rect x="86" y="22" width="68" height="6" rx="2" fill="#2f7a6f" opacity="0.6" />
              
              {/* Product list details */}
              <text x="86" y="44" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif">Sneaker</text>
              <text x="154" y="44" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif" textAnchor="end">$89.99</text>
              
              <text x="86" y="56" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif">Smartwatch</text>
              <text x="154" y="56" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif" textAnchor="end">$149.50</text>

              <text x="86" y="68" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif">T-Shirt</text>
              <text x="154" y="68" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif" textAnchor="end">$24.99</text>

              <text x="86" y="80" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif">Headphones</text>
              <text x="154" y="80" fill="#1f3d36" fontSize="7.5" fontWeight="bold" opacity="0.75" fontFamily="sans-serif" textAnchor="end">$79.99</text>

              <line x1="86" y1="92" x2="154" y2="92" stroke="#1f3d36" strokeWidth="1" strokeDasharray="2 2" opacity="0.25" />

              {/* Total summary */}
              <text x="86" y="106" fill="#1f3d36" fontSize="9" fontWeight="900" fontFamily="sans-serif" opacity="0.9">Total</text>
              <text x="154" y="106" fill="#1f3d36" fontSize="9" fontWeight="900" fontFamily="sans-serif" opacity="0.9" textAnchor="end">$344.47</text>

              {/* Decorative stamp shadow/rings */}
              <circle cx="150" cy="85" r="4" fill="#1f3d36" opacity="0.15" />
              <circle cx="150" cy="85" r="8" fill="none" stroke="#1f3d36" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.15" />
            </g>

            {/* Placed Order Success Seal */}
            <g style={{ animation: "p4-seal 3s cubic-bezier(0.175, 0.885, 0.32, 1.25) infinite", transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="19" fill="#10b981" filter="url(#p4-shadow)" />
              <circle cx="0" cy="0" r="15.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M-6,-1 L-1,4 L7,-4" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Credit Card with dynamic style parameters */}
            <g style={{ animation: "p4-card 3s cubic-bezier(0.25, 1, 0.5, 1) infinite", transformOrigin: "0px 0px" }} filter="url(#p4-shadow)">
              <rect x="-56" y="-34" width="112" height="68" rx="10" fill={`url(#${card.gradId})`} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              
              <g opacity="0.2">
                <rect x="-65" y="-65" width="16" height="130" fill="url(#p4-shimmer)" style={{ animation: "p4-card-shimmer 3s ease-in-out infinite", transformOrigin: "center" }} />
              </g>

              <rect x="-42" y="-18" width="15" height="12" rx="2" fill="#fbbf24" opacity="0.9" />
              <line x1="-34" y1="-18" x2="-34" y2="-6" stroke="#000" strokeWidth="0.8" opacity="0.15" />
              <line x1="-42" y1="-12" x2="-27" y2="-12" stroke="#000" strokeWidth="0.8" opacity="0.15" />

              <circle cx="34" cy="18" r="7.5" fill="#ef4444" opacity="0.85" />
              <circle cx="40" cy="18" r="7.5" fill="#f59e0b" opacity="0.75" />

              <rect x="-42" y="10" width="34" height="3.5" rx="1" fill="#fff" opacity="0.2" />
              <rect x="-42" y="18" width="22" height="3" rx="1" fill="#fff" opacity="0.15" />
            </g>
          </svg>
        );
      }
    }
  };

  const progressPercent = isDemoMode
    ? Math.min((elapsedSeconds / 48) * 100, 98)
    : status === "connecting"
      ? Math.min(elapsedSeconds * 4, 45)
      : Math.min(45 + (elapsedSeconds - 10) * 1.5, 92);

  const activeColor = phase === 1 ? "#eab308" : phase === 2 ? "#2563eb" : phase === 3 ? "#ea580c" : "#10b981";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f3ecdf] p-6 text-[#1f3d36] transition-all duration-700 select-none">
      {isDemoMode && (
        <div className="absolute top-4 right-4 z-[10000] bg-white/80 text-[#2f7a6f] px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2f7a6f] animate-ping" />
            🛠️ Demo Mode Active
          </span>
          <button 
            onClick={() => {
              if (retryTimerRef.current) clearInterval(retryTimerRef.current);
              if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
              onAwake();
            }} 
            className="bg-[#2f7a6f] hover:bg-[#1f4d46] text-white px-3.5 py-1.5 rounded-full transition-all font-extrabold shadow-sm active:scale-95"
          >
            Skip to Store
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Main glassmorphic card container */}
      <div className="w-full max-w-lg rounded-[32px] border border-white/60 bg-white/70 p-10 text-center shadow-[0_24px_50px_rgba(31,61,54,0.08)] backdrop-blur-xl">

        {/* Animated Visual Section (Enlarged and overflow visible) */}
        <div className="relative mx-auto mb-10 flex h-64 w-64 items-center justify-center overflow-visible">
          {status === "failed" ? (
            /* Premium Error Icon */
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-50 border border-red-100 shadow-sm animate-bounce">
              <svg className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            renderAnimation()
          )}
        </div>

        {/* Stationary Premium Header */}
        <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1f3d36]">
          ShopSphere
        </h2>

        {/* Dynamic Connection Status Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#1f3d36]/60">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${
            status === "connecting" ? "bg-amber-500 animate-pulse" :
            status === "waiting" ? "bg-amber-400 animate-ping" : "bg-red-500"
          }`} />
          <span>
            {status === "connecting" && `Connecting to server${dots}`}
            {status === "waiting" && `Starting server environment${dots}`}
            {status === "failed" && "Server connection timed out"}
          </span>
        </div>

        {/* Neon Progress Bar */}
        {status !== "failed" && (
          <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-stone-200/50 relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#eab308] via-[#2563eb] to-[#10b981] bg-[length:200%_auto]"
              style={{
                backgroundColor: activeColor,
                width: `${progressPercent}%`,
                animation: "shimmerSweep 2.5s linear infinite"
              }}
            />
          </div>
        )}

        {/* Rotating Fact Card */}
        <div className="min-h-[84px] rounded-2xl bg-stone-100/60 p-5 text-sm font-semibold leading-relaxed text-[#1f3d36]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] border border-stone-200/30 flex items-center justify-center">
          {status === "failed" ? (
            <span className="text-red-500">
              We couldn't connect to our services. Render's free tier services spin down after inactivity. Please check your internet connection or click below to retry.
            </span>
          ) : (
            ECOMMERCE_FACTS[factIndex]
          )}
        </div>

        {/* Retry Button */}
        {status === "failed" && (
          <button
            onClick={handleManualRetry}
            className="mt-6 w-full rounded-2xl bg-[#2f7a6f] px-6 py-4 font-bold text-white shadow-[0_10px_25px_rgba(47,122,111,0.2)] transition-all duration-200 hover:bg-[#1f4d46] hover:shadow-[0_12px_30px_rgba(47,122,111,0.3)] active:scale-[0.97]"
          >
            Retry Connection
          </button>
        )}

        {/* Ambient Helpful Info */}
        {status === "waiting" && (
          <p className="mt-4 text-xs font-medium leading-normal text-stone-400">
            ℹ️ Free server instances sleep after 15 minutes of inactivity. Our pings have started the boot sequence. Thank you for your patience!
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingSplash;
