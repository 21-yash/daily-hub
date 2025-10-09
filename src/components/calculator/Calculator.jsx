import React, { useState, useEffect } from 'react';
import { Delete, RotateCcw, History, Sigma } from 'lucide-react';

const Calculator = ({ theme }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);

  // --- UI Style Calculation ---
  const cardBg = theme === 'dark' ? 'bg-gray-900/50 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm';
  const displayBg = theme === 'dark' ? 'bg-black/30' : 'bg-gray-100/80';
  const borderColor = theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/80';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  // --- Existing Logic (unchanged) ---
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };
  
  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);
    let newHistoryEntry = '';

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      if (operation !== '=') {
          newHistoryEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
          setHistory([newHistoryEntry, ...history.slice(0, 9)]);
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }
    
    setWaitingForOperand(true);
    setOperation(nextOperation);
    if(nextOperation === '=') {
        setPreviousValue(null);
    }
  };

  const calculate = (firstValue, secondValue, op) => {
    switch (op) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return firstValue / secondValue;
      case '%': return firstValue % secondValue;
      default: return secondValue;
    }
  };
  
   const calculateScientific = (func) => {
    const value = parseFloat(display);
    let result;
    let expression = '';

    switch (func) {
      case 'sin': result = Math.sin(value * Math.PI / 180); expression = `sin(${value})`; break;
      case 'cos': result = Math.cos(value * Math.PI / 180); expression = `cos(${value})`; break;
      case 'tan': result = Math.tan(value * Math.PI / 180); expression = `tan(${value})`; break;
      case 'log': result = Math.log10(value); expression = `log(${value})`; break;
      case 'ln': result = Math.log(value); expression = `ln(${value})`; break;
      case 'sqrt': result = Math.sqrt(value); expression = `√(${value})`; break;
      case 'square': result = value * value; expression = `${value}²`; break;
      case 'cube': result = value * value * value; expression = `${value}³`; break;
      case 'factorial': result = factorial(value); expression = `${value}!`; break;
      case 'inverse': result = 1 / value; expression = `1/${value}`; break;
      case 'exp': result = Math.exp(value); expression = `exp(${value})`; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: result = value;
    }
    
    if (expression) {
        setHistory([`${expression} = ${result}`, ...history.slice(0, 9)]);
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };
  
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));
  const memoryRecall = () => { setDisplay(String(memory)); setWaitingForOperand(true); };
  const memoryClear = () => setMemory(0);

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // --- Improved Button Component ---
  const Button = ({ children, onClick, className = '', span = 1 }) => (
    <button
      onClick={onClick}
      className={`rounded-xl h-16 text-xl font-medium transition-all duration-150 shadow-md border 
                 hover:brightness-110 active:scale-95 active:shadow-inner
                 ${className} ${span === 2 ? 'col-span-2' : ''}`}
    >
      {children}
    </button>
  );

  const numBtnStyle = theme === 'dark' ? 'bg-gray-700/50 border-gray-600/50 text-white' : 'bg-white/80 border-gray-300/80 text-gray-800';
  const opBtnStyle = theme === 'dark' ? 'bg-blue-600/80 border-blue-500/50 text-white' : 'bg-blue-500 border-blue-400 text-white';
  const funcBtnStyle = theme === 'dark' ? 'bg-gray-500/50 border-gray-400/50 text-white' : 'bg-gray-300 border-gray-400 text-gray-800';
  const eqBtnStyle = theme === 'dark' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-blue-600 border-blue-500 text-white';

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
       <h2 className="text-3xl font-bold flex items-center gap-2"> Calculator</h2>
      <div className={`p-6 rounded-2xl border ${cardBg} ${borderColor} shadow-2xl w-full max-w-sm`}>
        {/* Display */}
        <div className={`mb-4 p-4 rounded-lg text-right overflow-hidden ${displayBg}`}>
          <div className={`h-8 text-lg ${secondaryTextColor} break-all opacity-80`}>
            {operation && previousValue !== null && operation !== '=' ? `${previousValue} ${operation}` : ' '}
          </div>
          <div className={`text-5xl font-bold break-all ${textColor}`}>{display}</div>
          {memory !== 0 && (
            <div className="text-xs text-blue-400 mt-1 font-mono">M: {memory}</div>
          )}
        </div>

        {/* Buttons */}
        {isScientific ? (
            <div className="grid grid-cols-5 gap-2.5">
                <Button onClick={() => calculateScientific('sin')} className={funcBtnStyle}>sin</Button>
                <Button onClick={() => calculateScientific('cos')} className={funcBtnStyle}>cos</Button>
                <Button onClick={() => calculateScientific('tan')} className={funcBtnStyle}>tan</Button>
                <Button onClick={() => calculateScientific('log')} className={funcBtnStyle}>log</Button>
                <Button onClick={() => calculateScientific('ln')} className={funcBtnStyle}>ln</Button>
                
                <Button onClick={() => calculateScientific('pi')} className={funcBtnStyle}>π</Button>
                <Button onClick={() => calculateScientific('e')} className={funcBtnStyle}>e</Button>
                <Button onClick={() => calculateScientific('square')} className={funcBtnStyle}>x²</Button>
                <Button onClick={() => calculateScientific('cube')} className={funcBtnStyle}>x³</Button>
                <Button onClick={() => calculateScientific('sqrt')} className={funcBtnStyle}>√</Button>

                <Button onClick={() => inputDigit(7)} className={numBtnStyle}>7</Button>
                <Button onClick={() => inputDigit(8)} className={numBtnStyle}>8</Button>
                <Button onClick={() => inputDigit(9)} className={numBtnStyle}>9</Button>
                <Button onClick={clear} className={funcBtnStyle}>C</Button>
                <Button onClick={backspace} className={funcBtnStyle}><Delete size={20} className="mx-auto" /></Button>

                <Button onClick={() => inputDigit(4)} className={numBtnStyle}>4</Button>
                <Button onClick={() => inputDigit(5)} className={numBtnStyle}>5</Button>
                <Button onClick={() => inputDigit(6)} className={numBtnStyle}>6</Button>
                <Button onClick={() => performOperation('*')} className={opBtnStyle}>×</Button>
                <Button onClick={() => performOperation('/')} className={opBtnStyle}>÷</Button>
                
                <Button onClick={() => inputDigit(1)} className={numBtnStyle}>1</Button>
                <Button onClick={() => inputDigit(2)} className={numBtnStyle}>2</Button>
                <Button onClick={() => inputDigit(3)} className={numBtnStyle}>3</Button>
                <Button onClick={() => performOperation('+')} className={opBtnStyle}>+</Button>
                <Button onClick={() => performOperation('-')} className={opBtnStyle}>-</Button>
                
                <Button onClick={() => inputDigit(0)} className={numBtnStyle} span={2}>0</Button>
                <Button onClick={inputDecimal} className={numBtnStyle}>.</Button>
                <Button onClick={() => performOperation('=')} className={eqBtnStyle} span={2}>=</Button>
            </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5">
            <Button onClick={clear} className={funcBtnStyle}>C</Button>
            <Button onClick={() => setDisplay(String(-parseFloat(display)))} className={funcBtnStyle}>±</Button>
            <Button onClick={() => performOperation('%')} className={funcBtnStyle}>%</Button>
            <Button onClick={() => performOperation('/')} className={opBtnStyle}>÷</Button>

            <Button onClick={() => inputDigit(7)} className={numBtnStyle}>7</Button>
            <Button onClick={() => inputDigit(8)} className={numBtnStyle}>8</Button>
            <Button onClick={() => inputDigit(9)} className={numBtnStyle}>9</Button>
            <Button onClick={() => performOperation('*')} className={opBtnStyle}>×</Button>

            <Button onClick={() => inputDigit(4)} className={numBtnStyle}>4</Button>
            <Button onClick={() => inputDigit(5)} className={numBtnStyle}>5</Button>
            <Button onClick={() => inputDigit(6)} className={numBtnStyle}>6</Button>
            <Button onClick={() => performOperation('-')} className={opBtnStyle}>-</Button>

            <Button onClick={() => inputDigit(1)} className={numBtnStyle}>1</Button>
            <Button onClick={() => inputDigit(2)} className={numBtnStyle}>2</Button>
            <Button onClick={() => inputDigit(3)} className={numBtnStyle}>3</Button>
            <Button onClick={() => performOperation('+')} className={opBtnStyle}>+</Button>
            
            <Button onClick={() => inputDigit(0)} className={numBtnStyle} span={2}>0</Button>
            <Button onClick={inputDecimal} className={numBtnStyle}>.</Button>
            <Button onClick={() => performOperation('=')} className={eqBtnStyle}>=</Button>
          </div>
        )}
      </div>

       {/* --- NEW: History Panel & Controls --- */}
      <div className="w-full md:w-64">
         <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <History size={20} /> History
            </h3>
            <button onClick={() => setIsScientific(!isScientific)} title={isScientific ? 'Switch to Normal' : 'Switch to Scientific'} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <Sigma size={20} />
            </button>
         </div>
         <div className={`p-4 rounded-2xl border ${cardBg} ${borderColor} h-96 overflow-y-auto space-y-2`}>
            {history.length === 0 ? (
                <p className={`text-center ${secondaryTextColor} pt-4`}>No history yet.</p>
            ) : (
                history.map((entry, index) => (
                    <div key={index} className="text-right">
                        <p className={secondaryTextColor}>{entry.split('=')[0]}=</p>
                        <p className={`font-semibold ${textColor}`}>{entry.split('=')[1]}</p>
                    </div>
                ))
            )}
         </div>
         <button onClick={() => setHistory([])} className="w-full mt-2 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            Clear History
         </button>
      </div>
    </div>
  );
};

export default Calculator;