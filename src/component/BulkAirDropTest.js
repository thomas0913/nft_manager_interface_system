import React, { Component, useEffect, useState } from "react";
import { OpenSeaSDK, Network } from "opensea-js";
import * as Web3 from 'web3';
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
import { ethers } from "ethers";

function BulkAirDropTest() {
    const [inputValue, setInputValue] = useState({
        addressList: []
    });
    const [dropStatus, setDropStatus] = useState("");
    const [error, setError] = useState(null);

    //build a new web3 provider contect
    //const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/c25aeca2be24404e89e77e7d2a14785c");
    //create and useing OpenSeaSDK from provider
    
    
    const doBulkAirDrop = async (event) => {
        event.preventDefault();
        try {
            
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const openseaSDK = new OpenSeaSDK(provider, {
                        networkName: Network.Rinkeby,
                    })
                    const signer = provider.getSigner();
                    //const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

                    /*
                    const OpenSeaAsset = await openseaSDK.api.getAsset({
                        tokenAddress,
                        tokenId,
                    })
                    */
                    //console.log(OpenSeaAsset)
                    //const txn = await nftContract.mint(customerAddress, inputValue.idTarget, inputValue.mintAmountTarget);
                    console.log("NFT AirDropping...");
                    setDropStatus("⌛AirDropping...");
                    //await txn.wait();
                    //console.log("NFT AirDropping", txn.hash);
                    setDropStatus("✅ AirDropped");
                }
                else {
                    setError("Please install a MetaMask wallet to use our Dapp web.");
                    console.log("No MetaMask detected");
                }
                
        }
        catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        console.log(inputValue.addressList);
    })

    return (
        <div>
            <Row>
                <Alert>this is testing for BulkAirDropTest</Alert>
            </Row>
            <Form>
                <Input
                    type="textarea"
                    className="input-drop"
                    onChange={(e) => setInputValue({addressList: e.target.value})}
                    name="drop"
                    placeholder="[..., 0x01, 0x02]"
                    value={inputValue.addressList}
                />
                <Button color="danger" onClick={doBulkAirDrop}>Drop test</Button>
            </Form>
        </div>
    );
}

export default BulkAirDropTest;