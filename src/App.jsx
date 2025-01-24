'use client';
import { Canvas } from '@react-three/fiber';
import Text from './TextModels/Text1';
import Text2 from './TextModels/Text2';
import { useState, useEffect, Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';

import Text3 from './TextModels/Text3';
import Text4 from './TextModels/Text4';
import TerminalContact from './components/HeroTerminal';
import Banner from './TextModels/Logo';
import PopUpAbout from './components/buttons/About';

const App = () => {
  const [positions, setPositions] = useState({
    text1: [-0.75, 0.6, 3.7],
    text2: [0.75, 0.6, 3.7],
    text3: [-0.9, -0.6, 3.7],
    text4: [0.9, -0.6, 3.7],
  });

  const updatePositions = () => {
    const width = window.innerWidth;

    if (width <= 768) {
      // Adjust positions for mobile screens
      setPositions({
        text1: [0, 1, 3],
        text2: [0, 0.3, 3],
        text3: [0, -0.4, 3],
        text4: [0, -1, 3],
      });
    } else {
      // Adjust positions for larger screens
      setPositions({
        text1: [-0.75, 0.6, 3.7],
        text2: [0.75, 0.6, 3.7],
        text3: [-0.9, -0.6, 3.7],
        text4: [0.9, -0.6, 3.7],
      });
    }
  };

  useEffect(() => {
    // Set initial positions based on screen size
    updatePositions();

    // Add event listener for resizing
    window.addEventListener('resize', updatePositions);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  return (
    <>
      <div className="canvas-wrapper">
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'black',
                color: 'white',
                fontSize: '3rem',
                fontFamily: '"Minecraft", sans-serif',
                textAlign: 'center',
              }}>
              Bring is loading
            </div>
          }>
          <Canvas gl={{ alpha: true }} style={{ background: 'black' }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <Text position={positions.text1} />
            <Text2 position={positions.text2} />
            <Text3 position={positions.text3} />
            <Text4 position={positions.text4} />
            {/* <Banner /> */}
            <OrbitControls />
          </Canvas>
        </Suspense>
      </div>
      <div className="button-wrapper">
        <PopUpAbout />
      </div>
      <div className="terminal-wrapper">
        <TerminalContact />
      </div>
    </>
  );
};

export default App;
