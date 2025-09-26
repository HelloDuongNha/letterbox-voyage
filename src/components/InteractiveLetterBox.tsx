/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, ThreeEvent, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface LetterBoxProps {
  isOpen: boolean;
}

const LetterBox = React.forwardRef<THREE.Group, { 
  isOpen: boolean; 
  cardPosition: [number, number, number]; 
  onLoadComplete?: () => void;
}>(({ isOpen, cardPosition, onLoadComplete }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: closed, 1: top opening, 2: bottom opening
  const [texturesLoaded, setTexturesLoaded] = useState(0);
  
  // Load textures with progress tracking
  const frontTexture = useLoader(THREE.TextureLoader, '/front.png');
  const backTexture = useLoader(THREE.TextureLoader, '/back.png');
  const frontAfterTexture = useLoader(THREE.TextureLoader, '/front-after.png');
  const insideTopTexture = useLoader(THREE.TextureLoader, '/inside-top.png');
  const insideMidTexture = useLoader(THREE.TextureLoader, '/inside-mid.png');
  const insideBotTexture = useLoader(THREE.TextureLoader, '/inside-bot.png');

  // Track texture loading completion
  useEffect(() => {
    if (frontTexture && backTexture && frontAfterTexture && 
        insideTopTexture && insideMidTexture && insideBotTexture) {
      setTimeout(() => {
        onLoadComplete?.();
      }, 500); // Small delay to ensure everything is rendered
    }
  }, [frontTexture, backTexture, frontAfterTexture, insideTopTexture, insideMidTexture, insideBotTexture, onLoadComplete]);
  
  // ==================== OPENING ANIMATION SYSTEM (DO NOT MODIFY) ====================
  // This section handles the letter opening animation - DO NOT CHANGE
  
  // Smooth animation values for opening
  const [topRotation, setTopRotation] = useState(Math.PI); // Start folded
  const [bottomRotation, setBottomRotation] = useState(-Math.PI); // Start folded like top

  // Opening animation logic - PROTECTED SECTION
  const handleOpeningAnimation = (state: any, delta: number) => {
    if (groupRef.current && !isOpen) {
      // No floating animation - keep still
      groupRef.current.position.y = 0;
      // Removed auto rotation for better user control
    }

    // Smooth transitions for opening
    const speed = 1.5; // Animation speed - slower for more graceful opening
    
    // Opening animation targets
    const targetTopRotation = animationPhase >= 1 ? 0 : Math.PI;
    const targetBottomRotation = animationPhase >= 2 ? 0 : -Math.PI; // Stay folded until phase 2
    
    setTopRotation(prev => {
      const diff = targetTopRotation - prev;
      return prev + diff * speed * delta;
    });
    
    setBottomRotation(prev => {
      const diff = targetBottomRotation - prev;
      return prev + diff * speed * delta;
    });
  };

  // Opening sequence controller - PROTECTED SECTION
  const triggerOpeningSequence = () => {
    // Small delay to ensure initial state is fully rendered before animation starts
    setTimeout(() => {
      setAnimationPhase(1);
    }, 100);
    // Bottom starts opening when top is 70% open - slightly faster bottom opening
    setTimeout(() => {
      setAnimationPhase(2);
    }, 900); // Reduced from 1100ms to 900ms for faster bottom opening
  };

  // Opening effect handler - PROTECTED SECTION
  React.useEffect(() => {
    if (isOpen) {
      triggerOpeningSequence();
    } else {
      // TODO: Add closing animation here (without affecting opening logic)
      handleResetToClosedState();
    }
  }, [isOpen]);

  // Reset to closed state - PROTECTED SECTION
  const handleResetToClosedState = () => {
    setAnimationPhase(0);
    setTopRotation(Math.PI);
    setBottomRotation(-Math.PI);
  };

  // ==================== END OPENING ANIMATION SYSTEM ====================

  // ==================== CLOSING ANIMATION SYSTEM (TO BE IMPLEMENTED) ====================
  // TODO: Add closing animation logic here
  // This section will handle the letter closing animation
  
  // Placeholder for closing animation
  const handleClosingAnimation = (state: any, delta: number) => {
    // TODO: Implement closing animation logic here
    // This should smoothly close the letter with reverse sequence
  };

  // ==================== END CLOSING ANIMATION SYSTEM ====================

  // Main animation frame handler
  useFrame((state, delta) => {
    // Always run opening animation logic (protected)
    handleOpeningAnimation(state, delta);
    
    // TODO: Add closing animation logic when implemented
    // handleClosingAnimation(state, delta);
  });

  // Combine refs
  React.useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={cardPosition as [number, number, number]}>
      {/* Main box container */}
      <group>
        {/* Folded letter structure */}
        {!isOpen ? (
          // Closed state - showing front texture
          <>
            {/* Front face when closed */}
            <mesh position={[0, 0, 0.039]} rotation={[0, 0, 0]}>
              <planeGeometry args={[4, 2]} />
              <meshStandardMaterial 
                map={frontTexture}
                metalness={0.1} 
                roughness={0.3}
                transparent={true}
              />
            </mesh>
          </>
        ) : (
          // Open state - simple tri-fold paper
          <>
            {/* Top section - inside-top front, front-after back */}
            <group position={[0, animationPhase >= 1 ? 1 : 0, 0.04]}>
              <group rotation={[topRotation, 0, 0]}>
                <mesh position={[0, animationPhase >= 1 ? 1 : 0, 0]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={insideTopTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
                <mesh position={[0, animationPhase >= 1 ? 1 : 0, -0.001]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={frontAfterTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
              </group>
            </group>

            {/* Center section - inside-mid front, back.png back */}
            <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0]}>
              <planeGeometry args={[4, 2]} />
              <meshStandardMaterial 
                map={insideMidTexture}
                metalness={0.1} 
                roughness={0.3}
                transparent={true}
              />
            </mesh>
            <mesh position={[0, 0, 0.039]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[4, 2]} />
              <meshStandardMaterial 
                map={backTexture}
                metalness={0.1} 
                roughness={0.3}
                transparent={true}
              />
            </mesh>

            {/* Bottom section - inside-bot front, white back (moved behind mid) */}
            <group position={[0, animationPhase >= 2 ? -1 : 0, 0.04]}>
              <group rotation={[bottomRotation, 0, 0]}>
                <mesh position={[0, animationPhase >= 2 ? -1 : 0, 0]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={insideBotTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
                <mesh position={[0, animationPhase >= 2 ? -1 : 0, -0.001]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    color="#ffffff"
                    metalness={0.1} 
                    roughness={0.3}
                  />
                </mesh>
              </group>
            </group>
          </>
        )}

        {/* Back face - only visible when closed */}
        {!isOpen && (
          <mesh position={[0, 0, 0.039]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[4, 2]} />
            <meshStandardMaterial 
              map={backTexture}
              metalness={0.1} 
              roughness={0.3}
              transparent={true}
            />
          </mesh>
        )}



      </group>

    </group>
  );
});

LetterBox.displayName = 'LetterBox';

interface InteractiveLetterBoxProps {
  className?: string;
  isOpen: boolean;
  onCameraControl?: (action: 'top' | 'middle' | 'bottom') => void;
  onLoadComplete?: () => void;
}

export const InteractiveLetterBox = React.forwardRef<any, InteractiveLetterBoxProps>(({ className, isOpen, onCameraControl, onLoadComplete }, ref) => {
  // isOpen is now controlled from parent component
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [cardPosition, setCardPosition] = useState([0, 0, 0]);
  
  // Detect mobile for enhanced lighting and zoom settings
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Fast and responsive camera control
  React.useEffect(() => {
    const handleCameraControl = (scrollValue: number) => {
      // Instant response - no smoothing
      const normalizedValue = scrollValue / 100; // 0 to 1
      const yPosition = (normalizedValue - 0.5) * -5; // -2.5 to +2.5, inverted
      setCardPosition([0, yPosition, 0]);
    };
    
    // Expose function to parent
    (window as any).handleCameraControl = handleCameraControl;
    
    // Expose reset to center function for mobile
    (window as any).resetToCenter = () => {
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      setCardPosition([0, 0, 0]);
    };
  }, []);



  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        performance={{ min: 0.8 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={isMobile ? 35 : 50} ref={cameraRef} />
        
        {/* Clean and bright lighting setup - optimized for readability */}
        {/* HemisphereLight for natural overall illumination */}
        <hemisphereLight 
          color={0xffffff} 
          groundColor={0xb8b8b8} 
          intensity={isMobile ? 1.0 : 0.9}
        />
        
        {/* AmbientLight for even base lighting */}
        <ambientLight 
          color={0xffffff} 
          intensity={isMobile ? 1.4 : 1.2} 
        />
        
        {/* Gentle DirectionalLight from top-left diagonal - no direct glare */}
        <directionalLight 
          position={[-4, 6, 4]} 
          intensity={isMobile ? 0.6 : 0.5}
          color={0xffffff}
          castShadow={false}
        />
        
        {/* Soft fill light from opposite side for balance */}
        <directionalLight 
          position={[3, 4, 5]} 
          intensity={isMobile ? 0.4 : 0.3}
          color={0xffffff}
          castShadow={false}
        />

        <LetterBox isOpen={isOpen} cardPosition={cardPosition as [number, number, number]} onLoadComplete={onLoadComplete} ref={ref} />
        
        <OrbitControls 
          ref={controlsRef}
          enablePan={isOpen}
          enableZoom={true}
          minDistance={isMobile ? 2 : 3}
          maxDistance={12}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableDamping
          dampingFactor={0.15}
          rotateSpeed={0.3}
          maxAzimuthAngle={Infinity}
          minAzimuthAngle={-Infinity}
        />
      </Canvas>
    </div>
  );
});

InteractiveLetterBox.displayName = 'InteractiveLetterBox';