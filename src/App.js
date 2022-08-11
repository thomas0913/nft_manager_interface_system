import React, { useState, useEffect, useCallback } from 'react';
import { render } from '@testing-library/react';
import { checkProperties } from 'ethers/lib/utils';
//匯入 ethers.js 與合約
import { ethers, utils } from 'ethers';
import abi from "./contracts/DeBallNFT.json";
// 匯入組件
import Clock from './component/Clock';
import CheckAPI from './backends/checkAPI.js';
import OwnerAPI from './backends/ownerAPI';
import NFTCollection from './component/NFTCollection';
import MintNFT from './component/MintNFT';
import AirDropBySingleTrnsfer from './component/AirDropBySingleTransfer';
// 匯入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Button,
  NavLink
} from 'reactstrap'; //選擇欲匯入的 reactstrap 組件

function App() {
  //Hook settong
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [permissionAllowed, setPermissionAllowed] = useState(false);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [DappOwnerAddress, setDappOwnerAddress] = useState(null);
  const [isNetworkOnTestChain, setIsNetworkOnTestChain] = useState(false);
  

  //abi contract setting
  const contractAddress = '0x3121b32DB5D5A3445c259C54395fD67DaDe7c4d4';
  const contractABI = abi;

  //web3 wallet connecting
  const checkIfWalletIsConnected = async () => {
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); //請求當前使用人錢包地址
            const account = accounts[0];
            setIsWalletConnected(true);
            setCustomerAddress(account);
            console.log("Account Connected: ", account);
        }
        else {
            setError("Please install a MetaMask wallet to use our Dapp web.");
            console.log("No MetaMask detected");
        }
    }
    catch (error) {
            console.log(error);
    }
  }

  const checkIfWalletNetworkCorrect = async () => {
    try {
      if (window.ethereum) {
        const networks = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }], 
        });
        if (networks == null) {
          setIsNetworkOnTestChain(true);
          console.log("Connected to testNet on Rinkeby successfully.");
        }
      }
      else {
        setError("Please install a MetaMask wallet to use our Dapp web.");
        console.log("No MetaMask detected");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //Contract Responses
  const getNFTOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DappContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = DappContract.owner();
        Promise.resolve(owner).then(value => {
          setDappOwnerAddress(value);
          const a = async () => {
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts'});
            if (value.toLowerCase() === account.toLowerCase()) {
              setPermissionAllowed(true);
            }
            else {
              setPermissionAllowed(false);
            }
          }
          a();
          console.log("Developer's address: " + value);
        });
      }
      else {
        console.log("Ethereum object not found, install MetaMask.");
        setError("Please install a MetaMask wallet to use our Dapp web.");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const checkPermission = () => {
    checkIfWalletNetworkCorrect();
    getNFTOwnerHandler();
    checkIfWalletIsConnected();
  }

  //在 dapp 首次加載時加載我們所有的函數
  useEffect(() => {
    checkIfWalletNetworkCorrect();
  }, [isWalletConnected]);
  
  return (
    <div>
      <nav style={{textAlign:"center"}}>
        <h1 className="headline">&#128017;NFT Manage System Site&#128017;</h1>
        <Clock />
        <NavLink active href='#'>Guide</NavLink>
      </nav>
      <hr/>
      <main>
        <section className="function-block" style={{textAlign:"center"}}>
          <div className="wallet-connecter">
            <p>--------------- &#128179; Connect your wallet &#128179; ---------------</p>
            <div>
              <Button color='danger' className="btn-connect" onClick={checkPermission} style={{display: "inline"}}>
                {isWalletConnected ?
                  "Wallet Connected 🔒" :
                  "Connect Wallet 🔑"}
              </Button>
              {isWalletConnected && permissionAllowed ?
                <p>********* Wellcome back Boss !!! **********</p> :
                <p>********* Access denied !!! *********</p>}
              </div>
              {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          </div>
          <div className="mint">
            <p>-------------------- &#128296; Mint NFTs &#128296; --------------------</p>
            <div>
              <MintNFT status={permissionAllowed}/>
            </div>
          </div>
          <div className="airdrop">
            <p>--------------- &#127873; Airdrop NFTs &#127873; ---------------</p>
            <AirDropBySingleTrnsfer status={permissionAllowed}/>
          </div>
        </section>
        <br />
        <hr />
        <section className='statement-block' style={{textAlign: "center"}}>
          <div className='check-owner'>
            <p>-------------------- Owner checker --------------------</p>
            <p>If submit a button after input an wallet address, then print the message if is the token owner.</p>
            <div>
              <CheckAPI status={permissionAllowed}/>
            </div>
          </div>
          <div className='token-address-list'>
            <p>-------------------- Token list of owner --------------------</p>
            <div>
              <OwnerAPI status={permissionAllowed}/>
            </div>
          </div>
        </section>
        <hr/>
        <section>
          <div className='error-message'>
              {error && <p className="text-2xl text-red-700">{error}</p>}
          </div>
        </section>
        <footer style={{textAlign: "center"}}>
          <div>
            <p>Hope you like and your wellcome ...</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
