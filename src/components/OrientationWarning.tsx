import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";

export const OrientationWarning = () => {
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (isLandscape) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="text-center px-6 py-8 mx-4 max-w-sm bg-card rounded-2xl border border-border shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <RotateCcw className="w-16 h-16 text-accent animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-accent/30 rounded-full animate-ping" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-3">
          ກະລຸນາໝຸນໜ້າຈໍ
        </h2>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          ເພື່ອປະສົບການທີ່ດີທີ່ສຸດກັບກ່ອງຈົດໝາຍ 3D, ກະລຸນາໝຸນອຸປະກອນຂອງທ່ານໄປສູ່ໂໝດນອນ.
        </p>
        
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center justify-center space-x-2 text-accent text-xs font-medium">
            <div className="w-5 h-8 border-2 border-current rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
            <span>→</span>
            <div className="w-8 h-5 border-2 border-current rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};