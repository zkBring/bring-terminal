import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Text from './TextModels/Text1';
import Text2 from './TextModels/Text2';
import Text3 from './TextModels/Text3';
import Text4 from './TextModels/Text4';
import TerminalContact from './components/HeroTerminal';
import PopUpAboutBtn from './components/buttons/About';
import PopUpModal from './components/PopUpModal';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [positions, setPositions] = useState({
    text1: [-0.75, 0.6, 3.7],
    text2: [0.75, 0.6, 3.7],
    text3: [-0.9, -0.6, 3.7],
    text4: [0.9, -0.6, 3.7],
  });

  const updatePositions = () => {
    const width = window.innerWidth;

    if (width <= 768) {
      setPositions({
        text1: [0, 1, 3],
        text2: [0, 0.3, 3],
        text3: [0, -0.4, 3],
        text4: [0, -1, 3],
      });
    } else {
      setPositions({
        text1: [-0.75, 0.6, 3.7],
        text2: [0.75, 0.6, 3.7],
        text3: [-0.9, -0.6, 3.7],
        text4: [0.9, -0.6, 3.7],
      });
    }
  };

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
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
            <OrbitControls />
          </Canvas>
        </Suspense>
      </div>

      {/* Pass the click handler to PopUpAbout */}
      <div className="button-wrapper">
        <PopUpAboutBtn name="About" onClick={() => setIsModalOpen(true)} />
      </div>

      {/* Render modal or terminal based on state */}
      {isModalOpen ? (
        <PopUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      ) : (
        <div className="terminal-wrapper">
          <TerminalContact />
        </div>
      )}
    </>
  );
};

export default App;
