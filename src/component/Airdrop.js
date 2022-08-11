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
    Card,CardGroup,CardImg,CardBody,CardTitle,CardSubtitle,CardText,CardLink,CardFooter,CardHeader,
    Form,Input,
    UncontrolledPopover,PopoverHeader,PopoverBody,
    Container,
    Table,
    Badge,
    Alert,
    Collapse,
    Nav,NavItem,NavLink,TabContent,TabPane,
    Modal,ModalBody,ModalFooter,ModalHeader
} from 'reactstrap';
import classnames from 'classnames';

function Airdrop(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [Qiuqiu_Id, setQiuqiu_Id] = useState(0);
    const [Impes_Id, setImpes_Id] = useState(0);
    const [Yinbao_Id, setYinbao_Id] = useState(0);
    const [Qiuqiu_totalSupply, setQiuqiu_totalSupply] = useState(0);
    const [Impes_totalSupply, setImpes_totalSupply] = useState(0);
    const [Yinbao_totalSupply, setYinbao_totalSupply] = useState(0);
    const [pauseToStopNFT, setPauseToStopNFT] = useState(false);
    const [airdropCount, setAirdropCount] = useState(0);
    const [inputValue_1, setInputValue_1] = useState(
        {
            idTarget: "",
            airDropFrom: "",
            oldAddressListTarget: "",
        }
    );
    const [inputValue_2, setInputValue_2] = useState(
        {
            newAddressListTarget: "",
        }
    );
    const [currentActiveTab_token1, setCurrenActiveTab_token1] = useState('1');
    const [currentActiveTab_token2, setCurrenActiveTab_token2] = useState('1');
    const [currentActiveTab_token3, setCurrenActiveTab_token3] = useState('1');
    const [modal_token1, setModal_token1] = useState(false);
    const [modal_token2, setModal_token2] = useState(false);
    const [modal_token3, setModal_token3] = useState(false);
    const [unmountOnClose_token1, setUnmountOnClose_token1] = useState(true);
    const [unmountOnClose_token2, setUnmountOnClose_token2] = useState(true);
    const [unmountOnClose_token3, setUnmountOnClose_token3] = useState(true);
    const [uploadStatus, setUploadStatus] = useState("");
    const [airDropStatus, setAirDropStatus] = useState("");
    const [uploadByAllNFTStatus, setUploadByAllNFTStatus] = useState("");

    //abi contract setting
    const contractAddress = '0x3121b32DB5D5A3445c259C54395fD67DaDe7c4d4';
    const contractABI = abi;

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
                    const Qiuqiu_totalSupply = await nftContract.totalSupply(Qiuqiu_Id);
                    const Impes_totalSupply = await nftContract.totalSupply(Impes_Id);
                    const Yinbao_totalSupply = await nftContract.totalSupply(Yinbao_Id);
                    const pauseToStopNFT = await nftContract.paused();
                    setQiuqiu_Id(parseInt(Qiuqiu_Id));
                    setImpes_Id(parseInt(Impes_Id));
                    setYinbao_Id(parseInt(Yinbao_Id));
                    setQiuqiu_totalSupply(parseInt(Qiuqiu_totalSupply));
                    setImpes_totalSupply(parseInt(Impes_totalSupply));
                    setYinbao_totalSupply(parseInt(Yinbao_totalSupply));
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

    //更新單一NFT的合約名單資料
    const uploadNFTList = async (event) => {
        event.preventDefault();
        try {
            if (props.status === true) {
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

                    console.log(typeof(inputValue_1.oldAddressListTarget));
                    console.log(inputValue_2.newAddressListTarget);
                    const txn = await nftContract.setAddressListByTokenId(JSON.parse(inputValue_1.oldAddressListTarget), JSON.parse(inputValue_2.newAddressListTarget), inputValue_1.idTarget);
                    console.log("NFTList Uploading...");
                    setUploadStatus("⌛Uploading...");
                    await txn.wait();
                    console.log("NFTList Uploaded", txn.hash);
                    setUploadStatus("✅ Uploaded");
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

    //空投 ( 轉帳 )
    const airDropNFT = async (event) => {
        event.preventDefault();
        try {
            if (props.status === true) {
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

                    /*
                    const txn = await nftContract.mint(customerAddress, inputValue_1.idTarget, inputValue_1.mintAmountTarget);
                    console.log("NFT airDropping...");
                    setAirDropStatus("⌛airDropping...");
                    await txn.wait();
                    console.log("NFT airDropped", txn.hash);
                    setAirDropStatus("✅ airDropped");
                    */
                    console.log(inputValue_1.idTarget);
                    console.log(inputValue_1.airDropFrom);
                    console.log(inputValue_2.newAddressListTarget);
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

    //更新總名單
    const uploadAllNFTList = async (event) => {
        event.preventDefault();
        try {
            if (props.status === true) {
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

                    const txn = await nftContract.updateAllTokenIdAddressList();
                    console.log("NFTAllList Uploading...");
                    setUploadByAllNFTStatus("⌛Uploading...");
                    await txn.wait();
                    console.log("NFTAllList Uploaded", txn.hash);
                    setUploadByAllNFTStatus("✅ Uploaded");
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
    

    const toggle_tab_token1 = (tab) => {
        if (currentActiveTab_token1 !== tab) setCurrenActiveTab_token1(tab);
    }
    const toggle_tab_token2 = (tab) => {
        if (currentActiveTab_token2 !== tab) setCurrenActiveTab_token2(tab);
    }
    const toggle_tab_token3 = (tab) => {
        if (currentActiveTab_token3 !== tab) setCurrenActiveTab_token3(tab);
    }

    const changeUnmountOnClose_token1 = (e) => {
        let value = e.target.value;
        setUnmountOnClose_token1(JSON.parse(value));
    }
    const changeUnmountOnClose_token2 = (e) => {
        let value = e.target.value;
        setUnmountOnClose_token1(JSON.parse(value));
    }
    const changeUnmountOnClose_token3 = (e) => {
        let value = e.target.value;
        setUnmountOnClose_token1(JSON.parse(value));
    }

    const setModal_NFT1 = () => {
        setModal_token1(!modal_token1);
    }
    const setModal_NFT2 = () => {
        setModal_token2(!modal_token2);
    }
    const setModal_NFT3 = () => {
        setModal_token3(!modal_token3);
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        getContractInfo();
    });

    return (
        <div>
            {permisionByWallet ?
                <Container>
                    <Row>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardHeader>
                                        <CardTitle>
                                            {nftMetaData_1.name}
                                        </CardTitle>
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token1 === '1'})} onClick={() => {toggle_tab_token1('1');}}>
                                                    更新球球持有者名單
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token1 === '2'})} onClick={() => {toggle_tab_token1('2');}}>
                                                    空投
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token1 === '3'})} onClick={() => {toggle_tab_token1('3');}}>
                                                    更新總名單
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </CardHeader>
                                    <CardBody>
                                        <TabContent activeTab={currentActiveTab_token1}>
                                            <TabPane tabId="1">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入球球新持有者名單<br/>以更新合約名單資料</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT1}>輸入</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="2">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入球球的空投名單<br/>並開始空投</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT1}>空投</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="3">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>點擊按鈕更新合約總名單</h4>
                                                        <Button color='danger' onClick={uploadAllNFTList}>更新</Button>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                        </TabContent>
                                    </CardBody>
                                    {currentActiveTab_token1 === '1'
                                        ?   <Modal isOpen={modal_token1} toggle={setModal_NFT1} unmountOnClose={unmountOnClose_token1} backdrop={'static'} autoFocus={false}>
                                                <Form>
                                                    <ModalHeader toggle={setModal_NFT1}>請輸入球球的新持有者名單</ModalHeader>
                                                    <ModalBody>
                                                        <Alert><li>舊名單 ( NFT 舊持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-oldAddress'
                                                            name='upload-oldAddress'
                                                            placeholder='格式: [ address..., "0x01...", "0x02..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, oldAddressListTarget: e.target.value})}
                                                            value={inputValue_1.oldAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                        <br/>
                                                        <Alert><li>新名單 ( NFT 新持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-newAddress'
                                                            name='upload-newAddress'
                                                            placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                            value={inputValue_2.newAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="primary" onClick={uploadNFTList}>更新</Button>{' '}
                                                        <Button color="secondary" onClick={setModal_NFT1}>確認</Button>
                                                    </ModalFooter>
                                                </Form>
                                            </Modal>
                                        :   <div>
                                                {currentActiveTab_token1 === '2'
                                                    ?   <Modal isOpen={modal_token1} toggle={setModal_NFT1} unmountOnClose={unmountOnClose_token1} backdrop={'static'} autoFocus={false}>
                                                            <Form>
                                                                <ModalHeader toggle={setModal_NFT1}>請輸入球球的空投名單</ModalHeader>
                                                                <ModalBody>
                                                                    <Alert><li>操作者</li></Alert>
                                                                    <Input 
                                                                        type="text"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: 0x0000...'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, airDropFrom: e.target.value})}
                                                                        value={inputValue_1.airDropFrom}
                                                                        autoFocus={true}
                                                                    />
                                                                    <br/>
                                                                    <Alert><li>空投名單</li></Alert>
                                                                    <Input 
                                                                        type="textarea"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                                        value={inputValue_2.newAddressListTarget}
                                                                        autoFocus={true}
                                                                    />
                                                                </ModalBody>
                                                                <ModalFooter>
                                                                    <Button color="danger" onClick={airDropNFT}>確認空投</Button>{' '}
                                                                    <Button color="secondary" onClick={setModal_NFT1}>確認</Button>
                                                                </ModalFooter>
                                                            </Form>
                                                        </Modal>
                                                    :   ""
                                                }
                                            </div>
                                    }
                                </Card>
                            </CardGroup>
                        </Col>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardHeader>
                                        <CardTitle>{nftMetaData_2.name}</CardTitle>
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token2 === '1'})} onClick={() => {toggle_tab_token2('1');}}>
                                                    更新因佩斯持有者名單
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token2 === '2'})} onClick={() => {toggle_tab_token2('2');}}>
                                                    空投
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token2 === '3'})} onClick={() => {toggle_tab_token2('3');}}>
                                                    更新總名單
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </CardHeader>
                                    <CardBody>
                                        <TabContent activeTab={currentActiveTab_token2}>
                                            <TabPane tabId="1">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入因佩斯新持有者名單<br/>以更新合約名單資料</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT2}>輸入</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="2">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入因佩斯的空投名單<br/>並開始空投</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT2}>空投</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="3">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>點擊按鈕更新合約總名單</h4>
                                                        <Button color='danger' onClick={uploadAllNFTList}>更新</Button>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                        </TabContent>
                                    </CardBody>
                                    {currentActiveTab_token2 === '1'
                                        ?   <Modal isOpen={modal_token2} toggle={setModal_NFT2} unmountOnClose={unmountOnClose_token2} backdrop={'static'} autoFocus={false}>
                                                <Form>
                                                    <ModalHeader toggle={setModal_NFT2}>請輸入因佩斯的新持有者名單</ModalHeader>
                                                    <ModalBody>
                                                        <Alert><li>舊名單 ( NFT 舊持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-oldAddress'
                                                            name='upload-oldAddress'
                                                            placeholder='格式: [ address..., "0x01...", "0x02..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, oldAddressListTarget: e.target.value})}
                                                            value={inputValue_1.oldAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                        <br/>
                                                        <Alert><li>新名單 ( NFT 新持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-newAddress'
                                                            name='upload-newAddress'
                                                            placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                            value={inputValue_2.newAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="primary" onClick={uploadNFTList}>更新</Button>{' '}
                                                        <Button color="secondary" onClick={setModal_NFT2}>確認</Button>
                                                    </ModalFooter>
                                                </Form>
                                            </Modal>
                                        :   <div>
                                                {currentActiveTab_token2 === '2'
                                                    ?   <Modal isOpen={modal_token2} toggle={setModal_NFT2} unmountOnClose={unmountOnClose_token2} backdrop={'static'} autoFocus={false}>
                                                            <Form>
                                                                <ModalHeader toggle={setModal_NFT2}>請輸入因佩斯的空投名單</ModalHeader>
                                                                <ModalBody>
                                                                    <Alert><li>操作者</li></Alert>
                                                                    <Input 
                                                                        type="text"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: 0x0000...'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, airDropFrom: e.target.value})}
                                                                        value={inputValue_1.airDropFrom}
                                                                        autoFocus={true}
                                                                    />
                                                                    <br/>
                                                                    <Alert><li>空投名單</li></Alert>
                                                                    <Input 
                                                                        type="textarea"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                                        value={inputValue_2.newAddressListTarget}
                                                                        autoFocus={true}
                                                                    />
                                                                </ModalBody>
                                                                <ModalFooter>
                                                                    <Button color="danger" onClick={airDropNFT}>確認空投</Button>{' '}
                                                                    <Button color="secondary" onClick={setModal_NFT2}>確認</Button>
                                                                </ModalFooter>
                                                            </Form>
                                                        </Modal>
                                                    :   ""
                                                }
                                            </div>
                                    }
                                </Card>
                            </CardGroup>
                        </Col>
                        <Col sm={6} md={4} className="mb-3">
                            <CardGroup>
                                <Card className='my-2' color='secondary' outline>
                                    <CardHeader>
                                        <CardTitle>{nftMetaData_3.name}</CardTitle>
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token3 === '1'})} onClick={() => {toggle_tab_token3('1');}}>
                                                    更新音寶持有者名單
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token3 === '2'})} onClick={() => {toggle_tab_token3('2');}}>
                                                    空投
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink className={classnames({active: currentActiveTab_token3 === '3'})} onClick={() => {toggle_tab_token3('3');}}>
                                                    更新總名單
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </CardHeader>
                                    <CardBody>
                                        <TabContent activeTab={currentActiveTab_token3}>
                                            <TabPane tabId="1">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入音寶新持有者名單<br/>以更新合約名單資料</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT3}>輸入</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="2">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>請輸入音寶的空投名單<br/>並開始空投</h4>
                                                        <Form inline onSubmit={(e) => e.preventDefault()}>
                                                            <Button color="danger" onClick={setModal_NFT3}>空投</Button>
                                                        </Form>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="3">
                                                <Row>
                                                    <Col sm="12">
                                                        <h4>點擊按鈕更新合約總名單</h4>
                                                        <Button color='danger' onClick={uploadAllNFTList}>更新</Button>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                        </TabContent>
                                    </CardBody>
                                    {currentActiveTab_token3 === '1'
                                        ?   <Modal isOpen={modal_token3} toggle={setModal_NFT3} unmountOnClose={unmountOnClose_token3} backdrop={'static'} autoFocus={false}>
                                                <Form>
                                                    <ModalHeader toggle={setModal_NFT3}>請輸入音寶的新持有者名單</ModalHeader>
                                                    <ModalBody>
                                                        <Alert><li>舊名單 ( NFT 舊持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-oldAddress'
                                                            name='upload-oldAddress'
                                                            placeholder='格式: [ address..., "0x01...", "0x02..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, oldAddressListTarget: e.target.value})}
                                                            value={inputValue_1.oldAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                        <br/>
                                                        <Alert><li>新名單 ( NFT 新持有人 )</li></Alert>
                                                        <Input 
                                                            type="textarea"
                                                            className='input-upload-newAddress'
                                                            name='upload-newAddress'
                                                            placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                            rows={5}
                                                            onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                            value={inputValue_2.newAddressListTarget}
                                                            autoFocus={true}
                                                        />
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="primary" onClick={uploadNFTList}>更新</Button>{' '}
                                                        <Button color="secondary" onClick={setModal_NFT3}>確認</Button>
                                                    </ModalFooter>
                                                </Form>
                                            </Modal>
                                        :   <div>
                                                {currentActiveTab_token3 === '2'
                                                    ?   <Modal isOpen={modal_token3} toggle={setModal_NFT3} unmountOnClose={unmountOnClose_token3} backdrop={'static'} autoFocus={false}>
                                                            <Form>
                                                                <ModalHeader toggle={setModal_NFT3}>請輸入音寶的空投名單</ModalHeader>
                                                                <ModalBody>
                                                                    <Alert><li>操作者</li></Alert>
                                                                    <Input 
                                                                        type="text"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: 0x0000...'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_1({idTarget: Qiuqiu_Id, airDropFrom: e.target.value})}
                                                                        value={inputValue_1.airDropFrom}
                                                                        autoFocus={true}
                                                                    />
                                                                    <br/>
                                                                    <Alert><li>空投名單</li></Alert>
                                                                    <Input 
                                                                        type="textarea"
                                                                        className='input-airDrop'
                                                                        name='airDrop'
                                                                        placeholder='格式: [ address..., "0x011...", "0x022..." ]'
                                                                        rows={5}
                                                                        onChange={(e) => setInputValue_2({newAddressListTarget: e.target.value})}
                                                                        value={inputValue_2.newAddressListTarget}
                                                                        autoFocus={true}
                                                                    />
                                                                </ModalBody>
                                                                <ModalFooter>
                                                                    <Button color="danger" onClick={airDropNFT}>確認空投</Button>{' '}
                                                                    <Button color="secondary" onClick={setModal_NFT3}>確認</Button>
                                                                </ModalFooter>
                                                            </Form>
                                                        </Modal>
                                                    :   ""
                                                }
                                            </div>
                                    }
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

export default Airdrop;