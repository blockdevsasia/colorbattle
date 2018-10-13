pragma solidity >=0.4.24 <0.6.0;

contract ColorBattle
{
    enum GameState { Playing, Revealing, Decided }
    enum WinType {Red, Green, Blue, RedOverTie, GreenOverTie, BlueOverTie, AllTied}
    
    event Playing (
        uint256 numGames
    );
    
    event Revealing (
        uint256 numGames
    );
    
    event FailedToReveal (
        uint256 numGames,
        address player
    );
    
    event PlayerDeposited (
        address player,
        uint256 amount
    );
    
    event PlayerMoved (address player);
    event PlayerRevealed (address player);
    
    event Withdrawn (address payee, uint256 amount);

    event LogBytes32 (bytes32 message);
    event LogString (string message);
    event LogAddress (address message);
    event LogUint (uint message);
    event LogProcessMove (uint8 r, uint8 g, uint8 b);
    
    event Decided (
        uint256 numGames, 
        uint256 winningAmount,
        address winner, 
        uint256 winningMove,
        WinType winType
    );
    
    uint256 constant minimumDepositAmount = 255 + 255 + 255;  // 765
    uint256 constant freeCreditsAmount = 100000;

    uint256 constant minimumRevealTimeSeconds = 1 seconds;
    uint256 constant minimumDecideTimeSeconds = 1 seconds;

    uint256 private numGames = 0;

    mapping (uint256 => Game) private games;
    mapping (address => uint256) private leaderboard;
    mapping (address => uint256) private deposits;

    address private owner;
    
    struct Game {
        GameState state;
        uint256 numMoves;
        uint256 numRevealedMoves;
        address winner;
        uint256 winningMove;
        uint256 createTime;
        uint256 revealTime;
        uint256 decideTime;
        mapping(uint256 => Move) moves;
        mapping(address => uint256) players;
    }

    struct Move {
        address player;
        bytes32 blind;
        uint24 revealed;
    }
    
    constructor() public {
        owner = msg.sender;
        _create();
    }
    
    // function withdraw()
    //     public
    // {
    //     require(
    //         msg.sender == owner,
    //         "Only owner can call this"
    //     );

    //     uint256 payment = deposits[owner];

    //     deposits[owner] = 0;

    //     owner.transfer(payment);

    //     emit Withdrawn(owner, payment);
    // }

    function freeCredits()
        public
    {
        require(
            deposits[msg.sender] == 0,
            "You can only get free credits if balance is 0"
        );

        deposits[msg.sender] = freeCreditsAmount;
    }

    function currentGameInfo()
        public
        view
        returns (GameState _state, uint256 _numGames)
    {
        _state = games[numGames].state;
        _numGames = uint32(numGames);
    }
    
    function getBalance()
        public
        view
        returns (uint256 _balance)
    {
        _balance = deposits[msg.sender];
    }

    function revealGame()
        public
    {
        require(
            games[numGames].state == GameState.Playing
            && now >= games[numGames].createTime + minimumRevealTimeSeconds,
            "Game is still Playing"
        );
        
        require(
            games[numGames].numMoves > 1,
            "2 or more Players should commit their moves before Revealing is possible."
        );

        games[numGames].state = GameState.Revealing;
    }
    
    function parseMoves()
        private
        returns(
            Move maxRMove,
            Move maxGMove,
            Move maxBMove, 
            uint8 maxR,
            uint8 maxG,
            uint8 maxB, 
            uint256 winningAmount
        )
    {
        Game storage game = games[numGames];
        bool firstMoveSeen = false;
        for (uint256 i = 1; i <= game.numMoves; i++) {

            Move memory move = game.moves[i];
           
            if(move.revealed > 0){
                // Unpack the RGB values from the move
                (uint8 r, uint8 g, uint8 b) = unpackRevealedMove(move.revealed);
            
                if(!firstMoveSeen){
                    maxR = r;
                    maxG = g;
                    maxB = b;
                    maxRMove = move;
                    maxGMove = move;
                    maxBMove = move;
                    firstMoveSeen = true;
                }else{
                    if(r > maxR){
                        maxR = r;
                        maxRMove = move;
                    }
                    if(g > maxG){
                        maxG = g;
                        maxGMove = move;
                    }
                    if(b > maxB){
                        maxB = b;
                        maxBMove = move;
                    }
                }
                // Deduct the player the amount bet. The winner will later get it back.
                deposits[move.player] -= (r+g+b);
                winningAmount += (r+g+b);
            }else{
                // Move not revealed : debit player and credit winningAmount
                // with full deposit amount (765)
                deposits[move.player] -= minimumDepositAmount;
                
                winningAmount += minimumDepositAmount;
                
                emit FailedToReveal(numGames, games[numGames].moves[i].player);
            }
        } // for moves
    }

    function decideGame()
        public
    {
        require(
            games[numGames].state == GameState.Revealing
            && now >= games[numGames].revealTime + minimumDecideTimeSeconds,
            "Game is still Revealing"
        );
        
        require(
            games[numGames].numRevealedMoves > 1,
            "At least 2 Players should reveal their moves for the game to be Decided."
        );
        
        (
            Move memory maxRMove,
            Move memory maxGMove,
            Move memory maxBMove, 
            uint8 maxR,
            uint8 maxG,
            uint8 maxB, 
            uint256 winningAmount
        ) = parseMoves();

        Move memory winningMove;
        WinType winType;

        if(maxR > maxG && maxG <= maxB){            // RED wins normally
            winningMove = maxRMove;
            winType = WinType.Red;
        }else if(maxG > maxB && maxB <= maxR){      // GREEN wins normally
            winningMove = maxGMove;
            winType = WinType.Green;
        }else if(maxB > maxR && maxR <= maxG){      // BLUE wins normally
            winningMove = maxBMove;
            winType = WinType.Blue;
        }else if(maxB == maxG && maxR > 0){         // RED wins due to tie
            winningMove = maxRMove;
            winType = WinType.RedOverTie;
        }else if(maxR == maxB && maxG > 0){         // GREEN wins due to tie
            winningMove = maxGMove;
            winType = WinType.GreenOverTie;
        }else if(maxG == maxR && maxB > 0){         // BLUE wins due to tie
            winningMove = maxBMove;
            winType = WinType.BlueOverTie;
        }else{                                      // All 0, or tie with 0 as third.
            winningMove = Move(msg.sender, 0, 0);
            winType = WinType.AllTied;
        }
        
        // Pay out the winner (losers were already deducted from)
        deposits[winningMove.player] += winningAmount;
        
        // Emit the winner
        emit Decided (numGames, winningAmount, winningMove.player, winningMove.revealed, winType);
        
        // Immediately create a new game.
        _create();
    }
    
    function unpackRevealedMove(uint24 packed)
        private
        pure
        returns (uint8 r, uint8 g, uint8 b)
    {
        r = uint8(packed >> 16);
        g = uint8(packed >> 8);
        b = uint8(packed);
    }
    
    function _create()
        private
    {
        Game memory _game = Game({
            state: GameState.Playing,
            numMoves: 0,
            numRevealedMoves: 0,
            winner: 0,
            winningMove: 0,
            createTime: 0,
            revealTime: 0,
            decideTime: 0
        });
        
        numGames++;
        
        require(
            numGames == uint256(uint32(numGames)),
            "No more games!"
        );
        
        games[numGames] = _game;
        
        emit Playing(numGames);
    }
    
    function deposit()
        public
        payable
    {
        deposits[msg.sender] += msg.value;
    }
    
    function commitMove(bytes32 _blindedMove)
        public
    {
        require(
            deposits[msg.sender] >= minimumDepositAmount,
            "Player must have at least 765 points deposited to play."
        );
        
        Game storage game = games[numGames];
        
        require(
            game.state == GameState.Playing,
            "You can only submit a move when the game is Playing."
        );
        
        game.numMoves++;

        game.moves[game.numMoves] = Move(msg.sender, _blindedMove, 0);
        
        game.players[msg.sender] = game.numMoves;

    }
    
    function revealMove(uint32 _salt, uint24 _revealedMove, bytes32 _blindedMove)
        public
    {
        require(
            games[numGames].state == GameState.Revealing,
            "You can only reveal a move while the game is Revealing."
        );
        
        uint256 moveID = games[numGames].players[msg.sender];
                
        require(
            moveID > 0,
            "Player has no moves to reveal."
        );

        require(
            games[numGames].moves[moveID].blind == _blindedMove,
            "Blinded move is not equal to blinded move committed."
        );
        
        require(
            games[numGames].moves[moveID].blind == keccak256(abi.encodePacked(_salt ^ _revealedMove)),
            "Revealed move does not match blinded move."
        );

        games[numGames].moves[moveID].revealed = _revealedMove;
        
        games[numGames].numRevealedMoves += 1;

        emit PlayerRevealed(msg.sender);
        
    }
}