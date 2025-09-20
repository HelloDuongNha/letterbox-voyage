import { OrientationWarning } from "@/components/OrientationWarning";
import { InteractiveLetterBox } from "@/components/InteractiveLetterBox";

const Index = () => {
  return (
    <>
      <OrientationWarning />
      
      <main className="fixed inset-0 flex items-center justify-center overflow-hidden">
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
        <div className="relative w-full h-full max-w-4xl max-h-3xl">
          <InteractiveLetterBox className="letter-float" />
          
          {/* Instruction text */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-muted-foreground text-sm mb-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50">
              Kéo để xoay • Bấm nút đen để mở thư
            </p>
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