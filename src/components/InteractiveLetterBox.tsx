import { useRef, useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, ThreeEvent, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface LetterBoxProps {
  isOpen: boolean;
}

const LetterBox = ({ isOpen, cardPosition, onLoadComplete }: { 
  isOpen: boolean; 
  cardPosition: [number, number, number]; 
  onLoadComplete?: () => void;
}) => {
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
  
  // Smooth animation values
  const [topRotation, setTopRotation] = useState(Math.PI); // Start folded
  const [bottomRotation, setBottomRotation] = useState(-Math.PI); // Start folded like top

  useFrame((state, delta) => {
    if (groupRef.current && !isOpen) {
      // Gentle floating animation when closed (always active)
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      groupRef.current.rotation.y += 0.002;
    }

    // Smooth transitions
    const speed = 3; // Animation speed
    
    // Opening animation only
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

  });

  // Simple opening animation only
  React.useEffect(() => {
    if (isOpen) {
      setAnimationPhase(1);
      // Bottom starts opening when top is 70% open (0.7 * 800ms = 560ms)
      setTimeout(() => {
        setAnimationPhase(2);
      }, 560);
    } else {
      setAnimationPhase(0);
      // Reset positions when closing
      setTopRotation(Math.PI);
      setBottomRotation(-Math.PI);
    }
  }, [isOpen]);

  return (
    <group ref={groupRef} position={cardPosition as [number, number, number]}>
      {/* Main box container */}
      <group>
        {/* Folded letter structure */}
        {!isOpen ? (
          // Closed state - showing front texture
          <>
            {/* Front face when closed */}
            <mesh position={[0, 0, 0.001]} rotation={[0, 0, 0]}>
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
            <group position={[0, 1, 0]}>
              <group rotation={[topRotation, 0, 0]}>
                <mesh position={[0, 1, 0.04]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={insideTopTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
                <mesh position={[0, 1, 0.039]} rotation={[0, Math.PI, 0]}>
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
            <group position={[0, -1, 0.08]}>
              <group rotation={[bottomRotation, 0, 0]}>
                <mesh position={[0, -1, -0.04]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={insideBotTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
                <mesh position={[0, -1, -0.041]} rotation={[0, Math.PI, 0]}>
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
          <mesh position={[0, 0, -0.001]} rotation={[0, Math.PI, 0]}>
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
};

interface InteractiveLetterBoxProps {
  className?: string;
  isOpen: boolean;
  onCameraControl?: (action: 'top' | 'middle' | 'bottom') => void;
  onLoadComplete?: () => void;
}

export const InteractiveLetterBox = ({ className, isOpen, onCameraControl, onLoadComplete }: InteractiveLetterBoxProps) => {
  // isOpen is now controlled from parent component
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [cardPosition, setCardPosition] = useState([0, 0, 0]);
  
  // Detect mobile for enhanced lighting
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Camera control function
  React.useEffect(() => {
    const handleCameraControl = (scrollValue: number) => {
      // Move the card instead of camera (back to original logic)
      const normalizedValue = scrollValue / 100; // 0 to 1
      const yPosition = (normalizedValue - 0.5) * -5; // -2.5 to +2.5, inverted
      setCardPosition([0, yPosition, 0]);
    };
    
    // Expose function to parent
    (window as any).handleCameraControl = handleCameraControl;
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} ref={cameraRef} />
        
        {/* Enhanced lighting setup for reading - mobile optimized */}
        <ambientLight intensity={isMobile ? 1.0 : 0.8} />
        
        {/* Main reading light - PC position but shifted left and higher for mobile */}
        <directionalLight 
          position={isMobile ? [-2, 1, 8] : [0, 0, 8]} 
          intensity={isMobile ? 0.9 : 0.9} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Back lighting for when rotated - bright for other angles */}
        <directionalLight 
          position={[0, 0, -8]} 
          intensity={isMobile ? 1.2 : 0.7} 
        />
        
        {/* Angled side lights - bright for rotated views */}
        <pointLight position={[8, 5, 5]} intensity={isMobile ? 1.0 : 0.5} />
        <pointLight position={[-8, 5, 5]} intensity={isMobile ? 0.4 : 0.5} />
        <pointLight position={[8, -5, 5]} intensity={isMobile ? 1.0 : 0.5} />
        <pointLight position={[-8, -5, 5]} intensity={isMobile ? 0.4 : 0.5} />
        
        {/* Soft fill lights */}
        <pointLight position={[0, 8, 3]} intensity={isMobile ? 0.5 : 0.4} />
        <pointLight position={[0, -8, 3]} intensity={isMobile ? 0.5 : 0.4} />
        
        {/* Additional angled lights for mobile - bright when rotated */}
        {isMobile && (
          <>
            <pointLight position={[10, 0, 2]} intensity={0.9} />
            <pointLight position={[5, 8, 3]} intensity={0.6} />
            <pointLight position={[0, -10, 2]} intensity={0.7} />
          </>
        )}

        <LetterBox isOpen={isOpen} cardPosition={cardPosition as [number, number, number]} onLoadComplete={onLoadComplete} />
        
        <OrbitControls 
          ref={controlsRef}
          enablePan={isOpen}
          enableZoom={true}
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableDamping
          dampingFactor={0.05}
          maxAzimuthAngle={Infinity}
          minAzimuthAngle={-Infinity}
        />
      </Canvas>
    </div>
  );
};