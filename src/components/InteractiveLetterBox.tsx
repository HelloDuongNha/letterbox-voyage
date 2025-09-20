import { useRef, useState } from "react";
import * as React from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface LetterBoxProps {
  isOpen: boolean;
  onButtonClick: () => void;
}

const LetterBox = ({ isOpen, onButtonClick }: LetterBoxProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && !isOpen) {
      // Gentle floating animation when closed
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      groupRef.current.rotation.y += 0.002;
    }
  });

  const handleButtonClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onButtonClick();
  };

  // Animation values for envelope-style opening
  const topFlapRotation = isOpen ? -Math.PI * 0.7 : 0;
  const bottomFlapRotation = isOpen ? Math.PI * 0.7 : 0;
  const insideScale = isOpen ? [3, 1, 1] : [1, 1, 1];
  const insideOpacity = isOpen ? 1 : 0;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main box container */}
      <group>
        {/* Front face (red) - Split into top and bottom flaps when opening */}
        {!isOpen ? (
          // Closed state - single red face
          <mesh position={[0, 0, 0.05]} rotation={[0, 0, 0]}>
            <planeGeometry args={[4, 2]} />
            <meshStandardMaterial 
              color="#dc2626" 
              metalness={0.1} 
              roughness={0.3}
            />
          </mesh>
        ) : (
          // Open state - split into top and bottom flaps
          <>
            {/* Top flap - opens upward like envelope */}
            <group position={[0, 0.5, 0]} rotation={[topFlapRotation, 0, 0]}>
              <mesh position={[0, 0.5, 0.05]}>
                <planeGeometry args={[4, 1]} />
                <meshStandardMaterial 
                  color="#dc2626" 
                  metalness={0.1} 
                  roughness={0.3}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </group>

            {/* Bottom flap - opens downward */}
            <group position={[0, -0.5, 0]} rotation={[bottomFlapRotation, 0, 0]}>
              <mesh position={[0, -0.5, 0.05]}>
                <planeGeometry args={[4, 1]} />
                <meshStandardMaterial 
                  color="#dc2626" 
                  metalness={0.1} 
                  roughness={0.3}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </group>
          </>
        )}

        {/* Back face (blue) */}
        <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial 
            color="#2563eb" 
            metalness={0.1} 
            roughness={0.3}
          />
        </mesh>

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

        {/* Black button on front face */}
        {!isOpen && (
          <mesh 
            position={[0, 0, 0.06]} 
            onClick={handleButtonClick}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            scale={hovered ? 1.1 : 1}
          >
            <circleGeometry args={[0.3, 32]} />
            <meshStandardMaterial 
              color="#000000" 
              metalness={0.2} 
              roughness={0.1}
              emissive={hovered ? "#333333" : "#000000"}
              emissiveIntensity={hovered ? 0.1 : 0}
            />
          </mesh>
        )}
      </group>

      {/* Yellow interior - extends to 3x length when fully open */}
      {isOpen && (
        <group scale={insideScale as [number, number, number]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4, 2]} />
            <meshStandardMaterial 
              color="#eab308" 
              metalness={0.2} 
              roughness={0.2}
              transparent
              opacity={insideOpacity}
              emissive="#fbbf24"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

interface InteractiveLetterBoxProps {
  className?: string;
}

export const InteractiveLetterBox = ({ className }: InteractiveLetterBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setLastInteraction(Date.now());
  };

  // Auto-close after 3 seconds of no interaction
  React.useEffect(() => {
    if (!isOpen) return;

    const checkAutoClose = () => {
      if (Date.now() - lastInteraction > 3000) {
        setIsOpen(false);
      }
    };

    const interval = setInterval(checkAutoClose, 500);
    return () => clearInterval(interval);
  }, [isOpen, lastInteraction]);

  // Track user interaction to reset auto-close timer
  const handleInteraction = () => {
    setLastInteraction(Date.now());
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#4338ca" />
        <pointLight position={[5, -5, -5]} intensity={0.2} color="#dc2626" />

        <LetterBox isOpen={isOpen} onButtonClick={handleButtonClick} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
          enableDamping
          dampingFactor={0.05}
          onChange={handleInteraction}
        />
      </Canvas>
    </div>
  );
};