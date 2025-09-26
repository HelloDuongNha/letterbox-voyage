/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import { OrientationWarning } from "@/components/OrientationWarning";
import { InteractiveLetterBox } from "@/components/InteractiveLetterBox";
import { Button } from "@/components/ui/button";
import { Group } from "three";

// Memoized star background component to prevent re-render issues
const StarBackground = () => {
  // Generate star positions once and memoize them
  const stars = useMemo(() => {
    return [...Array(120)].map((_, i) => {
      const angle = (i / 120) * 2 * Math.PI;
      const radius = 40 + Math.random() * 70;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        id: i,
        left: `${50 + x}%`,
        top: `${50 + y}%`
      };
    });
  }, []); // Empty dependency array - only create once

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute"
        style={{
          left: '0%',
          top: '-100%',
          width: '300vw',
          height: '300vh',
          animation: 'movingStars 200s linear infinite'
        }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-90"
            style={{
              left: star.left,
              top: star.top,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  const [letterState, setLetterState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [scrollValue, setScrollValue] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const letterRef = useRef<Group>(null);
  
  // Detect mobile devices for map threshold
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mapThreshold = isMobile ? 20 : 40;

  const handleOpenLetter = () => {
    setLetterState('opening');
    // Reset scroll value when opening to ensure correct button visibility
    setScrollValue(50);
    // Animation will complete in ~1060ms (560ms + 500ms), then show close button
    setTimeout(() => {
      setLetterState('open');
    }, 1060);
  };

  const handleCloseLetter = () => {
    console.log("closing...");
    
    // Mobile: reset to center immediately
    if (isMobile && (window as any).resetToCenter) {
      (window as any).resetToCenter();
    }
    
    // Immediate UI feedback - change button state
    setLetterState('closing');
    if (letterRef.current) {
      console.log("Letter closing...");
      
      // Small delay to ensure state is rendered, then start rotation
      setTimeout(() => {
        // 2. Reset rotation and start rotation tween around Y axis
        letterRef.current!.rotation.set(0, 0, 0);
        console.log("Starting rotation tween");
        
        const startRotation = 0; // Start from 0
        const targetRotation = Math.PI * 2; // 1 full rotation
        const duration = 800; // 0.8 seconds (faster)
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // EaseOutCubic - slow down towards the end
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          letterRef.current!.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            console.log("1-rotation tween completed!");
            // 3. Change to final closed state and show open button
            setLetterState('closed');
          }
        };
        
        animate();
      }, 50); // Small delay to ensure state change is rendered
      
    } else {
      // Fallback if ref not available
      setTimeout(() => {
        setLetterState('closed');
      }, 100);
    }
  };

  const handleInstructionsClick = () => {
    const instructions = isMobile 
      ? "ຄໍາແນະນໍາການນໍາໃຊ້ (Mobile):\n\nຢູ່ນອກຈົດໝາຍ:\n• ໃຊ້ 2 ນິ້ວເພື່ອໝຸນອ້ອມຈົດໝາຍ\n\nເມື່ອເປີດຈົດໝາຍ:\n• ໃຊ້ 2 ນິ້ວເພື່ອ zoom in/out\n• ໃຊ້ 2 ນິ້ວເພື່ອຫຼິ້ນຂຶ້ນ/ລົງ, ຊ້າຍ/ຂວາ\n• ໃຊ້ 1 ນິ້ວເພື່ອໝຸນອ້ອມຈົດໝາຍ"
      : "ຄໍາແນະນໍາການນໍາໃຊ້ (PC):\n\nຢູ່ນອກຈົດໝາຍ:\n• ກົດຄ້າງ mouse ຊ້າຍແລະລາກເພື່ອໝຸນອ້ອມຈົດໝາຍ\n\nເມື່ອເປີດຈົດໝາຍ:\n• ໃຊ້ແຖບເລື່ອນເພື່ອຫຼິ້ນຂຶ້ນ/ລົງ\n• ກົດຄ້າງ mouse ຊ້າຍແລະລາກເພື່ອໝຸນອ້ອມຈົດໝາຍ\n• Zoom: ຫຼິ້ນ mouse (ຖ້າມີ) ຫຼື 2 ນິ້ວເທິງ touchpad";
    
    setShowInstructions(true);
    alert(instructions);
    
    // Auto close after 10 seconds
    setTimeout(() => {
      setShowInstructions(false);
    }, 10000);
  };

  const handleMapClick = () => {
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: use original link
      window.open('https://maps.app.goo.gl/biQyMC6f9BX1AyAJ6?g_st=ipc', '_blank');
    } else {
      // PC/Desktop: use new link
      window.open('https://maps.app.goo.gl/RhtYkL7w2ncQYXos5', '_blank');
    }
  };

  const handleLoadComplete = () => {
    setTexturesLoaded(true);
  };

  // Audio loading and management
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlayThrough = () => {
        setAudioLoaded(true);
      };

      const handleLoadStart = () => {
        setAudioLoaded(false);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.load(); // Start loading

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, []);

  // Handle user interaction for audio
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      const audio = audioRef.current;
      if (audio && audioLoaded) {
        audio.play().catch(err => {
          console.log('Audio play failed:', err);
        });
      }
    }
  };

  // Complete loading when both textures and audio are ready
  useEffect(() => {
    if (texturesLoaded && audioLoaded) {
      setTimeout(() => {
        setIsLoading(false);
        setShowWelcomeScreen(true);
      }, 500);
    }
  }, [texturesLoaded, audioLoaded]);

  // Handle welcome screen interaction
  const handleWelcomeClick = () => {
    setUserInteracted(true);
    setShowWelcomeScreen(false);
    // Play music when user clicks "Xem thiệp"
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  };

  // Simulate loading progress based on what's loaded
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          let maxProgress = 40; // Base progress
          if (audioLoaded) maxProgress += 30; // Audio adds 30%
          if (texturesLoaded) maxProgress += 30; // Textures add 30%
          
          if (prev >= maxProgress) {
            clearInterval(interval);
            return maxProgress;
          }
          return prev + Math.random() * 4;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, audioLoaded, texturesLoaded]);

  // Complete loading when textures are ready
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  const handleFullscreen = () => {
    // Check if we're on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS && isSafari) {
        // For iOS Safari, show instruction to use "Add to Home Screen"
        alert('ເພື່ອໃຊ້ງານແບບເຕັມຈໍ:\n1. ກົດປຸ່ມ Share (ລູກສອນຂຶ້ນ)\n2. ເລືອກ "Add to Home Screen"\n3. ເປີດຈາກໜ້າຈໍຫຼັກ');
      } else {
        // For Android and other mobile browsers, show add to homescreen instruction
        alert('ເພື່ອໃຊ້ງານແບບເຕັມຈໍ:\n1. ກົດເມນູ browser (3 ຈຸດ)\n2. ເລືອກ "Add to Home Screen"\n3. ເປີດຈາກໜ້າຈໍຫຼັກ');
      }
      return;
    }

    // For laptop/PC - use F11 fullscreen API
    if (!document.fullscreenElement) {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.log('Error attempting to enable fullscreen:', err);
          // If fullscreen API fails, try to simulate F11 by hiding browser UI
          alert('กดปุ่ม F11 เพื่อเข้าสู่โหมดเต็มจอ');
        });
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
        setIsFullscreen(true);
      } else {
        // Fallback: inform user to press F11
        alert('กดปุ่ม F11 เพื่อเข้าสู่โหมดเต็มจอ');
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

  // Prevent context menu only (right click and long press menu) - TEMPORARILY DISABLED
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent right click context menu on web only
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  return (
    <>
      <OrientationWarning />
      
      {/* Background Music */}
      <audio 
        ref={audioRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/music.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Fixed background - completely independent */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background opacity-90" />
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background">
          {/* Loading Text */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">ກຳລັງໂຫຼດ...</h2>
            <p className="text-muted-foreground">ກະລຸນາລໍຖ້າ ກຳລັງກະກຽມບົດແຖນ</p>
            <div className="mt-2 text-xs text-muted-foreground/70">
              {!audioLoaded && !texturesLoaded && "ກຳລັງໂຫຼດສຽງ ແລະ ຮູບພາບ..."}
              {audioLoaded && !texturesLoaded && "ກຳລັງໂຫຼດຮູບພາບ..."}
              {!audioLoaded && texturesLoaded && "ກຳລັງໂຫຼດສຽງ..."}
              {audioLoaded && texturesLoaded && "ກຳລັງສຳເລັດ..."}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-80 max-w-sm">
            <div className="mb-2 flex justify-between text-sm text-muted-foreground">
              <span>ຄວາມຄືບໜ້າ</span>
              <span>{Math.round(loadingProgress)}%</span>
            </div>
            <div className="w-full bg-card/60 rounded-full h-3 overflow-hidden border border-border/50">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
          
          {/* Loading Animation */}
          <div className="mt-8 flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Welcome Screen with Wedding Message */}
      {showWelcomeScreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
          {/* Wedding Message - Portrait vs Landscape responsive */}
          <div className="text-center max-w-sm md:max-w-lg w-full 
                          portrait:space-y-6 landscape:space-y-1">
            
            {/* Header - Portrait: original size, Landscape: compact */}
            <div className="portrait:mb-6 landscape:mb-1">
              <h2 className="portrait:text-3xl landscape:text-xl font-bold text-foreground portrait:mb-2 landscape:mb-1">ຂໍເຊີນ</h2>
              <p className="portrait:text-xl landscape:text-sm text-muted-foreground portrait:mb-4 landscape:mb-1">ມາຮ່ວມແບ່ງປັນຄວາມສຸກ</p>
            </div>
            
            {/* Message Card - Tighter padding */}
            <div className="bg-card/40 backdrop-blur-sm rounded-lg 
                            portrait:p-6 landscape:p-3
                            portrait:px-6 landscape:px-4
                            border border-border/50 
                            portrait:mb-8 landscape:mb-2">
              <p className="portrait:text-lg landscape:text-sm text-foreground leading-relaxed portrait:mb-4 landscape:mb-2">
                ໃນວັນສຳຄັນຂອງພວກເຮົາ<br/>
                ຂໍໃຫ້ທ່ານມາເປັນພະຍານ<br/>
                ໃນຄວາມສຸກແລະຄວາມຮັກ
              </p>
              <div className="portrait:text-sm landscape:text-xs text-muted-foreground">
                ດ້ວຍຄວາມຮັກແລະຄວາມເຄົາລົບ ❤️
              </div>
            </div>

            {/* Call-to-Action Button */}
            <Button 
              onClick={handleWelcomeClick}
              className="portrait:px-8 landscape:px-4 portrait:py-4 landscape:py-2 portrait:text-lg landscape:text-base font-semibold 
                        bg-gradient-to-r from-primary to-accent 
                        text-primary-foreground 
                        hover:from-primary/90 hover:to-accent/90 
                        rounded-full shadow-lg 
                        transition-all duration-500 ease-in-out
                        transform hover:scale-105 active:scale-95
                        hover:shadow-xl hover:shadow-primary/25
                        md:animate-none animate-pulse
                        md:hover:animate-none hover:animate-none"
              style={{
                animationDuration: '2s'
              }}
            >
              <span className="flex items-center gap-2">
                <span className="animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0s' }}>🎉</span>
                <span>ເບິ່ງບົດເຊີນ</span>
                <span className="animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.4s' }}>🎉</span>
              </span>
            </Button>
          </div>
        </div>
      )}
      
      <StarBackground />

      <main className="fixed inset-0 flex items-center justify-center overflow-visible">

        {/* Main 3D Letter Box */}
        <div className="relative w-full h-full max-w-4xl max-h-3xl overflow-visible">
          <InteractiveLetterBox 
            className="letter-float" 
            isOpen={letterState === 'opening' || letterState === 'open'}
            onLoadComplete={handleLoadComplete}
            ref={letterRef}
          />

          
          {/* Scroll bar - only when open and not mobile, responsive for landscape */}
          {letterState === 'open' && !isMobile && (
            <div className="absolute portrait:right-12 landscape:right-6 
                            portrait:top-1/2 landscape:top-1/2 
                            transform -translate-y-1/2 flex flex-col items-center 
                            portrait:gap-2 landscape:gap-1">
              {/* Top indicator */}
              <div className="portrait:text-xs landscape:text-[10px] text-muted-foreground font-medium bg-card/80 backdrop-blur-sm 
                              portrait:px-2 landscape:px-1 portrait:py-1 landscape:py-0.5 
                              rounded border border-border/50">
                ເທິງ
              </div>
              
              {/* Scroll bar */}
              <div className="relative portrait:h-48 landscape:h-32 portrait:w-8 landscape:w-6 
                              bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  // orient="vertical"
                  className="absolute w-full h-full bg-transparent appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none 
                           portrait:[&::-webkit-slider-thumb]:w-7 landscape:[&::-webkit-slider-thumb]:w-5
                           portrait:[&::-webkit-slider-thumb]:h-12 landscape:[&::-webkit-slider-thumb]:h-8
                           [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-lg [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-track]:bg-white [&::-webkit-slider-track]:rounded-lg [&::-webkit-slider-track]:h-full
                           [&::-webkit-slider-runnable-track]:bg-white
                           [&::-webkit-slider-progress]:bg-white
                           portrait:[&::-moz-range-thumb]:w-7 landscape:[&::-moz-range-thumb]:w-5
                           portrait:[&::-moz-range-thumb]:h-12 landscape:[&::-moz-range-thumb]:h-8
                           [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-lg
                           [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
                           [&::-moz-range-track]:bg-white [&::-moz-range-track]:rounded-lg
                           [&::-moz-range-progress]:bg-white
                           [&::-ms-track]:bg-white
                           [&::-ms-fill-lower]:bg-white
                           [&::-ms-fill-upper]:bg-white"
                  style={{ 
                    writingMode: 'bt-lr' as any,
                    WebkitAppearance: 'slider-vertical',
                    width: '100%',
                    height: '100%'
                  }}
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value);
                    setScrollValue(value);
                    // Use onInput for real-time updates + RAF throttling
                    (window as any).handleCameraControl?.(value);
                  }}
                  onChange={(e) => {
                    // Keep onChange for compatibility
                    const value = parseInt(e.target.value);
                    setScrollValue(value);
                    (window as any).handleCameraControl?.(value);
                  }}
                />
              </div>
              
              {/* Bottom indicator */}
              <div className="portrait:text-xs landscape:text-[10px] text-muted-foreground font-medium bg-card/80 backdrop-blur-sm 
                              portrait:px-2 landscape:px-1 portrait:py-1 landscape:py-0.5 
                              rounded border border-border/50">
                ລຸ່ມ
              </div>
            </div>
          )}

          {/* Instructions button - top left corner */}
          <div className="absolute top-8 left-8">
            <Button
              onClick={handleInstructionsClick}
              className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card text-foreground shadow-lg flex items-center justify-center"
              size="sm"
            >
              ?
            </Button>
          </div>

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

          {/* Controls - Positioned lower to avoid being cut off */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center gap-2 sm:gap-3 pb-safe">
            {/* PC Map Button - with scroll condition */}
            {letterState === 'open' && !isMobile && scrollValue <= mapThreshold && (
              <div 
                key={`map-button-${scrollValue}`}
                onClick={handleMapClick}
                className="text-muted-foreground text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-card/80 backdrop-blur-sm rounded-full border border-red-500 cursor-pointer hover:bg-card/90 transition-colors"
              >
                📍 ເບິ່ງແຜນທີ່
              </div>
            )}
            
            
            {/* Open/Close Button - Same position for both states */}
            {letterState === 'closed' && (
              <Button 
                onClick={handleOpenLetter}
                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-base sm:text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg transition-all duration-300 min-w-[80px] sm:min-w-[100px]"
              >
                ເປີດ
              </Button>
            )}
            
            {letterState === 'open' && (
              <Button 
                onClick={handleCloseLetter}
                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-base sm:text-lg font-semibold bg-red-600 text-white hover:bg-red-700 rounded-full shadow-lg transition-all duration-300 min-w-[80px] sm:min-w-[100px]"
              >
                ປິດ
              </Button>
            )}
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