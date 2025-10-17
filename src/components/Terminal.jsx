import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import ACTIONS from '../Actions';

const Terminal = ({ socketRef, roomId, username, currentCode, language = 'javascript' }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // Update language when prop changes
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      // Create terminal instance
      xtermRef.current = new XTerm({
        theme: {
          background: '#0d1117',
          foreground: '#f0f6fc',
          cursor: '#58a6ff',
          selection: '#264f78',
          black: '#484f58',
          red: '#f85149',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ff7b72',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc'
        },
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        fontWeight: '400',
        fontWeightBold: '600'
      });

      // Add addons
      fitAddonRef.current = new FitAddon();
      xtermRef.current.loadAddon(fitAddonRef.current);
      xtermRef.current.loadAddon(new WebLinksAddon());

      // Open terminal
      xtermRef.current.open(terminalRef.current);
      fitAddonRef.current.fit();

      // Show initial prompt with colors
      xtermRef.current.write(`\x1b[1;36mWelcome to Critic's Terminal! 🚀\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;32mUser:\x1b[0m \x1b[1;33m${username}\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;32mRoom:\x1b[0m \x1b[1;33m${roomId}\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;37mType commands or use the Run Code button to execute your code.\x1b[0m\n\n`);
      xtermRef.current.write(`\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);

      // Handle terminal input
      xtermRef.current.onData((data) => {
        if (socketRef.current) {
          // Show the input with a different color
          if (data === '\r') { // Enter key
            xtermRef.current.write(`\n`);
          } else if (data === '\u007f') { // Backspace
            xtermRef.current.write(`\b \b`);
          } else {
            xtermRef.current.write(`\x1b[1;37m${data}\x1b[0m`);
          }
          
          socketRef.current.emit(ACTIONS.TERMINAL_INPUT, {
            roomId,
            input: data,
            username
          });
        }
      });

      // Handle resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      console.log('Setting up terminal event listeners');
      
      const handleTerminalOutput = ({ output: newOutput, type, username: outputUsername }) => {
        console.log('Terminal output received:', { output: newOutput, type, outputUsername });
        if (xtermRef.current) {
          // Color code the output based on type
          if (type === 'input') {
            xtermRef.current.write(`\x1b[1;37m${newOutput}\x1b[0m`);
          } else if (type === 'system') {
            xtermRef.current.write(`\x1b[1;33m${newOutput}\x1b[0m`);
          } else {
            xtermRef.current.write(`\x1b[1;36m${newOutput}\x1b[0m`);
          }
        }
        setOutput(prev => prev + newOutput);
      };

      const handleCodeExecutionResult = ({ success, output: resultOutput, error, language, username: execUsername }) => {
        console.log('Code execution result received:', { success, resultOutput, error, language, execUsername });
        
        if (xtermRef.current) {
          if (success) {
            xtermRef.current.write(`\n\x1b[1;32m✅ ${language.toUpperCase()} execution completed successfully!\x1b[0m\n`);
            xtermRef.current.write(`\x1b[1;36m📤 Output:\x1b[0m\n`);
            xtermRef.current.write(`\x1b[1;37m${resultOutput || 'No output'}\x1b[0m\n`);
            xtermRef.current.write(`\n\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);
          } else {
            xtermRef.current.write(`\n\x1b[1;31m❌ ${language.toUpperCase()} execution failed!\x1b[0m\n`);
            xtermRef.current.write(`\x1b[1;31m🚨 Error:\x1b[0m\n`);
            xtermRef.current.write(`\x1b[1;31m${error || 'Unknown error'}\x1b[0m\n`);
            xtermRef.current.write(`\n\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);
          }
        }
        setIsRunning(false); // Stop running state after execution
      };

      socketRef.current.on(ACTIONS.TERMINAL_OUTPUT, handleTerminalOutput);
      socketRef.current.on(ACTIONS.CODE_EXECUTION_RESULT, handleCodeExecutionResult);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.TERMINAL_OUTPUT, handleTerminalOutput);
          socketRef.current.off(ACTIONS.CODE_EXECUTION_RESULT, handleCodeExecutionResult);
        }
      };
    }
  }, [socketRef.current]);

  const runCode = (lang = currentLanguage) => {
    console.log('runCode called with:', { lang, currentCode, socketRef: !!socketRef.current, username });
    
    if (socketRef.current && currentCode && currentCode.trim()) {
      setIsRunning(true);
      setCurrentLanguage(lang);
      
      if (xtermRef.current) {
        xtermRef.current.write(`\n\x1b[1;33m🚀 Running ${lang.toUpperCase()} code...\x1b[0m\n`);
        xtermRef.current.write(`\x1b[1;36m📝 Code:\x1b[0m\n\x1b[1;37m${currentCode}\x1b[0m\n\n`);
        xtermRef.current.write(`\x1b[1;33m📤 Executing...\x1b[0m\n`);
        xtermRef.current.write(`\x1b[1;33m⏳ Please wait...\x1b[0m\n`);
      }
      
      console.log('Sending code to server:', { roomId, language: lang, code: currentCode, username });
      
      socketRef.current.emit(ACTIONS.RUN_CODE, {
        roomId,
        language: lang,
        code: currentCode,
        username
      });
    } else if (!currentCode || !currentCode.trim()) {
      console.log('No code to execute');
      if (xtermRef.current) {
        xtermRef.current.write(`\n\x1b[1;31m❌ No code to execute! Please write some code in the editor first.\x1b[0m\n`);
        xtermRef.current.write(`\n\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);
      }
    } else {
      console.log('Cannot run code:', { socketRef: !!socketRef.current, currentCode, username });
    }
  };

  const stopExecution = () => {
    if (socketRef.current) {
      socketRef.current.emit('STOP_EXECUTION', { roomId, username });
      setIsRunning(false);
      if (xtermRef.current) {
        xtermRef.current.write(`\n\x1b[1;33m⏹️ Execution stopped by ${username}\x1b[0m\n`);
        xtermRef.current.write(`\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);
      }
    }
  };

  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      setOutput('');
      // Show welcome message again after clear
      xtermRef.current.write(`\x1b[1;36mWelcome to Critic's Terminal! 🚀\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;32mUser:\x1b[0m \x1b[1;33m${username}\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;32mRoom:\x1b[0m \x1b[1;33m${roomId}\x1b[0m\n`);
      xtermRef.current.write(`\x1b[1;37mType commands or use the Run Code button to execute your code.\x1b[0m\n\n`);
      xtermRef.current.write(`\x1b[1;32m${username}@terminal:\x1b[1;34m~$\x1b[0m `);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">💻</span>
          <span className="terminal-text">Terminal</span>
          <div className="terminal-dots">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
          </div>
        </div>
        <div className="terminal-controls">
          <div className="language-selector">
            <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="lang-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="shell">Shell</option>
            </select>
          </div>
          <button
            onClick={() => runCode()}
            disabled={isRunning || !currentCode}
            className="run-btn"
          >
            <span className="run-icon">▶️</span>
            <span>Run Code</span>
          </button>
          {isRunning && (
            <button
              onClick={stopExecution}
              className="stop-btn"
            >
              <span className="stop-icon">⏹️</span>
              <span>Stop</span>
            </button>
          )}
          <button
            onClick={clearTerminal}
            className="clear-btn"
          >
            <span className="clear-icon">🗑️</span>
            <span>Clear</span>
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="terminal-content"
      />
    </div>
  );
};

export default Terminal;
