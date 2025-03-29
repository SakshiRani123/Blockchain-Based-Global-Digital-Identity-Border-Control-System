require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Web3 = require('web3');

const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables
const PORT = process.env.PORT || 5000;
const INFURA_URL = "https://mainnet.infura.io/v3/0203efe818d94bc287dc9b7335b7594e"
; // Ethereum node URL
const CONTRACT_ADDRESS = "0x02812332af7f4078c662e1b651b713ba7109797c";
const PRIVATE_KEY = "4aac4be2168469b1b9fc466432aedf4af2f48205e6ab4023b53fccb2d3cfdd04";
const ABI = require([
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "agent",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "AgentAuthorized",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_agent",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_status",
				"type": "bool"
			}
		],
		"name": "authorizeAgent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "passportNumber",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "nationality",
				"type": "string"
			}
		],
		"name": "IdentityRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "IdentityVerified",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_passportNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_nationality",
				"type": "string"
			}
		],
		"name": "registerIdentity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "verifyIdentity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedAgents",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "identities",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "passportNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nationality",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]); // Contract ABI

// Connect to Ethereum blockchain
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
app.post('/registerIdentity', async (req, res) => {
    try {
        const { name, passportNumber, nationality, userAddress } = req.body;
        const tx = contract.methods.registerIdentity(name, passportNumber, nationality);
        const gas = await tx.estimateGas({ from: account.address });
        const data = tx.encodeABI();
        const txObject = {
            to: CONTRACT_ADDRESS,
            gas,
            data
        };

        const signedTx = await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/getIdentity/:userAddress', async (req, res) => {
    try {
        const userAddress = req.params.userAddress;
        const identity = await contract.methods.identities(userAddress).call();
        res.json({ success: true, identity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/verifyIdentity', async (req, res) => {
    try {
        const { userAddress } = req.body;
        const tx = contract.methods.verifyIdentity(userAddress);
        const gas = await tx.estimateGas({ from: account.address });
        const data = tx.encodeABI();
        const txObject = {
            to: CONTRACT_ADDRESS,
            gas,
            data
        };

        const signedTx = await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
