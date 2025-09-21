import { useState, useEffect } from "react";
import { OrientationWarning } from "@/components/OrientationWarning";
import { InteractiveLetterBox } from "@/components/InteractiveLetterBox";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollValue, setScrollValue] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/biQyMC6f9BX1AyAJ6?g_st=ic', '_blank');
  };

  const handleFullscreen = () => {
    // Check if we're on iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // For iOS Safari, show instruction to use "Add to Home Screen"
      alert('ເພື່ອໃຊ້ງານແບບເຕັມຈໍ:\n1. ກົດປຸ່ມ Share (ລູກສອນຂຶ້ນ)\n2. ເລືອກ "Add to Home Screen"\n3. ເປີດຈາກໜ້າຈໍຫຼັກ');
      return;
    }

    // Standard fullscreen API for other browsers
    if (!document.fullscreenElement) {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.log('Error attempting to enable fullscreen:', err);
        });
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <OrientationWarning />
      
      {/* Fixed background - completely independent */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background opacity-90" />
      
      {/* Fixed floating particles - circular motion with hidden center */}
      <div 
        className="fixed pointer-events-none"
        style={{
          left: '120%', // Center point at bottom right outside viewport
          top: '120%',  // Center point at bottom right outside viewport
          width: '300vw',
          height: '300vh',
          animation: 'movingStars 120s linear infinite'
        }}
      >
        {[...Array(300)].map((_, i) => {
          const angle = (i / 300) * 2 * Math.PI; // Distribute many more stars in a circle
          const radius = 60 + Math.random() * 100; // Closer to center for more visibility
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse opacity-80"
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          );
        })}
        {/* Additional layer with different sizes */}
        {[...Array(200)].map((_, i) => {
          const angle = (i / 200) * 2 * Math.PI;
          const radius = 120 + Math.random() * 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`layer2-${i}`}
              className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-pulse opacity-60"
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          );
        })}
        {/* Third layer with tiny stars */}
        {[...Array(160)].map((_, i) => {
          const angle = (i / 160) * 2 * Math.PI;
          const radius = 180 + Math.random() * 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`layer3-${i}`}
              className="absolute w-0.5 h-0.5 bg-yellow-100 rounded-full animate-pulse opacity-40"
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
              }}
            />
          );
        })}
      </div>

      <main className="fixed inset-0 flex items-center justify-center overflow-visible">

        {/* Main 3D Letter Box */}
        <div className="relative w-full h-full max-w-4xl max-h-3xl overflow-visible">
          <InteractiveLetterBox 
            className="letter-float" 
            isOpen={isOpen}
          />
          
          {/* Scroll bar - only when open */}
          {isOpen && (
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2">
              {/* Top indicator */}
              <div className="text-xs text-muted-foreground font-medium bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
                TOP
              </div>
              
              {/* Scroll bar */}
              <div className="relative h-48 w-8 md:w-8 sm:w-12 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  orient="vertical"
                  className="absolute w-full h-full bg-transparent appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-12
                           [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-lg [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-track]:bg-white [&::-webkit-slider-track]:rounded-lg [&::-webkit-slider-track]:h-full
                           [&::-webkit-slider-runnable-track]:bg-white
                           [&::-webkit-slider-progress]:bg-white
                           [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-12 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-lg
                           [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
                           [&::-moz-range-track]:bg-white [&::-moz-range-track]:rounded-lg
                           [&::-moz-range-progress]:bg-white
                           [&::-ms-track]:bg-white
                           [&::-ms-fill-lower]:bg-white
                           [&::-ms-fill-upper]:bg-white
                           sm:[&::-webkit-slider-thumb]:w-10 sm:[&::-webkit-slider-thumb]:h-16
                           sm:[&::-moz-range-thumb]:w-10 sm:[&::-moz-range-thumb]:h-16"
                  style={{ 
                    writingMode: 'bt-lr',
                    WebkitAppearance: 'slider-vertical',
                    width: '100%',
                    height: '100%'
                  }}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setScrollValue(value);
                    (window as any).handleCameraControl?.(value);
                  }}
                />
              </div>
              
              {/* Bottom indicator */}
              <div className="text-xs text-muted-foreground font-medium bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
                BOT
              </div>
            </div>
          )}

          {/* Fullscreen button - bottom left corner */}
          <div className="absolute bottom-8 left-8">
            <Button
              onClick={handleFullscreen}
              className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card text-foreground shadow-lg flex items-center justify-center"
              size="sm"
            >
              {isFullscreen ? "⤓" : "⛶"}
            </Button>
          </div>

          {/* Instruction text and controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center gap-4">
            {!isOpen && (
              <p className="text-muted-foreground text-sm px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50">
                ລາກເພື່ອໝຸນ • ຊູມເພື່ອຂະຫຍາຍຮູບ
              </p>
            )}
            {isOpen && scrollValue < 20 && (
              <div 
                onClick={handleMapClick}
                className="text-muted-foreground text-sm px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50 cursor-pointer hover:bg-card/90 transition-colors"
              >
                📍 ເບິ່ງແຜນທີ່
              </div>
            )}
            <Button 
              onClick={handleToggle}
              className="px-6 py-3 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg"
            >
              {isOpen ? "Close" : "Open"}
            </Button>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-accent/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-accent/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-accent/30 rounded-br-lg" />
      </main>
    </>
  );
};

export default Index;