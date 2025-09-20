import { useRef, useState, useMemo } from "react";
import * as React from "react";
import { Canvas, useFrame, ThreeEvent, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface LetterBoxProps {
  isOpen: boolean;
}

const LetterBox = ({ isOpen, cardPosition }: { isOpen: boolean; cardPosition: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: closed, 1: top opening, 2: bottom opening
  
  
  // Load textures
  const frontTexture = useLoader(THREE.TextureLoader, '/front.png');
  const backTexture = useLoader(THREE.TextureLoader, '/back.png');
  const frontAfterTexture = useLoader(THREE.TextureLoader, '/front-after.png');
  const insideTopTexture = useLoader(THREE.TextureLoader, '/inside-top.png');
  const insideMidTexture = useLoader(THREE.TextureLoader, '/inside-mid.png');
  const insideBotTexture = useLoader(THREE.TextureLoader, '/inside-bot.png');
  
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
            <mesh position={[0, 0, 0.05]} rotation={[0, 0, 0]}>
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

            {/* Bottom section - inside-bot front, white back */}
            <group position={[0, -1, 0]}>
              <group rotation={[bottomRotation, 0, 0]}>
                <mesh position={[0, -1, 0.04]}>
                  <planeGeometry args={[4, 2]} />
                  <meshStandardMaterial 
                    map={insideBotTexture}
                    metalness={0.1} 
                    roughness={0.3}
                    transparent={true}
                  />
                </mesh>
                <mesh position={[0, -1, 0.039]} rotation={[0, Math.PI, 0]}>
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
          <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[4, 2]} />
            <meshStandardMaterial 
              map={backTexture}
              metalness={0.1} 
              roughness={0.3}
              transparent={true}
            />
          </mesh>
        )}


        {/* Edges - only when closed */}
        {!isOpen && (
          <>
            {/* Top edge */}
            <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.1]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>

            {/* Bottom edge */}
            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.1]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>

            {/* Left edge */}
            <mesh position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.1, 2]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>

            {/* Right edge */}
            <mesh position={[2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.1, 2]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>
          </>
        )}

      </group>

    </group>
  );
};

interface InteractiveLetterBoxProps {
  className?: string;
  isOpen: boolean;
  onCameraControl?: (action: 'top' | 'middle' | 'bottom') => void;
}

export const InteractiveLetterBox = ({ className, isOpen, onCameraControl }: InteractiveLetterBoxProps) => {
  // isOpen is now controlled from parent component
  const controlsRef = useRef<any>(null);
  const [cardPosition, setCardPosition] = useState([0, 0, 0]);

  // Camera control function
  React.useEffect(() => {
    const handleCameraControl = (scrollValue: number) => {
      // Smooth interpolation: 0-100 scroll maps to card position
      // 0 = bottom (card up), 50 = middle, 100 = top (card down)
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
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.6} />
        
        {/* Main directional light from front */}
        <directionalLight 
          position={[0, 0, 10]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Back lighting for when rotated */}
        <directionalLight 
          position={[0, 0, -10]} 
          intensity={0.8} 
        />
        
        {/* Side fill lights */}
        <pointLight position={[10, 0, 0]} intensity={0.4} />
        <pointLight position={[-10, 0, 0]} intensity={0.4} />
        
        {/* Top and bottom lights for even coverage */}
        <pointLight position={[0, 10, 0]} intensity={0.3} />
        <pointLight position={[0, -10, 0]} intensity={0.3} />

        <LetterBox isOpen={isOpen} cardPosition={cardPosition as [number, number, number]} />
        
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