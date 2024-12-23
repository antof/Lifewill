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
    const { address  } = useAccount();
    

    const {writeContract} = useWriteContract();
    const userContractAddress = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'getUserAccount',
        account:address
      })

    const addDocument = async () => {
        console.log("addDocument is called");
        if ((texteATransmettre).length !== 0) 
            {
                writeContract({
                    address: userContractAddress,
                    abi: userAccountAbi,
                    functionName: 'addProposal',
                    args: [proposalName]
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
            <Button onClick={addDocument}>Transmettre </Button>
        </CardContent>
        <CardFooter>
            <p>the user contract address is {String(userContractAddress.data)}</p>
        </CardFooter>
        </Card>
    )
  }
  
  export default LifeWillAccount