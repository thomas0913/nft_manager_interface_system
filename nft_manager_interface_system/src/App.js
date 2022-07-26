import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ethers, utils } from 'ethers';
import abi from "./contracts/DeBallNFT.json";
import AlertMessage from './component/AlertMessage';
import { render } from '@testing-library/react';

function App() {
  //Hook settong
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [permissionAllowed, setPermissionAllowed] = useState(false);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [currentDappName, setCurrentDappName] = useState(null);
  const [DappOwnerAddress, setDappOwnerAddress] = useState(null);
  const [isNetworkOnTestChain, setIsNetworkOnTestChain] = useState(false);

  //abi contract setting
  const contractAddress = '0x4A9A841A08E5E2A620391C4Cf8B06a874651a2C7';
  const contractABI = abi.abi;

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
  const getNFTName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DappContract = new ethers.Contract(contractAddress, contractABI, signer);

        let DappName = await DappContract.name();
        DappName = utils.formatBytes32String(DappName);
        DappName = utils.parseBytes32String(DappName);
        setCurrentDappName(DappName.toString());
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
    checkIfWalletIsConnected();
    getNFTOwnerHandler();
  }

  //在 dapp 首次加載時加載我們所有的函數
  useEffect(() => {
    checkIfWalletNetworkCorrect();
    getNFTName();
  }, [isWalletConnected]);
  
  return (
    <div>
      <main>
        <nav style={{textAlign:"center"}}>
          <h1 className="headline">&#128017;NFT Manage System Site&#128017;</h1>
        </nav>

        <section className="function-block" style={{textAlign:"center"}}>
          <div className="wallet-connecter">
            <p>1. Connect your wallet &#128179;</p>
            <button className="btn-connect" onClick={checkPermission}>
              {isWalletConnected ?
                "Wallet Connected 🔒" :
                "Connect Wallet 🔑"}
            </button>
            {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
            <AlertMessage />
            {isWalletConnected && permissionAllowed ?
              <p>Wellcome back Boss !!!</p> :
              <p>Access denied !!!</p>}
            
          </div>

          <div className="mint">
            <p>2. Mint NFTs &#128296;</p>
            <button className="mint-btn">

            </button>
          </div>

          <div className="airdrop">
            <p>3. Airdrop NFTs &#127873;</p>
            <button className="airdrop-btn">

            </button>
          </div>
        </section>

        <section className='statement-block'>
          <div className="mt-5">
            {currentDappName === "" && permissionAllowed ?
              <p>"Setup the name of your bank." </p> :
              <p className="text-3xl font-bold">{currentDappName}</p>
            }
          </div>
          {error && <p className="text-2xl text-red-700">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default App;
