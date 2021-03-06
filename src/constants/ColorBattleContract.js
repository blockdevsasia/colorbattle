export default {
    address: "0x7049f082803caa75280112fa732e29c87c58681b",
    abi : [
		{
			"constant": false,
			"inputs": [
				{
					"name": "_blindedMove",
					"type": "bytes32"
				}
			],
			"name": "commitMove",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [],
			"name": "decideGame",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [],
			"name": "deposit",
			"outputs": [],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [],
			"name": "freeCredits",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "numGames",
					"type": "uint256"
				}
			],
			"name": "Playing",
			"type": "event"
		},
		{
			"constant": false,
			"inputs": [],
			"name": "revealGame",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "numGames",
					"type": "uint256"
				}
			],
			"name": "Revealing",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "numGames",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "player",
					"type": "address"
				}
			],
			"name": "FailedToReveal",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "PlayerDeposited",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "player",
					"type": "address"
				}
			],
			"name": "PlayerMoved",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "player",
					"type": "address"
				}
			],
			"name": "PlayerRevealed",
			"type": "event"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_salt",
					"type": "uint32"
				},
				{
					"name": "_revealedMove",
					"type": "uint24"
				},
				{
					"name": "_blindedMove",
					"type": "bytes32"
				}
			],
			"name": "revealMove",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "payee",
					"type": "address"
				},
				{
					"indexed": false,
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Withdrawn",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "message",
					"type": "bytes32"
				}
			],
			"name": "LogBytes32",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "message",
					"type": "string"
				}
			],
			"name": "LogString",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "message",
					"type": "address"
				}
			],
			"name": "LogAddress",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "message",
					"type": "uint256"
				}
			],
			"name": "LogUint",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "r",
					"type": "uint8"
				},
				{
					"indexed": false,
					"name": "g",
					"type": "uint8"
				},
				{
					"indexed": false,
					"name": "b",
					"type": "uint8"
				}
			],
			"name": "LogProcessMove",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "numGames",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "winningAmount",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "winner",
					"type": "address"
				},
				{
					"indexed": false,
					"name": "winningMove",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "winType",
					"type": "uint8"
				}
			],
			"name": "Decided",
			"type": "event"
		},
		{
			"inputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "currentGameInfo",
			"outputs": [
				{
					"name": "_state",
					"type": "uint8"
				},
				{
					"name": "_numGames",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "getBalance",
			"outputs": [
				{
					"name": "_balance",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	]
}
