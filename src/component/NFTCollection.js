import { useState, useEffect, useCallback } from 'react';
import { ethers, utils } from 'ethers';
import abi from "../contracts/DeBallNFT.json";
import { render } from '@testing-library/react';
import { checkProperties, parseBytes32String } from 'ethers/lib/utils';
import nftMetaData from '../metaData/nft_metaData.json';
// 匯入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
//選擇欲匯入的 reactstrap 組件
import {
    Row,
    Col,
    Button,
    CardGroup,
    Card,
    CardImg,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardText,
    Alert
} from 'reactstrap';

function NFTCollection(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [nftUri, setNftUri] = useState(null);
    const [tokenId, setTokenId] = useState(null);
    const [openSeaProfile, setOpenSeaProfile] = useState(``);
    const [publisher, setPublisher] = useState(null);
    const [pauseToStopNFT, setPauseToStopNFT] = useState(false);

    //abi contract setting
    const contractAddress = '0x3121b32DB5D5A3445c259C54395fD67DaDe7c4d4';
    const contractABI = abi;

    //當錢包連接成功時，匯入錢包資訊，並讓此組件所有功能必須取得權限才能動作
    const checkIfWalletIsConnected = async () => {
        try {
            if (props.status === true) {
                setPermission(props.status);
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); //請求當前使用人錢包地址
                    const account = accounts[0];
                    setIsWalletConnected(true);
                    setCustomerAddress(account);
                    getContractInfo();
                    //設定連接到當前使用人錢包在 OpenSea 上的 NFT 總攬
                    setOpenSeaProfile(`https://testnets.opensea.io/${account}?tab=activity`);
                }
                else {
                    setError("Please install a MetaMask wallet to use our Dapp web.");
                    console.log("No MetaMask detected");
                }
            }
            else {
                setPermission(props.status);
            }
        }
        catch (error) {
                console.log(error);
        }
    }

    //獲取合約資訊
    const getContractInfo = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
            //調用合約以取得合約資訊
            const publisher = await nftContract.owner(); //string
            //const maxSupply = await nftContract.maxSupply(); //object
            //const totalSupply = await nftContract.totalSupply(); //object
            const pauseToStopNFT = await nftContract.paused();
            setPublisher(publisher);
            //setMaxSupply(parseInt(maxSupply));
            //setTotalSupply(parseInt(totalSupply));
            setPauseToStopNFT(pauseToStopNFT);
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        getContractInfo();
    });

    return (
        <div>
            <p>NFT name :</p>
            <Row>
                
                {permisionByWallet ?
                    <Col>DeBall NFT Section</Col> :
                    <Alert
                        color="danger"
                    >
                        Permission denied
                    </Alert>
                }
            </Row>
            <p>Current Collection :</p>
            {permisionByWallet ?
                <Row>
                    {
                        nftMetaData.map((nftMetaData) => (
                            <Col sm={6} md={2} className="mb-3" key={nftMetaData.edition}>
                                <CardGroup>
                                    <Card>
                                        <CardImg width="100%" src={nftMetaData.image} alt={nftMetaData.name}/>
                                        <CardBody>
                                            <CardTitle>{nftMetaData.name}</CardTitle>
                                            <CardSubtitle>
                                                
                                            </CardSubtitle>
                                            <CardText>{nftMetaData.description}</CardText>
                                            <Button color="secondary">詳細</Button>
                                        </CardBody>
                                    </Card>
                                </CardGroup>
                            </Col>
                        ))
                    }
                </Row> :
                <Alert
                    color="danger"
                >
                    Permission denied
                </Alert>
            }
        </div>
    );
}

export default NFTCollection;