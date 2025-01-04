import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useConfig } from "wagmi";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { contractAddress, contractAbi, userAccountAbi } from "@/constants";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { ethers } from "ethers";
import SentDocuments from "@/components/SentDocuments";
import ReceivedDocuments from "@/components/ReceivedDocuments";
import { readContract } from '@wagmi/core';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL);

const LifeWillAccount = ({accounts}) => {
  const [texteATransmettre, setProposalName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [events, setEvents] = useState([]);
  const [userDocuments, setDocuments] = useState([]);
  const { address } = useAccount();
  const config = useConfig();
  let isFetching = false;

  const { writeContract } = useWriteContract();
  const { data: userContractAddress } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getUserAccount",
    account: address,
  });

  const { data: activeIds } = useReadContract({
    address: userContractAddress,
    abi: userAccountAbi,
    functionName: "getActiveDocuments",
    account: address,
    watch: true,
  });

  const addDocument = async () => {
    if (texteATransmettre.length !== 0) {
      writeContract({
        address: String(userContractAddress),
        abi: userAccountAbi,
        functionName: "addDocument",
        args: [receiverAddress, texteATransmettre],
        account: address,
      });
    }
  };

  const removeDocument = async (docId) => {
    console.log("Removing document", docId);
    writeContract({
      address: String(userContractAddress),
      abi: userAccountAbi,
      functionName: "removeDocument",
      args: [docId],
      account: address,
    });
  };
  const getDocumentsFromContract = async (contractAddress) => {
    try {
      let foundDocuments = [];
      const iface = new ethers.Interface(userAccountAbi);
      const logs = await provider.getLogs({
        address: contractAddress.address,
        fromBlock: 7412581n,
        toBlock: "latest",
        topics: [ethers.id("DocumentSent(uint256,string)")],
      });

      for (const logEvent of logs) {
        const decodedLog = iface.parseLog(logEvent);
        const docId = decodedLog.args[0];
  
        try {
          const owner = await readContract(config,{
            address: contractAddress.address,
            abi: userAccountAbi,
            functionName: "ownerOf",
            args: [docId],
            account: address,
          });
  
          if (owner.toLowerCase() === address.toLowerCase()) {
            console.log('adding ',  docId, 'of contract ' , contractAddress.address, 'because ', owner, ' is ' , address);
            foundDocuments.push({
              id: docId, 
              isUnlocked: contractAddress.isUnlocked, 
              address: contractAddress.address 
            });
          }
        } catch (error) {
          console.log(`Document ${docId} a été supprimé ou est inaccessible.`, error);
        }
      }
      return foundDocuments;
    } catch (error) {
      console.error(`Erreur pour le contrat ${contractAddress}:`, error);
      return [];
    }
  };

  const fetchUserReceivedDocuments = async () => {
    if(isFetching)
      return;
    isFetching = true;
    setDocuments([]);
    let userDocuments = [];
    console.log("called for accounts ", accounts);
    for (const account of accounts) {
      const documents = await getDocumentsFromContract(account);
      if(documents)
        userDocuments = [...userDocuments, ...documents];
    }

    setDocuments(userDocuments);
    isFetching = false;
  };

  useEffect(() => {
    setDocuments([]);
    fetchUserReceivedDocuments();
  }, [address]);

  useEffect(() => {
    if (activeIds && userContractAddress) {
      const fetchActiveDocuments = async () => {
        try {
          const activeDocuments = await Promise.all(
            activeIds.map(async (id) => {
            const text = await readContract(config,{
                address: userContractAddress,
                abi: userAccountAbi,
                functionName: "getDocument",
                args: [id],
                account: address,
              });
              return { id, text };
            })
          );
          setEvents(activeDocuments);
        } catch (error) {
          console.error("Error fetching active documents:", error);
        }
      };
      fetchActiveDocuments();
    }
  }, [activeIds, userContractAddress]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Transmettre un document</CardTitle>
          <CardDescription>
            Document qui sera transmis et lisible par le destinataire au moment du
            décès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Texte à transmettre"
            onChange={(e) => setProposalName(e.target.value)}
            value={texteATransmettre}
          />
          <Input
            style={{ marginTop: "20px" }}
            placeholder="Adresse du destinataire"
            onChange={(e) => setReceiverAddress(e.target.value)}
            value={receiverAddress}
          />
          <Button onClick={addDocument} style={{ marginTop: "20px" }}>
            Transmettre
          </Button>
        </CardContent>
      </Card>

      <SentDocuments events={events} onRemoveDocument={removeDocument} />
      <ReceivedDocuments documents={userDocuments} address={address} />
    </div>
  );
};

export default LifeWillAccount;
