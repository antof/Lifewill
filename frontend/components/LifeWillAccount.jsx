import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { contractAddress,contractAbi , userAccountAbi} from "@/constants";
import { useWriteContract, useAccount, useReadContract} from 'wagmi'

const LifeWillAccount = () => {
    const [texteATransmettre, setProposalName] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const { address  } = useAccount();
    

    const {writeContract} = useWriteContract();
    const userContractAddress = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'getUserAccount',
        account:address
      })

    const addDocument = async () => {
        if ((texteATransmettre).length !== 0) 
            {
                console.log("addDocument is called with text leng" + texteATransmettre.length  + "\n" + "addressContract " + String(userContractAddress.data) + 
                "\n receiveradress " + receiverAddress + "\n " + String(userAccountAbi));
                writeContract({
                    address: String(userContractAddress.data),
                    abi: userAccountAbi,
                    functionName: 'addDocument',
                    args: [address],
                    account:address
                })
            }
    }

    useEffect(()=> {userContractAddress.refetch();})

    return (
        <Card>
        <CardHeader>
            <CardTitle>Transmettre un document</CardTitle>
            <CardDescription>Document qui sera transmis et lisible par le destinaire au moment du décès</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Texte à transmettre" onChange={(e) => setProposalName(e.target.value)} value={texteATransmettre} />
            <Input placeholder="Adresse du destinataire" onChange={(e) => setReceiverAddress(e.target.value)} value={receiverAddress} />
            <Button onClick={addDocument}>Transmettre </Button>
        </CardContent>
        <CardFooter>
            <p>the user contract address is {String(userContractAddress.data)}</p>
        </CardFooter>
        </Card>
    )
  }
  
  export default LifeWillAccount