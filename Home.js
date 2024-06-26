import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import constants from './constants';

function Home() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [contractInstance, setContractInstance] = useState(null);
    const [status, setStatus] = useState(false);
    const [isWinner, setIsWinner] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    console.log(address);
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                        console.log(currentAccount);
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };

        const loadContract = async () => {
            if (currentAccount) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const contractIns = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
                    setContractInstance(contractIns);

                    const status = await contractIns.isComplete();
                    setStatus(status);

                    const winner = await contractIns.getWinner();
                    setIsWinner(winner === currentAccount);
                } catch (err) {
                    console.error(err);
                }
            }
        };

        loadBlockchainData();
        loadContract();
    }, [currentAccount]);

    const enterLottery = async () => {
        if (contractInstance) {
            try {
                const amountToSend = ethers.utils.parseEther('0.001');
                const tx = await contractInstance.enter({ value: amountToSend });
                await tx.wait();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const claimPrize = async () => {
        if (contractInstance) {
            try {
                const tx = await contractInstance.claimPrize();
                await tx.wait();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="container">
            <h1>Lottery Page</h1>
            <div className="button-container">
                {status ? (
                    isWinner ? (
                        <button className="enter-button" onClick={claimPrize}>Claim Prize</button>
                    ) : (
                        <p>You are not the winner</p>
                    )
                ) : (
                    <button className="enter-button" onClick={enterLottery}>Enter Lottery</button>
                )}
            </div>
        </div>
    );
}

export default Home;
