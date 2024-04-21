import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Import ethers

import constants from './constants';

function PickWinner() {
    const [owner, setOwner] = useState('');
    const [contractInstance, setContractInstance] = useState(null); // Initialize to null
    const [currentAccount, setCurrentAccount] = useState('');
    const [isOwnerConnected, setIsOwnerConnected] = useState(false); // Corrected variable name
    const [winner, setWinner] = useState('');
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            console.log("Inside loadBlockchainData");
            if (typeof window.ethereum !== 'undefined') {
                try {
                    console.log("Metamask is installed");
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    console.log("Current Account Address:", address);
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        console.log("Accounts changed:", accounts);
                        setCurrentAccount(accounts[0]);
                        console.log("Current Account:", currentAccount);
                    });
                } catch (err) {
                    console.error("Error loading blockchain data:", err);
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };

        const loadContract = async () => {
            console.log("Inside loadContract");
            if (currentAccount) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const contractIns = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
                    console.log("Contract Instance:", contractIns);
                    setContractInstance(contractIns);

                    const status = await contractIns.isComplete();
                    console.log("Contract Status:", status);
                    setStatus(status);

                    const winner = await contractIns.getWinner();
                    console.log("Winner:", winner);
                    setWinner(winner);

                    const owner = await contractIns.getManager();
                    console.log("Owner:", owner);
                    setOwner(owner);

                    setIsOwnerConnected(owner === currentAccount);
                } catch (err) {
                    console.error("Error loading contract:", err);
                }
            }
        };

        loadBlockchainData();
        loadContract();
    }, [currentAccount]);

    const pickWinner = async () => {
        console.log("Inside pickWinner");
        if (contractInstance) {
            try {
                const tx = await contractInstance.pickWinner();
                console.log("Transaction:", tx);
                await tx.wait();
            } catch (err) {
                console.error("Error picking winner:", err);
            }
        }
    };

    return (
        <div className='container'>
            <h1>Result Page</h1>
            <div className='button-container'>
                {status ? (
                    <p>Lottery Winner is: {winner}</p>
                ) : (
                    isOwnerConnected ? (
                        <button className="enter-button" onClick={pickWinner}>Pick Winner</button>
                    ) : (
                        <p>You are not the owner</p>
                    )
                )}
            </div>
        </div>
    );
}

export default PickWinner;
