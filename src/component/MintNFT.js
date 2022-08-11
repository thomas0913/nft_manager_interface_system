import { useState, useEffect, useCallback } from 'react';
import { ethers, utils } from 'ethers';
import abi from "../contracts/DeBallNFT.json";
import nftMetaData_1 from '../metaData/1.json';
import nftMetaData_2 from '../metaData/2.json';
import nftMetaData_3 from '../metaData/3.json';
// 匯入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
//選擇欲匯入的 reactstrap 組件
import {
    Row,Col,
    Button,
    Card,CardGroup,CardImg,CardBody,CardTitle,CardSubtitle,CardText,CardLink,CardFooter,
    Form,Input,
    UncontrolledPopover,PopoverHeader,PopoverBody,
    Container,
    Table,
    Badge,
    Alert,
} from 'reactstrap';

function MintNFT(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [openSeaProfile, setOpenSeaProfile] = useState(``);
    const [Qiuqiu_Id, setQiuqiu_Id] = useState(0);
    const [Impes_Id, setImpes_Id] = useState(0);
    const [Yinbao_Id, setYinbao_Id] = useState(0);
    const [Qiuqiu_maxSupply, setQiuqiu_maxSupply] = useState(0);
    const [Impes_maxSupply, setImpes_maxSupply] = useState(0);
    const [Yinbao_maxSupply, setYinbao_maxSupply] = useState(0);
    const [Qiuqiu_totalSupply, setQiuqiu_totalSupply] = useState(0);
    const [Impes_totalSupply, setImpes_totalSupply] = useState(0);
    const [Yinbao_totalSupply, setYinbao_totalSupply] = useState(0);
    const [publisher, setPublisher] = useState(null);
    const [balanceOfPublisher, setBalanceOfPublisher] = useState(0);
    const [pauseToStopNFT, setPauseToStopNFT] = useState(false);
    const [mintStatus, setMintStatus] = useState("");
    const [inputValue, setInputValue] = useState(
        {
            idTarget: "",
            mintAmountTarget: ""
        }
    );
    const [data, setData] = useState([]);

    //abi contract setting
    const contractAddress = '0x3121b32DB5D5A3445c259C54395fD67DaDe7c4d4';
    const contractABI = abi;

    const getData = () => {
        const options = {method: 'GET'};

        fetch('https://testnets-api.opensea.io/api/v1/assets?asset_contract_address=0x3121b32DB5D5A3445c259C54395fD67DaDe7c4d4&order_direction=desc&offset=0&limit=20&include_orders=false', options)
            .then(response => response.json())
            .then(response => {
                //setData(response);
                console.log(response);
                //console.log(data);
            })
            .catch(err => console.error(err));
    }
    
    
    //當錢包連接成功時，匯入錢包資訊，並讓此組件所有功能必須取得權限才能動作
    const checkIfWalletIsConnected = async () => {
        try {
            if (props.status === true) {
                setPermission(props.status);
                if (permisionByWallet === true) {
                    console.log(`wellcome back lord. ===>>> PERMISSION: ${permisionByWallet}`);
                }
                else {
                    console.log(`Access denied or waiting for web3. ===>>> PERMISSION: ${permisionByWallet}`);
                }
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
                //console.log(`Access denied or waiting for web3. ===>>> PERMISSION: ${permisionByWallet}`);
            }
        }
        catch (error) {
                console.log(error);
        }
    }

    //獲取合約資訊
    const getContractInfo = async () => {
        try {
            if (permisionByWallet === true) {
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); //請求當前使用人錢包地址
                    const account = accounts[0];
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                    //調用合約以取得合約資訊
                    const Qiuqiu_Id = await nftContract.Qiuqiu();
                    const Impes_Id = await nftContract.Impes();
                    const Yinbao_Id = await nftContract.Yinbao();
                    const Qiuqiu_maxSupply = await nftContract.Qiuqiu_maxSupply();
                    const Impes_maxSupply = await nftContract.Impes_maxSupply();
                    const Yinbao_maxSupply = await nftContract.Yinbao_maxSupply();
                    const Qiuqiu_totalSupply = await nftContract.totalSupply(Qiuqiu_Id);
                    const Impes_totalSupply = await nftContract.totalSupply(Impes_Id);
                    const Yinbao_totalSupply = await nftContract.totalSupply(Yinbao_Id);
                    const publisher = await nftContract.owner(); //string
                    const balanceOfPublisher_QuiQui = await nftContract.balanceOf(account, Qiuqiu_Id);
                    const balanceOfPublisher_Impes = await nftContract.balanceOf(account, Impes_Id);
                    const balanceOfPublisher_Yinbao = await nftContract.balanceOf(account, Yinbao_Id);
                    const balanceOfPublisherForAll = parseInt(balanceOfPublisher_QuiQui) + parseInt(balanceOfPublisher_Impes) + parseInt(balanceOfPublisher_Yinbao);
                    const pauseToStopNFT = await nftContract.paused();
                    setQiuqiu_Id(parseInt(Qiuqiu_Id));
                    setImpes_Id(parseInt(Impes_Id));
                    setYinbao_Id(parseInt(Yinbao_Id));
                    setQiuqiu_maxSupply(parseInt(Qiuqiu_maxSupply));
                    setImpes_maxSupply(parseInt(Impes_maxSupply));
                    setYinbao_maxSupply(parseInt(Yinbao_maxSupply));
                    setQiuqiu_totalSupply(parseInt(Qiuqiu_totalSupply));
                    setImpes_totalSupply(parseInt(Impes_totalSupply));
                    setYinbao_totalSupply(parseInt(Yinbao_totalSupply));
                    setPublisher(publisher);
                    setBalanceOfPublisher(balanceOfPublisherForAll);
                    setPauseToStopNFT(pauseToStopNFT);
                    console.log("Data update from contract completly.");
                }
                else {
                    setError("Please install a MetaMask wallet to use our Dapp web.");
                    console.log("No MetaMask detected");
                }
            }
            else {
                setPermission(props.status);
                //console.log(`GET_ERROR: Access denied or waiting for web3.`);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    //批量鑄造NFT
    const mintNFT = async (event) => {
        event.preventDefault();
        try {
            if (props.status === true) {
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

                    const txn = await nftContract.mint(customerAddress, inputValue.idTarget, inputValue.mintAmountTarget);
                    console.log("NFT minting...");
                    setMintStatus("⌛Minting...");
                    await txn.wait();
                    console.log("NFT Minted", txn.hash);
                    setMintStatus("✅ Minted");
                    getContractInfo();
                }
                else {
                    setError("Please install a MetaMask wallet to use our Dapp web.");
                    console.log("No MetaMask detected");
                }
            }
            else {
                setPermission(props.status);
                //console.log(`MINT_ERROR: Access denied or waiting for web3.`);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    //輸入新的 NFT URI 到智能合約中
    const setBaseUri = async () => {
        try {
            if (props.status === true) {
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); //請求當前使用人錢包地址
                    const account = accounts[0];
                    
                }
                else {
                    setError("Please install a MetaMask wallet to use our Dapp web.");
                    console.log("No MetaMask detected");
                }
            }
            else {
                setPermission(props.status);
                //console.log(`SET_ERROR: Access denied or waiting for web3.`);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        getContractInfo();
        getData();
    });

    return (
        <div>
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

            <br/>

            {permisionByWallet ?
                <Container>
                    <p>GALLERY</p>
                    <Row>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardImg width="100%" src={nftMetaData_1.image} alt={nftMetaData_1.name}/>
                                    <CardBody>
                                        <CardTitle>{nftMetaData_1.name}</CardTitle>
                                        <CardSubtitle>
                                            <h4>
                                                {Qiuqiu_totalSupply == Qiuqiu_maxSupply || Qiuqiu_totalSupply == 0
                                                    ? <Badge color='danger'>尚未被鑄造</Badge>
                                                    : <Badge color='success'>已鑄造: {Qiuqiu_totalSupply}</Badge>
                                                }
                                            </h4>
                                        </CardSubtitle>
                                        <CardText>
                                            {nftMetaData_1.description}
                                            <Button id='info_token_1' size='sm'>more</Button>
                                        </CardText>
                                        <Form>
                                            <Input
                                                type="text"
                                                className="input-mint"
                                                onChange={(e) => setInputValue({idTarget: Qiuqiu_Id, mintAmountTarget: e.target.value})}
                                                name="mint"
                                                placeholder="amount"
                                                value={inputValue.mintAmountTarget}
                                            />
                                            <Button color="secondary" size='lg' onClick={mintNFT}>鑄造</Button>
                                        </Form>
                                    </CardBody>
                                    <CardFooter>
                                        About:&nbsp;
                                        <CardLink href='https://testnets.opensea.io/assets/rinkeby/0x3121b32db5d5a3445c259c54395fd67dade7c4d4/1'>
                                            OpenSea.io
                                        </CardLink>
                                    </CardFooter>
                                    <UncontrolledPopover placement="bottom" target="info_token_1" trigger="legacy">
                                        <PopoverHeader>NFT Information</PopoverHeader>
                                        <PopoverBody>
                                            <Table bordered hover responsive size='sm' striped>
                                                <thead>
                                                    <tr>
                                                        <th>(即時更新)</th>
                                                        <th>Value</th>
                                                        <th>description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th scope='row'>Token ID</th>
                                                        <td>{Qiuqiu_Id}</td>
                                                        <td>NFT代號</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Publisher</th>
                                                        <td>迪球娛樂</td>
                                                        <td>發布單位</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>MaxSupply</th>
                                                        <td>{Qiuqiu_maxSupply}</td>
                                                        <td>最大鑄造量</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Mintable</th>
                                                        <td>{pauseToStopNFT ? "False" : "True"}</td>
                                                        <td>是否可鑄造</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </Card>
                            </CardGroup>
                        </Col>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardImg width="100%" src={nftMetaData_2.image} alt={nftMetaData_2.name}/>
                                    <CardBody>
                                        <CardTitle>{nftMetaData_2.name}</CardTitle>
                                        <CardSubtitle>
                                            <h4>
                                                {Impes_totalSupply == Impes_maxSupply || Impes_totalSupply == 0
                                                    ? <Badge color='danger'>尚未被鑄造</Badge>
                                                    : <Badge color='success'>已鑄造: {Impes_totalSupply}</Badge>
                                                }
                                            </h4>
                                        </CardSubtitle>
                                        <CardText>
                                            {nftMetaData_2.description}
                                            <Button id='info_token_2' size='sm'>more</Button>
                                        </CardText>
                                        <Form>
                                            <Input
                                                type="text"
                                                className="input-mint"
                                                onChange={(e) => setInputValue({idTarget: Impes_Id, mintAmountTarget: e.target.value})}
                                                name="mint"
                                                placeholder="amount"
                                                value={inputValue.mintAmountTarget}
                                            />
                                            <Button color="secondary" size='lg' onClick={mintNFT}>鑄造</Button>
                                        </Form>
                                    </CardBody>
                                    <CardFooter>
                                        About:&nbsp;
                                        <CardLink href='https://testnets.opensea.io/assets/rinkeby/0x3121b32db5d5a3445c259c54395fd67dade7c4d4/2'>
                                            OpenSea.io
                                        </CardLink>
                                    </CardFooter>
                                    <UncontrolledPopover placement="bottom" target="info_token_2" trigger="legacy">
                                        <PopoverHeader>NFT Information</PopoverHeader>
                                        <PopoverBody>
                                            <Table bordered hover responsive size='sm' striped>
                                                <thead>
                                                    <tr>
                                                        <th>(即時更新)</th>
                                                        <th>Value</th>
                                                        <th>description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th scope='row'>Token ID</th>
                                                        <td>{Impes_Id}</td>
                                                        <td>NFT代號</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Publisher</th>
                                                        <td>迪球娛樂</td>
                                                        <td>發布單位</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>MaxSupply</th>
                                                        <td>{Impes_maxSupply}</td>
                                                        <td>最大鑄造量</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Mintable</th>
                                                        <td>{pauseToStopNFT ? "False" : "True"}</td>
                                                        <td>是否可鑄造</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </Card>
                            </CardGroup>
                        </Col>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardImg width="100%" src={nftMetaData_3.image} alt={nftMetaData_3.name}/>
                                    <CardBody>
                                        <CardTitle>{nftMetaData_3.name}</CardTitle>
                                        <CardSubtitle>
                                            <h4>
                                                {Yinbao_totalSupply == Yinbao_maxSupply || Yinbao_totalSupply == 0
                                                    ? <Badge color='danger'>尚未被鑄造</Badge>
                                                    : <Badge color='success'>已鑄造: {Yinbao_totalSupply}</Badge>
                                                }
                                            </h4>     
                                        </CardSubtitle>
                                        <CardText>
                                            {nftMetaData_3.description}
                                            <Button id='info_token_3' size='sm'>more</Button>
                                        </CardText>
                                        <Form>
                                            <Input
                                                type="text"
                                                className="input-mint"
                                                onChange={(e) => setInputValue({idTarget: Yinbao_Id, mintAmountTarget: e.target.value})}
                                                name="mint"
                                                placeholder="amount"
                                                value={inputValue.mintAmountTarget}
                                            />
                                            <Button color="secondary" size='lg' onClick={mintNFT}>鑄造</Button>
                                        </Form>
                                    </CardBody>
                                    <CardFooter>
                                        About:&nbsp;
                                        <CardLink href='https://testnets.opensea.io/assets/rinkeby/0x3121b32db5d5a3445c259c54395fd67dade7c4d4/3'>
                                            OpenSea.io
                                        </CardLink>
                                    </CardFooter>
                                    <UncontrolledPopover placement="bottom" target="info_token_3" trigger="legacy">
                                        <PopoverHeader>NFT Information</PopoverHeader>
                                        <PopoverBody>
                                            <Table bordered hover responsive size='sm' striped>
                                                <thead>
                                                    <tr>
                                                        <th>(即時更新)</th>
                                                        <th>Value</th>
                                                        <th>description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th scope='row'>Token ID</th>
                                                        <td>{Yinbao_Id}</td>
                                                        <td>NFT代號</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Publisher</th>
                                                        <td>迪球娛樂</td>
                                                        <td>發布單位</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>MaxSupply</th>
                                                        <td>{Yinbao_maxSupply}</td>
                                                        <td>最大鑄造量</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope='row'>Mintable</th>
                                                        <td>{pauseToStopNFT ? "False" : "True"}</td>
                                                        <td>是否可鑄造</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container> :
                <Alert
                    color="danger"
                >
                    Permission denied
                </Alert>
            }
        </div>
    );
}

export default MintNFT;