import { type } from "@testing-library/user-event/dist/type";
import React, { Component, useEffect, useState } from "react";
// 匯入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Row,Col,
    Button,
    Card,CardGroup,CardImg,CardBody,CardTitle,CardSubtitle,CardText,CardLink,CardFooter,CardHeader,
    Form,Input,Label,
    UncontrolledPopover,PopoverHeader,PopoverBody,
    Container,
    Table,
    Badge,
    Alert,
    Collapse,
    Nav,NavItem,NavLink,TabContent,TabPane,
    Modal,ModalBody,ModalFooter,ModalHeader,
    FormGroup,FormFeedback
} from 'reactstrap'; //選擇欲匯入的 reactstrap 組件

function CheckAPI(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [checkStatusFromServer, setCheckStatusFromServer] = useState("");
    const [checkOwnerFromServer, setCheckOwnerFromServer] = useState(false);
    const [checkAddressFromServer, setCheckAddressFromServer] = useState("");
    const [checkDataFromServer, setCheckDataFromServer] = useState([]);
    const [checkMessageFromServer, setCheckMessageFromServer] = useState("");
    const [inputValue, setInputValue] = useState({
        addressByInput: ""
    })

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

    const checkOwnerByServer = async (e) => {
        e.preventDefault();
        try {
            let res = await fetch(`https://dejoy-api-test.herokuapp.com/check?address=${inputValue.addressByInput}&key=58b040abc26a45079cd19751ae6ed799`);
            let resJson = await res.json(); //let res change to json object
            setCheckStatusFromServer(resJson.status);
            setCheckOwnerFromServer(resJson.owner);
            setCheckAddressFromServer(resJson.address);
            setCheckDataFromServer(resJson.data);
            setCheckMessageFromServer(resJson.message);
        }
        catch(err) {
            console.log(err);
        }
    }

    //簡化縮短字串
    const letterSplit = (letter) => {
        let id = letter.split('', 10);
        let forwardId = "";
        for (let i=0; i<10; i++) {
            forwardId = forwardId + id[i];
        }
        forwardId = forwardId.toString();
        forwardId = forwardId + ". . . . . ."
        return <p>{forwardId}</p>
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        console.log({
            checkStatusFromServer,
            checkOwnerFromServer,
            checkAddressFromServer,
            checkDataFromServer,
            checkMessageFromServer
        });
    })

    return (
        <div>
            {permisionByWallet === true
                ?   <div>
                        <Form onSubmit={checkOwnerByServer}>
                            <FormGroup className="position-relative" row>
                                <Col sm={1}></Col>
                                <Label sm={2}>
                                    Wallet Account :
                                </Label>
                                <Col sm={7}>
                                    <Input 
                                        type="search"
                                        invalid
                                        valid
                                        name="address" 
                                        placeholder="0x0000......"
                                        onChange={(e) => setInputValue({addressByInput: e.target.value})}
                                        value={inputValue.addressByInput}
                                    />
                                    {inputValue.addressByInput.length === 42 || inputValue.addressByInput === "" ?
                                        <FormFeedback valid></FormFeedback> :
                                        <FormFeedback invalid="true"> 
                                            invalid address.
                                        </FormFeedback>
                                    }
                                    {checkStatusFromServer === "success"
                                        ?   <FormFeedback valid tooltip>Server connecting success</FormFeedback>
                                        :   <div>
                                                {checkStatusFromServer === "error"
                                                    ?   <FormFeedback invalid="true" tooltip>{checkMessageFromServer}</FormFeedback>
                                                    :   ""
                                                }
                                            </div>
                                            
                                    } 
                                </Col>
                                <Label sm={2}>
                                    <Button color='info' type="submit">CHECK</Button>
                                </Label>
                            </FormGroup> 
                        </Form>

                        <br/>
                        {checkStatusFromServer === "success"
                            ?   <div>
                                    {checkOwnerFromServer === true
                                        ?   <Container>
                                                <Row>
                                                    {
                                                        checkDataFromServer.map((ownerData) => (
                                                            <Col sm="6" md="4" key={ownerData.id}>
                                                                <CardGroup>
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardImg src={ownerData.image_url} alt={ownerData.name}/>
                                                                        </CardHeader>
                                                                        <CardBody>
                                                                            <Table>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th scope="row">名稱 :</th>
                                                                                        <td>{ownerData.name}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th scope="row">類別 :</th>
                                                                                        <td>{ownerData.class}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th scope="row">持有數量 :</th>
                                                                                        <td>{ownerData.quantity}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th scope="row">識別碼 :</th>
                                                                                        <td>{letterSplit(ownerData.id)}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </Table>
                                                                            <CardLink href={`https://testnets.opensea.io/zh-CN/assets/rinkeby/0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656/${ownerData.id}`}>
                                                                                Check {ownerData.name} on OpenSea
                                                                            </CardLink>
                                                                        </CardBody>
                                                                    </Card>
                                                                </CardGroup>
                                                            </Col>
                                                        ))
                                                    }
                                                </Row>
                                            </Container>
                                        :   <Alert color="danger">You don't have any NFT.</Alert>
                                    }
                                </div>
                            :   <Alert color="secondary">data not response</Alert>
                        }
                    </div>
                :   <Alert color="danger">Permission denied</Alert>
            }
        </div>
    );
}

export default CheckAPI;