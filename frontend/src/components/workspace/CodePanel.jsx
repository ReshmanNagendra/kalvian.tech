import { useState, useMemo, useCallback, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const languageExtensions = {
  javascript: () => javascript({ jsx: true }),
  python: () => python(),
  java: () => java(),
  cpp: () => cpp(),
}

const fileExtensions = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
}

export default function CodePanel({ value, onChange, language }) {
  const [copied, setCopied] = useState(false)
  const [terminalState, setTerminalState] = useState('idle') // idle | awaiting_input | executing
  const [terminalHistory, setTerminalHistory] = useState([])
  const [collectedInputs, setCollectedInputs] = useState([])
  const [pendingInput, setPendingInput] = useState('')
  const [consoleHeight, setConsoleHeight] = useState(200)
  
  // Theme sync
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('kalvian_theme') || 'dark')
  
  useEffect(() => {
    const handleThemeChange = () => setAppTheme(localStorage.getItem('kalvian_theme') || 'dark')
    window.addEventListener('themechange', handleThemeChange)
    return () => window.removeEventListener('themechange', handleThemeChange)
  }, [])

  const extensions = useMemo(() => {
    const langFn = languageExtensions[language] || languageExtensions.javascript
    return [langFn()]
  }, [language])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  const handleDownload = useCallback(() => {
    const ext = fileExtensions[language] || 'txt'
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [value, language])

  const requiresInput = (code, lang) => {
    const patterns = {
      python: /input\s*\(/,
      javascript: /prompt\s*\(|readline/,
      cpp: /cin\s*>>/,
      java: /Scanner|BufferedReader/
    };
    return patterns[lang] ? patterns[lang].test(code) : false;
  };

  const executeCode = async (stdinValue) => {
    setTerminalState('executing');
    setTerminalHistory(prev => [...prev, { type: 'system', content: 'Compiling & Executing...' }]);
    
    try {
      const response = await fetch('https://emkc.org/api/v1/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language,
          source: value,
          stdin: stdinValue
        })
      });
      const data = await response.json();
      
      setTerminalHistory(prev => prev.filter(item => item.content !== 'Compiling & Executing...'));
      
      if (data.output) {
        setTerminalHistory(prev => [...prev, { type: 'output', content: data.output }]);
      } else if (data.message) {
        setTerminalHistory(prev => [...prev, { type: 'error', content: `Error: ${data.message}` }]);
      } else {
        setTerminalHistory(prev => [...prev, { type: 'system', content: 'Execution completed with no output.' }]);
      }
    } catch (error) {
      setTerminalHistory(prev => prev.filter(item => item.content !== 'Compiling & Executing...'));
      setTerminalHistory(prev => [...prev, { type: 'error', content: `Execution failed: ${error.message}` }]);
    } finally {
      setTerminalState('idle');
    }
  };

  const handleRunCode = () => {
    if (!value.trim()) return;
    setTerminalHistory([]); // Clear previous
    setCollectedInputs([]);
    if (requiresInput(value, language)) {
      setTerminalState('awaiting_input');
      setTerminalHistory([{ type: 'system', content: 'Program requires input. Type each input and press Enter. Click "Execute" in the terminal when ready.' }]);
    } else {
      executeCode(''); // Pass empty stdin
    }
  };

  const handleExecuteCollected = () => {
    if (terminalState !== 'awaiting_input') return;
    // We add pendingInput just in case they typed something but didn't hit Enter
    let finalInputs = [...collectedInputs];
    if (pendingInput.trim() !== '') {
      finalInputs.push(pendingInput);
      setTerminalHistory(prev => [...prev, { type: 'input', content: pendingInput }]);
      setPendingInput('');
    }
    const finalStdin = finalInputs.join('\n');
    executeCode(finalStdin);
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && terminalState === 'awaiting_input') {
      const inputVal = pendingInput;
      setPendingInput('');
      setTerminalHistory(prev => [...prev, { type: 'input', content: inputVal }]);
      setCollectedInputs(prev => [...prev, inputVal]);
    }
  };

  const startResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;
    
    const handleMouseMove = (moveEvent) => {
      // If moving up (decreasing clientY), height increases
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeight + deltaY));
      setConsoleHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
  };

  const lineCount = value ? value.split('\n').length : 0

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-card/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-brand-500">
            <path d="M5 12L1 8l4-4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium text-text-secondary">
            Code
            <span className="text-text-muted ml-1.5">·</span>
            <span className="text-text-muted ml-1.5">{lineCount} lines</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Run button */}
          <button
            onClick={handleRunCode}
            disabled={!value || terminalState === 'executing'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              terminalState === 'executing'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20'
            }`}
            title="Run Code"
            id="run-code"
          >
            {terminalState === 'executing' ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.5 3.5v9l7-4.5-7-4.5z" />
                </svg>
                Run
              </>
            )}
          </button>
          
          <div className="w-px h-4 bg-surface-border mx-1" /> {/* Divider */}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!value}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              copied
                ? 'text-brand-400 bg-brand-500/10'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
            title="Copy code"
            id="copy-code"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,8 6,11 13,4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="5" width="9" height="9" rx="1.5" />
                  <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={!value}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            title="Download as file"
            id="download-code"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v9M4 8l4 4 4-4M2 14h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Editor & Output Split */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={extensions}
            theme={appTheme === 'dark' ? oneDark : 'light'}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
              bracketMatching: true,
              closeBrackets: true,
              indentOnInput: true,
              tabSize: 2,
            }}
            className="h-full text-sm"
            id="code-editor"
          />
        </div>
        
        {/* Resizer Handle */}
        <div 
          className="h-1.5 bg-surface-border hover:bg-brand-500/50 active:bg-brand-500 cursor-row-resize flex-shrink-0 transition-colors"
          onMouseDown={startResize}
          title="Drag to resize console"
        />

        {/* Unified Terminal Panel */}
        <div 
          className="min-h-[100px] border-t border-surface-border bg-[#0d1117] flex flex-col flex-shrink-0"
          style={{ height: `${consoleHeight}px` }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border/50 bg-surface-card/30">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-text-secondary">
                <path d="M4 12h8M4 4h8M4 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Terminal Console</span>
            </div>
            <div className="flex items-center gap-2">
              {terminalState === 'awaiting_input' && (
                <button 
                  onClick={handleExecuteCollected}
                  className="flex items-center gap-1.5 px-2 py-1 bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white rounded text-xs font-medium transition-colors"
                  title="Execute code with provided inputs"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.5 3.5v9l7-4.5-7-4.5z" />
                  </svg>
                  Execute
                </button>
              )}
              <button 
                onClick={() => { setTerminalHistory([]); setTerminalState('idle'); setCollectedInputs([]); }}
                className="text-xs font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                title="Clear output"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap flex flex-col gap-1.5">
            {terminalHistory.length === 0 && terminalState === 'idle' && (
              <span className="text-text-muted italic flex items-center justify-center h-full">
                Click "Run" to execute your code.
              </span>
            )}
            
            {terminalHistory.map((item, idx) => {
              let colorClass = 'text-gray-300';
              if (item.type === 'error') colorClass = 'text-red-400';
              if (item.type === 'system') colorClass = 'text-brand-400 italic';
              if (item.type === 'input') colorClass = 'text-green-400';
              
              return (
                <div key={idx} className={colorClass}>
                  {item.type === 'input' && <span className="mr-2 text-text-muted select-none">&gt;</span>}
                  {item.content}
                </div>
              );
            })}

            {terminalState === 'awaiting_input' && (
              <div className="flex items-center text-green-400 mt-1">
                <span className="mr-2 text-brand-400 font-bold select-none">&gt;</span>
                <input
                  autoFocus
                  type="text"
                  value={pendingInput}
                  onChange={(e) => setPendingInput(e.target.value)}
                  onKeyDown={handleInputSubmit}
                  className="flex-1 bg-transparent outline-none border-none text-green-400 font-mono text-[13px] placeholder:text-green-900/50"
                  placeholder="Type your input and press Enter..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
