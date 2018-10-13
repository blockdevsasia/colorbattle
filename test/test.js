const soliditySha3 = require('web3-utils').soliditySha3;
require('truffle-test-utils').init();

const ColorBattle = artifacts.require("ColorBattle");

const GameState = {
    Playing : 0,
    Revealing : 1,
    Deciding : 2
};

function blindMove(salt, move){
    // hash the XOR of the salt and the move
    return soliditySha3({type: 'uint32', value: salt ^ move});
}

function intMove(move){
    // Convert move from array to uint
    let moveInt = move[2]
    moveInt += (move[1] << 8)
    moveInt += (move[0] << 16)

    return moveInt
}

function randomUint31(){
    return Math.floor(Math.random() * Math.pow( 2, 31 ))
}

contract('ColorBattle Test: ', async(accounts) => {

    it("should instantiate a new Game and test Playing state", async () => {

        let colorBattle = await ColorBattle.deployed()

        let player1 = accounts[1]
        let gameInfo = await colorBattle.currentGameInfo()

        const state = gameInfo[0].toNumber()
        const numGames = gameInfo[1].toNumber()

        assert.equal(GameState.Playing, state, "GameState should be 'Playing'")

        balance = await colorBattle.getBalance({from: player1});
        assert.equal(balance, 0, "Player 1's balance should be 0")
        
        let err = null
        try {
            await colorBattle.decideGame()
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)

        err = null
        try {
            await colorBattle.revealMove()
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    })

    it("should have 3 players play, and player1 wins with WinType.Red", async () => {
        const colorBattle = await ColorBattle.deployed()
        const player1 = accounts[1]
        const player2 = accounts[2]
        const player3 = accounts[3]
        const player1_move = intMove([2,0,0])
        const player2_move = intMove([0,1,0])
        const player3_move = intMove([0,0,1])
        const player1_salt = 8589934592 //randomUint32() 
        const player2_salt = randomUint31()
        const player3_salt = randomUint31()
        const player1_blindMove = blindMove(player1_salt, player1_move) 
        const player2_blindMove = blindMove(player2_salt, player2_move) 
        const player3_blindMove = blindMove(player3_salt, player3_move) 
        const player1_deposit = 765
        const player2_deposit = 7650
        const player3_deposit = 76500

        let player1_balance = player1_deposit;
        let player2_balance = player2_deposit;
        let player3_balance = player3_deposit;

        // Deposit for Player1 and assert it's really there
        await colorBattle.deposit({from: player1, value: player1_deposit});
        player1_balance = await colorBattle.getBalance({from: player1});
        assert.equal(player1_balance, player1_deposit, "Player 1's balance should be " + player1_deposit + ", but its now " + player1_balance)

        // Deposit for the other players
        await colorBattle.deposit({from: player2, value: player2_deposit});
        await colorBattle.deposit({from: player3, value: player3_deposit});

        // Make move for Player1
        await colorBattle.commitMove(player1_blindMove, {from: player1});

        // Try to reveal with 1 commit (must be 2 or more)
        err = null
        try {
            await colorBattle.revealGame()
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)

        // Make moves for Player2 and Player3
        await colorBattle.commitMove(player2_blindMove, {from: player2});
        await colorBattle.commitMove(player3_blindMove, {from: player3});

        // Request Reveal
        await colorBattle.revealGame()

        // Check that GameState is Revealing
        let gameInfo = await colorBattle.currentGameInfo()
        assert.equal(GameState.Revealing, gameInfo[0].toNumber(), "GameState should be 'Revealing'")

        // Send WRONG reveal for Player1
        err = null
        try {
            await colorBattle.revealMove(666, player1_move, player1_blindMove, {from: player1});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)

        // Send normal reveal for Player1
        result = await colorBattle.revealMove(player1_salt, player1_move, player1_blindMove, {from: player1});
       
        assert.web3Event(result, { event: 
                'PlayerRevealed',
                args: { player: player1 }
        }, 'The event is emitted');

        // Send normal reveal for Player2 and Player3
        result = await colorBattle.revealMove(player2_salt, player2_move, player2_blindMove, {from: player2});
        result = await colorBattle.revealMove(player3_salt, player3_move, player3_blindMove, {from: player3});

        // Trigger Decide
        result = await colorBattle.decideGame();

        assert.web3Event(result, { event: 
            'Decided',
            args: { 
                numGames: 1, 
                winningAmount: 4,
                winner : player1, 
                winningMove: player1_move, 
                winType: 0}
        }, 'The event is emitted');

        // Check that GameState is Playing
        gameInfo = await colorBattle.currentGameInfo()
        assert.equal(GameState.Playing, gameInfo[0].toNumber(), "GameState should be 'Playing'")
    })
})