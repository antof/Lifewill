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

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/86f028d2d3ef4078bbbfc83e062f6106");

const LifeWillAccount = () => {
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

  const getIsUnlocked = async (contractAddress) => {
    try {
      const contract = new ethers.Contract(contractAddress, userAccountAbi, provider);
      const isUnlocked = await contract.getIsUnlocked();
      return isUnlocked;
    } catch (error) {
      console.error(`Erreur lors de la vérification de isUnlocked pour ${contractAddress}:`, error);
      return false;
    }
  };

  const getDocumentsFromContract = async (contractAddress) => {
    try {
      const isUnlocked = await getIsUnlocked(contractAddress);

      const iface = new ethers.Interface(userAccountAbi);
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: 7412581n,
        toBlock: "latest",
        topics: [ethers.id("DocumentSent(uint256,string)")],
      });

      for (const logEvent of logs) {
        const decodedLog = iface.parseLog(logEvent);
        const docId = decodedLog.args[0];
  
        try {
          const owner = await readContract(config,{
            address: contractAddress,
            abi: userAccountAbi,
            functionName: "ownerOf",
            args: [docId],
            account: address,
          });
  
          if (owner.toLowerCase() === address.toLowerCase()) {
            console.log('adding ',  docId, 'of contract ' , contractAddress, 'because ', owner, ' is ' , address)
            userDocuments.push({ id: docId, isUnlocked, contractAddress });
          }
        } catch (error) {
          console.log(`Document ${docId} a été supprimé ou est inaccessible.`);
        }
      }

      return userDocuments;
    } catch (error) {
      console.error(`Erreur pour le contrat ${contractAddress}:`, error);
      return [];
    }
  };

  const fetchAllAccounts = async () => {
    const iface = new ethers.Interface(contractAbi);
    const logs = await provider.getLogs({
      address: contractAddress,
      fromBlock: 7412581n,
      toBlock: "latest",
      topics: [ethers.id("AccountCreated(address,address)")],
    });

    return logs.map((log) => {
      const decodedLog = iface.parseLog(log);
      return decodedLog.args.contractAddress;
    });
  };

  const fetchUserReceivedDocuments = async () => {
    if(isFetching)
      return;
    isFetching = true;
    const allAccounts = await fetchAllAccounts();
    let userDocuments = [];

    for (const account of allAccounts) {
      const documents = await getDocumentsFromContract(account);
      userDocuments = [...userDocuments, ...documents];
    }

    setDocuments(userDocuments);
    isFetching = false;
  };

  useEffect(() => {
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
