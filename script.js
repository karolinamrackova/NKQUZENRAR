alert('Script Loaded!');

const board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDrop: handleMove
});

const game = new Chess();
const stockfish = new Worker('stockfish.js');
let aiLevel = 10;

function handleMove(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Automatically promote to a queen
    });

    if (move === null) return 'snapback';

    updateStatus();

    if (!game.game_over()) {
        window.setTimeout(makeAIMove, 250);
    } else if (game.in_checkmate()) {
        document.getElementById('code').classList.remove('hidden');
    }
}

function makeAIMove() {
    stockfish.postMessage('position fen ' + game.fen());
    stockfish.postMessage('go depth ' + aiLevel);

    stockfish.onmessage = function (event) {
        if (event && event.data.includes('bestmove')) {
            const bestMove = event.data.split(' ')[1];
            game.move({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4), promotion: 'q' });
            board.position(game.fen());
            updateStatus();

            if (game.game_over() && game.in_checkmate()) {
                document.getElementById('code').classList.remove('hidden');
            }
        }
    };
}

function updateStatus() {
    let status = '';

    if (game.in_checkmate()) {
        status = 'Checkmate! You lost. 😢';
    } else if (game.in_draw()) {
        status = 'Draw! 😐';
    } else {
        status = 'Your move!';
    }

    document.getElementById('status').innerText = status;
}
