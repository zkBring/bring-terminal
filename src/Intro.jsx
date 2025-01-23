import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls, Text3D, useVideoTexture, Grid, Environment } from '@react-three/drei';

import { motion } from 'framer-motion';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';

import { Skull } from './Models/Skull';
import { Dices } from './Models/Dice';
import { ChickenNuggets } from './Models/ChickenNugget';
import { Physics, RigidBody } from '@react-three/rapier';
import RightWall from './Shaders/RightWallShader';
import { Ankle } from './Models/Ankle';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@react-three/drei';

const SpinningText = () => {
  const textRef = useRef();
  const texture = useVideoTexture('/texturelol.mp4');
  const [direction, setDirection] = useState(1);

  // useFrame(() => {
  //   if (textRef.current) {
  //     textRef.current.rotation.x += 0.01 * direction;

  //     if (textRef.current.rotation.x >= degToRad(45)) {
  //       setDirection(-1);
  //     } else if (textRef.current.rotation.x <= degToRad(-45)) {
  //       setDirection(1);
  //     }
  //   }
  // });

  return (
    <Text3D
      ref={textRef}
      castShadow
      position={[-3.5, 0, -1]}
      size={2}
      font="/font/Dezzy.json"
      lineHeight={0.8}
      letterSpacing={0.2}
      bevelEnabled
      bevelThickness={0.006}
      bevelSize={0.1}>
      Filthy {`\n`} Trikks
      <meshBasicMaterial attach="material" map={texture} toneMapped />
    </Text3D>
  );
};

const Intro = () => {
  const [showButton, setShowButton] = useState(false);
  const [nuggets, setNuggets] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const diceRefs = [useRef(), useRef(), useRef()];

  const playSound = () => {
    const audio = new Audio('/song.mp3');
    audio.play();
  };

  useEffect(() => {
    if (!showButton) {
      // Trigger all dice to "jump"
      diceRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.applyImpulse({ x: 0, y: 150, z: 0 }, true);
          const randomSpin = {
            x: Math.random() * 50 - 5,
            y: Math.random() * 90 - 5,
            z: Math.random() * 15 - 5,
          };
          ref.current.applyTorqueImpulse(randomSpin, true);
        }
      });
    }
  }, [showButton]);

  useEffect(() => {
    // Check if the screen width is less than 768px (mobile size)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener to handle window resizing
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'n' || event.key === 'N') {
        spawnNugget();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const spawnNugget = () => {
    setNuggets((prevNuggets) => [
      ...prevNuggets,
      { id: Date.now(), position: [0, 7, 0.5] }, // Set initial position
    ]);
  };

  const spawnNuggets = () => {
    const newNuggets = Array.from({ length: 5 }).map((_, index) => ({
      id: Date.now() + index,
      position: [Math.random() * 2 - 1, 7 + Math.random(), 0.5],
    }));
    setNuggets((prevNuggets) => [...prevNuggets, ...newNuggets]);
  };

  const navigate = useNavigate();

  const handleEnterClick = async () => {
    // Animate button opacity to 0 and remove it
    playSound();
    setShowButton(false);
    spawnNuggets(); // Spawn 5 nuggets
    await new Promise((resolve) => setTimeout(resolve, 3500)); // Wait 4 seconds
    // Redirect to /gallery
    navigate('/gallery');
  };

  return (
    <div className="relative w-full h-screen ">
      {/* Background Video */}

      <Canvas>
        <Physics>
          <OrbitControls />

          <ambientLight intensity={0.5} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <pointLight position={[-10, 10, -5]} intensity={0.6} />
          <directionalLight position={[2, -3, 10]} intensity={1} />
          <Environment preset="sunset" />

          <RightWall />
        </Physics>
      </Canvas>
      {/* Enter Button */}

      <Loader />
    </div>
  );
};

export default Intro;
