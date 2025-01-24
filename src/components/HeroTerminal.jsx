'use client';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { useRef, useState, useEffect } from 'react';

const TerminalContact = () => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Automatically focus on the input field when the component mounts
    inputRef.current?.focus();
  }, []);

  return (
    <section className="flex items-center justify-center min-h-screen bg-transparent px-4 py-12">
      <div
        ref={containerRef}
        onClick={() => {
          inputRef.current?.focus();
        }}
        className="h-120 md:h-96 bg-slate-950/60 rounded-lg w-full md:max-w-2xl mx-auto overflow-y-scroll shadow-xl cursor-text font-fc ">
        <TerminalHeader />
        <TerminalBody inputRef={inputRef} containerRef={containerRef} />
      </div>
    </section>
  );
};

const TerminalHeader = () => {
  return (
    <div className="w-full p-3 bg-slate-900 flex items-center gap-1 sticky top-0">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
      <span className="text-xs md:text-md text-slate-200 font-semibold absolute left-[50%] -translate-x-[50%]">
        Bring, powered by zkTLS.
      </span>
    </div>
  );
};

const TerminalBody = ({ containerRef, inputRef }) => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState(null); // State for dynamic response

  const handleSubmit = () => {
    const trimmedText = text.trim().toLowerCase();

    switch (trimmedText) {
      case 'ca':
        navigator.clipboard.writeText('0x02E739740B007bd5E4600b9736A143b6E794D223');
        setResponse('CA copied to clipboard!');
        alert('CA copied to clipboard!');
        break;

      case 'bring bring':
        setResponse("Gotcha, here's your link, get some bring and bring your friend: LINK");
        break;

      case 'list':
        setResponse(
          `Available commands:\n` +
            `1. subscribe <email>\n` +
            `2. claim $bring100x - claim your $bring\n` +
            `3. claim $toshi25gh - claim your $toshi\n` +
            `4. create bring - create drop`,
        );
        break;

      case 'claim $bring100x':
        setResponse("Gotcha, here's your link for collecting $bring100x: LINK");
        break;

      case 'claim $toshi25gh':
        setResponse("Gotcha, here's your link for collecting $toshi25gh: LINK");
        break;

      case 'create bring':
        setResponse("Here's your link for creating a drop: LINK");
        break;

      default:
        setResponse('Invalid input. Type list to see all commands!');
        break;
    }

    setText('');
  };

  const onCopyCA = () => {
    navigator.clipboard.writeText('0x02E739740B007bd5E4600b9736A143b6E794D223');
    alert('CA copied to clipboard!');
  };

  return (
    <div className="p-2 text-slate-100 text-lg">
      <p>
        <span className="text-green-500">Mission:</span> bring billions onchain.
      </p>
      <p>
        <span className="text-yellow-500">Approach:</span> bring team developing a tool to airdrop
        tokens for web-2 users based on their internet activity.
      </p>
      <p className="text-sm md:text-lg pt-6">
        <span onClick={onCopyCA} className="text-red-500 text-lg hover:cursor-pointer">
          CA:
        </span>{' '}
        0x02E739740B007bd5E4600b9736A143b6E794D223
      </p>

      <p className="whitespace-nowrap overflow-hidden font-light">
        ------------------------------------------------------------------------
      </p>

      {!response && (
        <div className="output text-emerald-400">
          <p>
            Type <span className="text-green-200">list</span> to see all commands
          </p>
        </div>
      )}

      <div className="output text-emerald-400">
        {response && response.split('\n').map((line, index) => <p key={index}>{line}</p>)}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="sr-only"
          autoComplete="off"
        />
        <p>
          <span className="text-emerald-400">➜</span> <span className="text-cyan-300">~</span>{' '}
          {text}
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear',
              times: [0, 0.5, 0.5, 1],
            }}
            className="inline-block w-2 h-5 bg-slate-400 translate-y-1 ml-0.5"
          />
        </p>
      </form>

      <div className="md:hidden flex justify-center items-center mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-600">
          Send
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 pt-6 text-sm">
        <a
          href="https://x.com/MikhailDobs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline ">
          X (Twitter)
        </a>
        <a
          href="https://warpcast.com/~/channel/bring"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline">
          Farcaster
        </a>
        <a
          href="https://dexscreener.com/base/0xceb9ce741dc04e87366198c7dc96d76ed74dce6c"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline">
          Dexscreener
        </a>
      </div>
    </div>
  );
};

export default TerminalContact;
