import { useState, useEffect, useCallback } from 'react';
import { ethers, utils } from 'ethers';
import * as Web3 from 'web3';
import { OpenSeaSDK, Network } from 'opensea-js';
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

function AirDropBySingleTrnsfer(props) {
    const [permisionByWallet, setPermission] = useState(false); //獲取權限才能使用
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [customerAddress, setCustomerAddress] = useState(null);
    const [error, setError] = useState(null);
    const [singleDataFromOpensea, setSingleDataFromOpensea] = useState({});
    const [fetchDataFromOpenseaStatus, setFetchDataFromOpenseaStatus] = useState("");
    const [inputValue, setInputValue] = useState({
        addressByInput: ""
    })
    const [inputValueByTokenAddress, setInputValueByTokenAddress] = useState({tokenAddress: ""});
    const [inputValueBtTokenId, setInputValueBtTokenId] = useState({tokenId: ""});
    const [JSONDataFromCSV, setJSONDataFromCSV] = useState([]);
    const [airdropStatus, setAirDropStatus] = useState("");

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

    //獲取合約資訊
    const getSingleAssetFromOpensea = async (event) => {
        event.preventDefault();
        try {
            if (permisionByWallet === true) {
                if (window.ethereum) {
                    const openseaSDK = new OpenSeaSDK(window.ethereum, {
                        networkName: Network.Rinkeby,
                        apiKey: "",
                    });
                    const collectionBySingle = {
                        tokenAddress: inputValueByTokenAddress.tokenAddress,
                        tokenId: inputValueBtTokenId.tokenId,
                    };
                    
                    const res = await openseaSDK.api.getAsset(collectionBySingle);
                    setSingleDataFromOpensea(res);
                    setFetchDataFromOpenseaStatus("Success");
                    console.log("Data update from contract completly.");
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

    const airdropOneByOne = async (event) => {
        event.preventDefault();
        try {
            if (permisionByWallet === true) {
                if (window.ethereum) {
                    const openseaSDK = new OpenSeaSDK(window.ethereum, {
                        networkName: Network.Rinkeby,
                        apiKey: "",
                    });

                    //把輸入的 CSV 格式轉成 JSON 格式
                    CSVToJSON(inputValue.addressByInput);
                    //JSON 型態 string 轉 object
                    let airdropAddressList = JSON.parse(JSONDataFromCSV);
                    //依輸入的地址數量進行批量空投
                    for (let i=0; i<airdropAddressList.length ;i++) {
                        const transactionHash = await openseaSDK.transfer({
                            asset: {
                                tokenId: inputValueBtTokenId.tokenId,
                                tokenAddress: inputValueByTokenAddress.tokenAddress,
                                schemaName: 'ERC1155'
                            },
                            fromAddress: customerAddress,
                            toAddress: airdropAddressList[i].address,
                            quantity: airdropAddressList[i].amount,
                        })
                        console.log(transactionHash);
                    }
                    console.log("AirDrop Completed");
                    setAirDropStatus("AirDrop Completed");
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

    const CSVToJSON = async (list) => {
        try {
            const csv = "address,amount\n" + list;
            //fs.writeFileSync('./CSV_file.csv', csvFromInput);
            //const csv = fs.readFileSync("./CSV_file.csv")

            // Convert the data to String and
            // split it in an array
            var array = csv.split("\n");
            // All the rows of the CSV will be
            // converted to JSON objects which
            // will be added to result in an array
            let result = [];

            // The array[0] contains all the
            // header columns so we store them
            // in headers array
            let headers = array[0].split(",");

            // Since headers are separated, we
            // need to traverse remaining n-1 rows.
            for (let i = 1; i < array.length; i++) {
                let obj = {};

                // Create an empty object to later add
                // values of the current row to it
                // Declare string str as current array
                // value to change the delimiter and
                // store the generated string in a new
                // string s
                let str = array[i];
                let s = '';

                // By Default, we get the comma separated
                // values of a cell in quotes " " so we
                // use flag to keep track of quotes and
                // split the string accordingly
                // If we encounter opening quote (")
                // then we keep commas as it is otherwise
                // we replace them with pipe |
                // We keep adding the characters we
                // traverse to a String s
                let flag = 0;
                for (let ch of str) {
                    if (ch === '"' && flag === 0) {
                        flag = 1;
                    }
                    else if (ch === '"' && flag == 1) flag = 0;
                    if (ch === ',' && flag === 0) ch = '|';
                    if (ch !== '"') s += ch;
                }

                // Split the string using pipe delimiter |
                // and store the values in a properties array
                let properties = s.split("|");

                // For each header, if the value contains
                // multiple comma separated data, then we
                // store it in the form of array otherwise
                // directly the value is stored
                for (let j in headers) {
                    if (properties[j].includes(",")) {
                        obj[headers[j]] = properties[j]
                            .split(",").map(item => item.trim())
                    }
                    else obj[headers[j]] = properties[j];
                }

                // Add the generated object to our
                // result array
                result.push(obj);
            }

            // Convert the resultant array to json and
            // generate the JSON output file.
            let json = JSON.stringify(result);
            console.log(json);
            setJSONDataFromCSV(json);
        }
        catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        
    })
    
    return (
        <div>
            {permisionByWallet === true
                ?   <div>
                        <Container>
                            <Row>
                                <Col sm="6" md="2" />
                                <Col sm="6" md="8">
                                    <Form>
                                        <Row>
                                            <Col sm="6" md="2">
                                                <h6>Token address</h6>
                                            </Col>
                                        </Row>
                                        <Input
                                            type='search'
                                            name='token-address'
                                            placeholder='your token address'
                                            onChange={(e) => setInputValueByTokenAddress({tokenAddress: e.target.value})}
                                            value={inputValueByTokenAddress.tokenAddress}
                                        />
                                        <br />
                                        <Row>
                                            <Col sm="6" md="2">
                                                <h6>Token id&emsp;&emsp;&ensp;</h6>
                                            </Col>
                                        </Row>
                                        <Input
                                            type='search'
                                            name='token-id'
                                            placeholder='your token id'
                                            onChange={(e) => setInputValueBtTokenId({tokenId: e.target.value})}
                                            value={inputValueBtTokenId.tokenId}
                                        />
                                        <br />
                                        <Row>
                                            <Col sm="6" md="4" />
                                            <Col sm="6" md="4">
                                                <Button color='secondary' onClick={getSingleAssetFromOpensea}>Load Token</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>
                            <br />
                            {fetchDataFromOpenseaStatus === "Success"
                                ?   <div>
                                        <Row>
                                            <Col sm="6" md="4" />
                                            <Col sm="6" md="4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardImg src={singleDataFromOpensea.imageUrl} alt={singleDataFromOpensea.name} />
                                                    </CardHeader>
                                                    <CardBody>
                                                        <CardTitle>請輸入 CSV 格式空投名單</CardTitle>
                                                        <Form>
                                                            <Input 
                                                                type="textarea"
                                                                name="address" 
                                                                bsSize='sm'
                                                                placeholder="格式:
                                                                0xe6Cd8417A36B185636A5F97B8E33E7c244439e72,1
                                                                0xA25F40ca8FE70312720A36996D29dC88FEf98511,1"
                                                                onChange={(e) => setInputValue({addressByInput: e.target.value})}
                                                                value={inputValue.addressByInput}
                                                            />
                                                            <Button color='danger' onClick={airdropOneByOne}>空投</Button>
                                                        </Form>
                                                    </CardBody>
                                                    {airdropStatus !== ""
                                                        ?   <Alert color='success'>{airdropStatus}</Alert>
                                                        :   ""
                                                    }
                                                </Card>
                                            </Col>
                                            <Col sm="6" md="4" />
                                        </Row>
                                    </div>
                                :   <Alert color='danger'>Please input your token address and id.</Alert>
                            }
                        </Container>
                    </div>
                :   <Alert color='danger'>Permission denied</Alert>
            }
        </div>
    );
}

export default AirDropBySingleTrnsfer;