import { type } from "@testing-library/user-event/dist/type";
import React, { Component, useEffect, useState } from "react";
import { ReactDOM } from "react";
// 匯入 bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
//選擇欲匯入的 reactstrap 組件
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
    Modal,ModalBody,ModalFooter,ModalHeader
} from 'reactstrap';
import { JsonToExcel } from "react-json-excel";

function OwnerAPI(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [ownersStatusFromServer, setOwnersStatusFromServer] = useState("");
    const [ownersDataFromServer, setOwnersDataFromServer] = useState([]);
    const [ownersMessageFromServer, setOwnersMessageFromServer] = useState("");
    const [modal, setModal] = useState(false);
    const [unmountOnClose, setUnmountOnClose] = useState(true);
    const [inputValue, setInputValue] = useState({
        tokenSelector: ""
    });

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

    const detDataFromServer = async () => {
        try {
            let res = await fetch("https://dejoy-api-test.herokuapp.com/owners?key=58b040abc26a45079cd19751ae6ed799", {
                method: "GET",
                header: new Headers({
                    'Content-Type': 'application/json'
                }),
                //body: JSON.stringify({formPostByCheck: this.state.formPostByCheck}),
            });

            let resJson = await res.json(); //let res change to json object
            setOwnersStatusFromServer(resJson.status);
            setOwnersDataFromServer(resJson.data);
            setOwnersMessageFromServer(resJson.message);
        }
        catch(err) {
            console.log(err);
        }
    }

    const changeUnmountOnClose = (e) => {
        let value = e.target.value;
        setUnmountOnClose(JSON.parse(value));
    }
    const setModal_list = () => {
        setModal(!modal);
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
        console.log({ownersStatusFromServer, ownersDataFromServer, ownersMessageFromServer});
    })

    return (
        <div>
            {permisionByWallet === true
                ?   <div>
                        <Button onClick={()=> {detDataFromServer();}}>請求後台資料</Button>
                        {ownersStatusFromServer === "success"
                            ?   <Container>
                                    <Row>
                                        <Col sm="6" md="4" />
                                        <Col sm="6" md="4">
                                            <Card>
                                                <CardBody>
                                                    <Form>
                                                        <Label>
                                                            選擇 NFT 等級
                                                        </Label>
                                                        <Input
                                                            id="token-select"
                                                            name="select"
                                                            type="select"
                                                            onChange={(e) => setInputValue({tokenSelector: e.target.value})}
                                                            value={inputValue.tokenSelector}
                                                        >
                                                            <option>請選擇NFT...</option>
                                                            <option>音寶</option>
                                                            <option>因佩斯</option>
                                                            <option>球球</option>
                                                        </Input>
                                                    </Form>
                                                    <Button color="primary" onClick={setModal_list}>open</Button>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                    {inputValue.tokenSelector === "音寶"
                                        ?   <Modal isOpen={modal} toggle={setModal_list} unmountOnClose={unmountOnClose} backdrop={'static'}>
                                                <Form>
                                                    <ModalHeader toggle={setModal_list}>音寶</ModalHeader>
                                                    <ModalBody>
                                                        <Card>
                                                            <CardImg alt="音寶" src={ownersDataFromServer[0].image_url}/>
                                                            <CardBody>
                                                                <Table>
                                                                    <tbody>
                                                                        <tr>
                                                                            <th scope="row"> 名字 </th>
                                                                            <td>{ownersDataFromServer[0].name}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th scope="row"> 識別碼 </th>
                                                                            <td>{letterSplit(ownersDataFromServer[0].id)}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th scope="row"> 類別 </th>
                                                                            <td>{ownersDataFromServer[0].class}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </Table>
                                                                <Alert>
                                                                    點擊下載地址清單 Excel 檔案 {"==>>"}{' '}
                                                                    <JsonToExcel
                                                                        className='class-name-for-style'
                                                                        style={{padding: "5px"}}
                                                                        text="Excel download"
                                                                        fileName="sample-file"
                                                                        data={ownersDataFromServer[0].owners}
                                                                        fields={
                                                                            {
                                                                                "address": "Address",
                                                                                "quantity": "Quantity"
                                                                            }
                                                                        }
                                                                    />
                                                                </Alert>
                                                            </CardBody>
                                                        </Card>                        
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="secondary" onClick={setModal_list}>確認</Button>
                                                    </ModalFooter>
                                                </Form>
                                            </Modal>
                                            
                                        :   <div>
                                                {inputValue.tokenSelector === "因佩斯"
                                                    ?   <Modal isOpen={modal} toggle={setModal_list} unmountOnClose={unmountOnClose} backdrop={'static'}>
                                                            <Form>
                                                                <ModalHeader toggle={setModal_list}>因佩斯</ModalHeader>
                                                                <ModalBody>
                                                                    <Card>
                                                                        <CardImg alt="因佩斯" src={ownersDataFromServer[1].image_url}/>
                                                                        <CardBody>
                                                                            <Table>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th scope="row"> 名字 </th>
                                                                                        <td>{ownersDataFromServer[1].name}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th scope="row"> 識別碼 </th>
                                                                                        <td>{letterSplit(ownersDataFromServer[1].id)}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th scope="row"> 類別 </th>
                                                                                        <td>{ownersDataFromServer[1].class}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </Table>
                                                                            <Alert>
                                                                                點擊下載地址清單 Excel 檔案 {"==>>"}{' '}
                                                                                <JsonToExcel
                                                                                    className='class-name-for-style'
                                                                                    style={{padding: "5px"}}
                                                                                    text="Excel download"
                                                                                    fileName="sample-file"
                                                                                    data={ownersDataFromServer[1].owners}
                                                                                    fields={
                                                                                        {
                                                                                            "address": "Address",
                                                                                            "quantity": "Quantity"
                                                                                        }
                                                                                    }
                                                                                />
                                                                            </Alert>
                                                                        </CardBody>
                                                                    </Card>                               
                                                                </ModalBody>
                                                                <ModalFooter>
                                                                    <Button color="secondary" onClick={setModal_list}>確認</Button>
                                                                </ModalFooter>
                                                            </Form>
                                                        </Modal>
                                                    :   <div>
                                                            {inputValue.tokenSelector === "球球"
                                                                ?   <Modal isOpen={modal} toggle={setModal_list} unmountOnClose={unmountOnClose} backdrop={'static'}>
                                                                        <Form>
                                                                            <ModalHeader toggle={setModal_list}>球球</ModalHeader>
                                                                            <ModalBody>
                                                                                <Card>
                                                                                    <CardImg alt="球球" src={ownersDataFromServer[2].image_url}/>
                                                                                    <CardBody>
                                                                                        <Table>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <th scope="row"> 名字 </th>
                                                                                                    <td>{ownersDataFromServer[2].name}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <th scope="row"> 識別碼 </th>
                                                                                                    <td>{letterSplit(ownersDataFromServer[2].id)}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <th scope="row"> 類別 </th>
                                                                                                    <td>{ownersDataFromServer[2].class}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </Table>
                                                                                        <Alert>
                                                                                            點擊下載地址清單 Excel 檔案 {"==>>"}{' '}
                                                                                            <JsonToExcel
                                                                                                className='class-name-for-style'
                                                                                                style={{padding: "5px"}}
                                                                                                text="Excel download"
                                                                                                fileName="sample-file"
                                                                                                data={ownersDataFromServer[2].owners}
                                                                                                fields={
                                                                                                    {
                                                                                                        "address": "Address",
                                                                                                        "quantity": "Quantity"
                                                                                                    }
                                                                                                }
                                                                                            />
                                                                                        </Alert>
                                                                                    </CardBody>
                                                                                </Card>                               
                                                                            </ModalBody>
                                                                            <ModalFooter>
                                                                                <Button color="secondary" onClick={setModal_list}>確認</Button>
                                                                            </ModalFooter>
                                                                        </Form>
                                                                    </Modal>
                                                                :   ""
                                                            }
                                                        </div>
                                                }
                                            </div>
                                    }
                                </Container>
                            :   <div>
                                    {ownersStatusFromServer === "error"
                                        ?   <Alert color="danger">{ownersMessageFromServer}</Alert>
                                        :   <Alert color="secondary">data not response</Alert>
                                    }
                                    
                                </div>
                        }
                    </div>
                :   <Alert color="danger">Permission denied</Alert>
            }
        </div>
    );
}

export default OwnerAPI;