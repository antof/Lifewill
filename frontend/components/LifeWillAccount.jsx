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
import { publicClient } from "@/utils/client"
import { parseAbiItem } from "viem"
import ReceivedDocuments from "@/components/ReceivedDocuments";


const LifeWillAccount = () => {
    const [texteATransmettre, setProposalName] = useState('')
    const [receiverAddress, setReceiverAddress] = useState('')
    const [events, setEvents] = useState([])
    const [isEventsSet, SetIsEventsSet] = useState(false)
    const { address  } = useAccount()
    

    const {writeContract} = useWriteContract();
    const {data: userContractAddress, isSuccess, refetch} = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'getUserAccount',
        account:address
      })

    const addDocument = async () => {
        if ((texteATransmettre).length !== 0) 
            {
                console.log("addDocument is called with text leng" + texteATransmettre.length  + "\n" + "addressContract " + String(userContractAddress) + 
                "\n receiveradress " + receiverAddress + "\n " + String(userAccountAbi));
                writeContract({
                    address: String(userContractAddress),
                    abi: userAccountAbi,
                    functionName: 'addDocument',
                    args: [address,texteATransmettre],
                    account:address
                })
            }
    }

    const getEvents = async() => {
        const sendEvents = await publicClient.getLogs({
          address: userContractAddress,
          event: parseAbiItem('event DocumentSent(uint256 docId, string text)'),
          fromBlock: 0n,
          toBlock: 'latest'
        })
        const combinedEvents = sendEvents.map((event) => ({
            type: 'send',
            id: event.args.docId,
            text: event.args.text,
            blockNumber: Number(event.blockNumber)}
        ))
        setEvents(()=> combinedEvents);
        /*const removeEvents = await publicClient.getLogs({
          address: userContractAddress,
          event: parseAbiItem('event DocumentRemoved(uint256 docId)'),
          fromBlock: 0n,
          toBlock: 'latest'
        })
    
        const combinedEvents = depositEvents.map((event) => ({
          type: 'Deposit',
          address: event.args.account,
          amount: event.args.amount,
          blockNumber: Number(event.blockNumber)
        })).concat(withdrawEvents.map((event) => ({
          type: 'Withdraw',
          address: event.args.account,
          amount: event.args.amount,
          blockNumber: Number(event.blockNumber)
        })))
    
        combinedEvents.sort(function(a,b) {
          return b.blockNumber - a.blockNumber
        })*/

    }
    
    useEffect(()=> {
        refetch();
        const getAllEvents = async() => {
            if(address !== 'undefined' && userContractAddress!== undefined && isEventsSet == false) {
              console.log("is sucess !");
              SetIsEventsSet(true);
              await getEvents();
            }
          }
          getAllEvents();
        }),[]

    return (
        <div>
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
        </Card>

        <ReceivedDocuments events = {events}/>
        </div>
    )
  }
  
  export default LifeWillAccount