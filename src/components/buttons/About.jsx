import { useRef, useState } from 'react';
import { FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PopUpAbout = () => {
  return (
    <div className="grid min-h-[100px] place-content-center bg-transparent ">
      <EncryptButton />
    </div>
  );
};

const TARGET_TEXT = 'About';
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;

const CHARS = '!@#$%^&*():{};|,.<>/?';

const EncryptButton = () => {
  const intervalRef = useRef(null);

  const [text, setText] = useState(TARGET_TEXT);

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split('')
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join('');

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);

    setText(TARGET_TEXT);
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.025,
      }}
      whileTap={{
        scale: 0.975,
      }}
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
      className="group relative overflow-hidden rounded-lg border-[1px] border-neutral-500 bg-slate-950/60 px-4 py-2 font-fc uppercase text-neutral-300 transition-colors hover:text-green-200">
      <div className="relative z-10 flex items-center gap-2">
        <span>{text}</span>
      </div>
      <motion.span
        initial={{
          y: '100%',
        }}
        animate={{
          y: '-100%',
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'mirror',
          duration: 1,
          ease: 'linear',
        }}
        className="duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-indigo-400/0 from-40% via-indigo-400/100 to-indigo-400/0 to-60% opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.button>
  );
};

export default PopUpAbout;
