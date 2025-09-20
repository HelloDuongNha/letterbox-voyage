import { useState } from "react";
import { OrientationWarning } from "@/components/OrientationWarning";
import { InteractiveLetterBox } from "@/components/InteractiveLetterBox";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollValue, setScrollValue] = useState(50);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMapClick = () => {
    window.open('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7587.830424422392!2d102.62391383610688!3d18.02913810370906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31245db46c923863%3A0xfc3decf4d300bdea!2sThavexok%20Development%20Construction%20Office!5e0!3m2!1svi!2s!4v1758390206753!5m2!1svi!2s', '_blank');
  };
  return (
    <>
      <OrientationWarning />
      
      <main className="fixed inset-0 flex items-center justify-center overflow-visible">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-90" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

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