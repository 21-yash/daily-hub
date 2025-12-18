import React, { useState, useEffect } from 'react';

const Chess = ({ theme, cardBg, borderColor, textSecondary, showToast }) => {
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [gameStatus, setGameStatus] = useState('active');
  const [isThinking, setIsThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [kingMoved, setKingMoved] = useState({ white: false, black: false });
  const [rookMoved, setRookMoved] = useState({ 
    whiteKingSide: false, 
    whiteQueenSide: false, 
    blackKingSide: false, 
    blackQueenSide: false 
  });
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  function initializeBoard() {
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
  }

  const getPieceEmoji = (piece) => {
    const pieces = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return pieces[piece] || '';
  };

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();
  const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

  const findKing = (color, boardState = board) => {
    const king = color === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === king) {
          return [row, col];
        }
      }
    }
    return null;
  };

  const isSquareUnderAttack = (row, col, byColor, boardState = board) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && 
            ((byColor === 'white' && isWhitePiece(piece)) || 
             (byColor === 'black' && isBlackPiece(piece)))) {
          if (isValidMoveIgnoringCheck(r, c, row, col, boardState)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isInCheck = (color, boardState = board) => {
    const kingPos = findKing(color, boardState);
    if (!kingPos) return false;
    const [kingRow, kingCol] = kingPos;
    const attackingColor = color === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(kingRow, kingCol, attackingColor, boardState);
  };

  const isPathClear = (fromRow, fromCol, toRow, toCol, boardState = board) => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (boardState[currentRow][currentCol] !== null) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  };

  const isValidMoveIgnoringCheck = (fromRow, fromCol, toRow, toCol, boardState = board) => {
    const piece = boardState[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = boardState[toRow][toCol];
    if (targetPiece &&
      ((isWhitePiece(piece) && isWhitePiece(targetPiece)) ||
        (isBlackPiece(piece) && isBlackPiece(targetPiece)))) {
      return false;
    }

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const pieceLower = piece.toLowerCase();

    switch (pieceLower) {
      case 'p':
        const direction = isWhitePiece(piece) ? -1 : 1;
        const startRow = isWhitePiece(piece) ? 6 : 1;
        
        if (toCol === fromCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && 
              !boardState[fromRow + direction][fromCol]) return true;
        }
        
        if (colDiff === 1 && toRow === fromRow + direction) {
          if (targetPiece) return true;
          if (enPassantTarget && enPassantTarget[0] === toRow && enPassantTarget[1] === toCol) {
            return true;
          }
        }
        return false;

      case 'r':
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardState);
        }
        return false;

      case 'n':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b':
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardState);
        }
        return false;

      case 'q':
        if (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardState);
        }
        return false;

      case 'k':
        if (rowDiff <= 1 && colDiff <= 1) return true;
        
        // Castling
        const color = isWhitePiece(piece) ? 'white' : 'black';
        if (rowDiff === 0 && colDiff === 2 && !kingMoved[color]) {
          const row = color === 'white' ? 7 : 0;
          
          // King-side castling
          if (toCol === 6 && !rookMoved[color + 'KingSide']) {
            if (boardState[row][5] === null && boardState[row][6] === null &&
                !isSquareUnderAttack(row, 4, color === 'white' ? 'black' : 'white', boardState) &&
                !isSquareUnderAttack(row, 5, color === 'white' ? 'black' : 'white', boardState) &&
                !isSquareUnderAttack(row, 6, color === 'white' ? 'black' : 'white', boardState)) {
              return true;
            }
          }
          
          // Queen-side castling
          if (toCol === 2 && !rookMoved[color + 'QueenSide']) {
            if (boardState[row][1] === null && boardState[row][2] === null && boardState[row][3] === null &&
                !isSquareUnderAttack(row, 4, color === 'white' ? 'black' : 'white', boardState) &&
                !isSquareUnderAttack(row, 3, color === 'white' ? 'black' : 'white', boardState) &&
                !isSquareUnderAttack(row, 2, color === 'white' ? 'black' : 'white', boardState)) {
              return true;
            }
          }
        }
        return false;

      default:
        return false;
    }
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    if (currentTurn === 'white' && !isWhitePiece(piece)) return false;
    if (currentTurn === 'black' && !isBlackPiece(piece)) return false;

    if (!isValidMoveIgnoringCheck(fromRow, fromCol, toRow, toCol)) return false;

    // Check if move leaves king in check
    const newBoard = board.map(row => [...row]);
    const capturedPiece = newBoard[toRow][toCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Handle en passant capture
    if (piece.toLowerCase() === 'p' && enPassantTarget && 
        toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const captureRow = isWhitePiece(piece) ? toRow + 1 : toRow - 1;
      newBoard[captureRow][toCol] = null;
    }

    const color = isWhitePiece(piece) ? 'white' : 'black';
    if (isInCheck(color, newBoard)) {
      return false;
    }

    return true;
  };

  const getValidMovesForPiece = (row, col) => {
    const moves = [];
    const piece = board[row][col];
    if (!piece) return moves;
    
    const color = isWhitePiece(piece) ? 'white' : 'black';
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMoveWithBoard(row, col, r, c, color, board)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    const capturedPiece = newBoard[toRow][toCol];
    
    // Handle castling
    if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
      const row = currentTurn === 'white' ? 7 : 0;
      if (toCol === 6) {
        newBoard[row][5] = newBoard[row][7];
        newBoard[row][7] = null;
      } else if (toCol === 2) {
        newBoard[row][3] = newBoard[row][0];
        newBoard[row][0] = null;
      }
    }

    // Handle en passant capture
    let enPassantCapture = null;
    if (piece.toLowerCase() === 'p' && enPassantTarget && 
        toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const captureRow = isWhitePiece(piece) ? toRow + 1 : toRow - 1;
      enPassantCapture = newBoard[captureRow][toCol];
      newBoard[captureRow][toCol] = null;
    }

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Track captured pieces
    const newCaptured = { ...capturedPieces };
    if (capturedPiece) {
      if (isWhitePiece(piece)) {
        newCaptured.black.push(capturedPiece);
      } else {
        newCaptured.white.push(capturedPiece);
      }
    }
    if (enPassantCapture) {
      if (isWhitePiece(piece)) {
        newCaptured.black.push(enPassantCapture);
      } else {
        newCaptured.white.push(enPassantCapture);
      }
    }
    setCapturedPieces(newCaptured);

    // Update king moved status
    if (piece.toLowerCase() === 'k') {
      setKingMoved({ ...kingMoved, [currentTurn]: true });
    }

    // Update rook moved status
    if (piece.toLowerCase() === 'r') {
      if (fromRow === 7 && fromCol === 7) setRookMoved({ ...rookMoved, whiteKingSide: true });
      if (fromRow === 7 && fromCol === 0) setRookMoved({ ...rookMoved, whiteQueenSide: true });
      if (fromRow === 0 && fromCol === 7) setRookMoved({ ...rookMoved, blackKingSide: true });
      if (fromRow === 0 && fromCol === 0) setRookMoved({ ...rookMoved, blackQueenSide: true });
    }

    // Set en passant target
    if (piece.toLowerCase() === 'p' && Math.abs(toRow - fromRow) === 2) {
      const epRow = (fromRow + toRow) / 2;
      setEnPassantTarget([epRow, toCol]);
    } else {
      setEnPassantTarget(null);
    }

    const moveNotation = `${String.fromCharCode('a'.charCodeAt(0) + fromCol)}${8 - fromRow}-${String.fromCharCode('a'.charCodeAt(0) + toCol)}${8 - toRow}`;
    setLastMove({ from: [fromRow, fromCol], to: [toRow, toCol] });
    setMoveHistory([...moveHistory, { notation: moveNotation, piece, captured: capturedPiece || enPassantCapture }]);
    
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // Update board first, then check game status with the new board
    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    setSelectedSquare(null);
    setIsThinking(false);

    // Use the new board for status checks
    checkGameStatus(nextTurn, newBoard);
  };

  const checkGameStatus = (turn, boardState) => {
    // We need to check with the updated board state
    const hasValidMoves = checkHasValidMoves(turn, boardState);
    const inCheck = isInCheck(turn, boardState);

    if (inCheck) {
      if (!hasValidMoves) {
        setGameStatus('checkmate');
        showToast(`Checkmate! ${turn === 'white' ? 'Black' : 'White'} wins!`, 'success');
      } else {
        setGameStatus('check');
        showToast(`${turn === 'white' ? 'White' : 'Black'} is in check!`, 'warning');
      }
    } else if (!hasValidMoves) {
      setGameStatus('stalemate');
      showToast('Stalemate! Game is a draw.', 'info');
    } else {
      setGameStatus('active');
    }
  };

  const checkHasValidMoves = (color, boardState) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && ((color === 'white' && isWhitePiece(piece)) || (color === 'black' && isBlackPiece(piece)))) {
          for (let r2 = 0; r2 < 8; r2++) {
            for (let c2 = 0; c2 < 8; c2++) {
              if (isValidMoveWithBoard(r, c, r2, c2, color, boardState)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  const isValidMoveWithBoard = (fromRow, fromCol, toRow, toCol, turn, boardState) => {
    const piece = boardState[fromRow][fromCol];
    if (!piece) return false;

    if (turn === 'white' && !isWhitePiece(piece)) return false;
    if (turn === 'black' && !isBlackPiece(piece)) return false;

    if (!isValidMoveIgnoringCheck(fromRow, fromCol, toRow, toCol, boardState)) return false;

    // Check if move leaves king in check
    const newBoard = boardState.map(row => [...row]);
    const capturedPiece = newBoard[toRow][toCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Handle en passant capture
    if (piece.toLowerCase() === 'p' && enPassantTarget && 
        toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const captureRow = isWhitePiece(piece) ? toRow + 1 : toRow - 1;
      newBoard[captureRow][toCol] = null;
    }

    const color = isWhitePiece(piece) ? 'white' : 'black';
    if (isInCheck(color, newBoard)) {
      return false;
    }

    return true;
  };

  const handleSquareClick = (row, col) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    if (gameMode === 'pve' && currentTurn === 'black') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      if (isValidMove(selectedRow, selectedCol, row, col)) {
        makeMove(selectedRow, selectedCol, row, col);
      } else if (piece &&
        ((currentTurn === 'white' && isWhitePiece(piece)) ||
          (currentTurn === 'black' && isBlackPiece(piece)))) {
        setSelectedSquare([row, col]);
      } else {
        setSelectedSquare(null);
      }
    } else if (piece &&
      ((currentTurn === 'white' && isWhitePiece(piece)) ||
        (currentTurn === 'black' && isBlackPiece(piece)))) {
      setSelectedSquare([row, col]);
    }
  };

  const getAllValidMoves = () => {
    const moves = [];
    const color = currentTurn;
    for (let r1 = 0; r1 < 8; r1++) {
      for (let c1 = 0; c1 < 8; c1++) {
        const piece = board[r1][c1];
        if (piece && ((color === 'white' && isWhitePiece(piece)) || (color === 'black' && isBlackPiece(piece)))) {
          for (let r2 = 0; r2 < 8; r2++) {
            for (let c2 = 0; c2 < 8; c2++) {
              if (isValidMove(r1, c1, r2, c2)) {
                const from = String.fromCharCode('a'.charCodeAt(0) + c1) + (8 - r1);
                const to = String.fromCharCode('a'.charCodeAt(0) + c2) + (8 - r2);
                moves.push(from + to);
              }
            }
          }
        }
      }
    }
    return moves;
  };

  const getAIPrompt = (validMoves) => {
    const movesString = validMoves.join(', ');
    const prompts = {
      easy: `You are a beginner chess player playing as Black. From these valid moves: ${movesString}. Pick ONE move randomly. Respond with ONLY the four-character move (like e7e5) and nothing else.`,
      medium: `You are a club-level chess player playing as Black. From these valid moves: ${movesString}. Pick a reasonable tactical move. Respond with ONLY the four-character move (like e7e5) and nothing else.`,
      hard: `You are a strong chess player playing as Black. From these valid moves: ${movesString}. Pick the best strategic move. Respond with ONLY the four-character move (like e7e5) and nothing else.`
    };
    return prompts[difficulty];
  };

  const makeAIMove = async () => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    
    setIsThinking(true);
    try {
      const validMoves = getAllValidMoves();

      if (validMoves.length === 0) {
        if (isInCheck('black')) {
          setGameStatus('checkmate');
          showToast('Checkmate! White wins!', 'success');
        } else {
          setGameStatus('stalemate');
          showToast('Stalemate! Game is a draw.', 'info');
        }
        setIsThinking(false);
        return;
      }

      // For easy mode, just pick random move
      if (difficulty === 'easy') {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        const fromCol = randomMove.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = 8 - parseInt(randomMove[1]);
        const toCol = randomMove.charCodeAt(2) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(randomMove[3]);
        
        setTimeout(() => {
          makeMove(fromRow, fromCol, toRow, toCol);
        }, 800);
        return;
      }

      const apiKey = "AIzaSyDYgcGWeQ7Peb67Q5OSeqzw0KVPRgoAk2U";
      const prompt = getAIPrompt(validMoves);
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: difficulty === 'medium' ? 0.7 : 0.3,
            maxOutputTokens: 20
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiMoveText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiMoveText) {
        throw new Error("AI returned empty response");
      }

      const moveMatch = aiMoveText.match(/[a-h][1-8][a-h][1-8]/);
      if (moveMatch && validMoves.includes(moveMatch[0])) {
        const move = moveMatch[0];
        const fromCol = move.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = 8 - parseInt(move[1]);
        const toCol = move.charCodeAt(2) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(move[3]);

        setTimeout(() => {
          makeMove(fromRow, fromCol, toRow, toCol);
        }, 800);
      } else {
        throw new Error("Invalid AI move");
      }
    } catch (error) {
      console.error('AI error:', error);
      const validMoves = getAllValidMoves();
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        const fromCol = randomMove.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = 8 - parseInt(randomMove[1]);
        const toCol = randomMove.charCodeAt(2) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(randomMove[3]);
        
        setTimeout(() => {
          makeMove(fromRow, fromCol, toRow, toCol);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (gameMode === 'pve' && currentTurn === 'black' && !isThinking && 
        gameStatus !== 'checkmate' && gameStatus !== 'stalemate') {
      const timeoutId = setTimeout(() => makeAIMove(), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentTurn, gameMode, board, isThinking, gameStatus]);

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setCurrentTurn('white');
    setGameStatus('active');
    setMoveHistory([]);
    setIsThinking(false);
    setDifficulty(null);
    setCapturedPieces({ white: [], black: [] });
    setKingMoved({ white: false, black: false });
    setRookMoved({ 
      whiteKingSide: false, 
      whiteQueenSide: false, 
      blackKingSide: false, 
      blackQueenSide: false 
    });
    setEnPassantTarget(null);
    setLastMove(null);
  };

  const validMoves = selectedSquare ? getValidMovesForPiece(selectedSquare[0], selectedSquare[1]) : [];

  if (!gameMode) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">♟️</span>
          Chess
        </h2>

        <div className={`${cardBg} p-6 rounded-2xl border ${borderColor}`}>
          <h3 className="text-xl font-bold mb-4 text-center">Select Game Mode</h3>

          <div className="space-y-3">
            <button
              onClick={() => setGameMode('pvp')}
              className={`w-full p-6 rounded-2xl border-2 border-blue-500 ${theme === 'dark' ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'bg-blue-50 hover:bg-blue-100'} transition-colors`}
            >
              <p className="text-2xl mb-2">👥</p>
              <p className="text-xl font-bold">Player vs Player</p>
              <p className={`text-sm ${textSecondary} mt-2`}>Play against a friend locally</p>
            </button>

            <button
              onClick={() => setGameMode('pve')}
              className={`w-full p-6 rounded-2xl border-2 border-purple-500 ${theme === 'dark' ? 'bg-purple-600/20 hover:bg-purple-600/30' : 'bg-purple-50 hover:bg-purple-100'} transition-colors`}
            >
              <p className="text-2xl mb-2">🤖</p>
              <p className="text-xl font-bold">Player vs AI</p>
              <p className={`text-sm ${textSecondary} mt-2`}>Challenge the AI opponent</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'pve' && !difficulty) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setGameMode(null)}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">♟️</span>
          Select Difficulty
        </h2>

        <div className={`${cardBg} p-6 rounded-2xl border ${borderColor} space-y-3`}>
          <button
            onClick={() => setDifficulty('easy')}
            className={`w-full p-4 rounded-xl ${theme === 'dark' ? 'bg-green-600/20 hover:bg-green-600/30' : 'bg-green-50 hover:bg-green-100'} transition-colors border-2 border-green-500`}
          >
            <p className="text-xl font-bold">Easy</p>
            <p className={`text-sm ${textSecondary} mt-1`}>Random moves</p>
          </button>

          <button
            onClick={() => setDifficulty('medium')}
            className={`w-full p-4 rounded-xl ${theme === 'dark' ? 'bg-yellow-600/20 hover:bg-yellow-600/30' : 'bg-yellow-50 hover:bg-yellow-100'} transition-colors border-2 border-yellow-500`}
          >
            <p className="text-xl font-bold">Medium</p>
            <p className={`text-sm ${textSecondary} mt-1`}>Tactical play</p>
          </button>

          <button
            onClick={() => setDifficulty('hard')}
            className={`w-full p-4 rounded-xl ${theme === 'dark' ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-red-50 hover:bg-red-100'} transition-colors border-2 border-red-500`}
          >
            <p className="text-xl font-bold">Hard</p>
            <p className={`text-sm ${textSecondary} mt-1`}>Strategic play</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">♟️</span>
          Chess
        </h2>
        <button
          onClick={() => {
            setGameMode(null);
            resetGame();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className={`${cardBg} p-6 rounded-2xl border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className={`px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${textSecondary} mb-1`}>Current Turn</p>
            <p className="text-lg font-bold">{currentTurn === 'white' ? '⚪ White' : '⚫ Black'}</p>
          </div>
          
          {gameStatus === 'check' && (
            <div className="px-4 py-2 rounded-xl bg-red-500/20 border-2 border-red-500">
              <p className="text-lg font-bold text-red-500">⚠️ Check!</p>
            </div>
          )}
          
          {gameStatus === 'checkmate' && (
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border-2 border-green-500">
              <p className="text-lg font-bold text-green-500">👑 Checkmate!</p>
            </div>
          )}
          
          {gameStatus === 'stalemate' && (
            <div className="px-4 py-2 rounded-xl bg-gray-500/20 border-2 border-gray-500">
              <p className="text-lg font-bold">🤝 Stalemate!</p>
            </div>
          )}

          {gameMode === 'pve' && (
            <div className={`px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Difficulty</p>
              <p className="text-lg font-bold capitalize">{difficulty}</p>
            </div>
          )}
        </div>

        {isThinking && (
          <div className="mb-4 p-3 bg-purple-500/20 rounded-xl text-center">
            <p className="font-medium">🤖 AI is thinking...</p>
          </div>
        )}

        <div className="grid grid-cols-8 gap-0 max-w-md mx-auto border-4 border-gray-800 rounded-xl overflow-hidden">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
              const isValidMoveSquare = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
              const isLastMoveSquare = lastMove && (
                (lastMove.from[0] === rowIndex && lastMove.from[1] === colIndex) ||
                (lastMove.to[0] === rowIndex && lastMove.to[1] === colIndex)
              );

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  className={`aspect-square text-4xl flex items-center justify-center transition-all relative ${
                    isSelected
                      ? 'bg-yellow-400 ring-4 ring-yellow-500 scale-110 z-10'
                      : isLastMoveSquare
                        ? theme === 'dark' ? 'bg-blue-400/40' : 'bg-blue-300/60'
                        : isLight
                          ? theme === 'dark' ? 'bg-gray-300' : 'bg-amber-100'
                          : theme === 'dark' ? 'bg-gray-600' : 'bg-amber-700'
                  } hover:opacity-80`}
                >
                  {piece && getPieceEmoji(piece)}
                  {isValidMoveSquare && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                      <div className={`w-3 h-3 rounded-full ${piece ? 'ring-4 ring-green-500 w-full h-full opacity-30' : 'bg-green-500 opacity-60'}`} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className={`mt-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-xs ${textSecondary} text-center`}>
            💡 Click a piece to select it, then click where you want to move. Green dots show valid moves.
          </p>
        </div>

        {/* Captured Pieces */}
        <div className="mt-4 space-y-2">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${textSecondary} mb-2`}>⚫ Black Captured</p>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.black.length > 0 ? (
                capturedPieces.black.map((piece, idx) => (
                  <span key={idx} className="text-2xl">{getPieceEmoji(piece)}</span>
                ))
              ) : (
                <span className={`text-sm ${textSecondary}`}>None</span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${textSecondary} mb-2`}>⚪ White Captured</p>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.white.length > 0 ? (
                capturedPieces.white.map((piece, idx) => (
                  <span key={idx} className="text-2xl">{getPieceEmoji(piece)}</span>
                ))
              ) : (
                <span className={`text-sm ${textSecondary}`}>None</span>
              )}
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors flex items-center justify-between`}
          >
            <span className="font-medium">📜 Move History ({moveHistory.length})</span>
            <span>{showHistory ? '▲' : '▼'}</span>
          </button>
          
          {showHistory && (
            <div className={`mt-2 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} max-h-48 overflow-y-auto`}>
              {moveHistory.length > 0 ? (
                <div className="space-y-2">
                  {moveHistory.map((move, idx) => (
                    <div key={idx} className={`text-sm p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <span className="font-bold">{idx + 1}.</span> {getPieceEmoji(move.piece)} {move.notation}
                      {move.captured && <span className="ml-2 text-red-500">× {getPieceEmoji(move.captured)}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${textSecondary} text-center`}>No moves yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chess;