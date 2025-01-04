'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/86f028d2d3ef4078bbbfc83e062f6106");
import { contractAddress, contractAbi , userAccountAbi} from "@/constants";
import { useWriteContract, useWaitForTransactionReceipt, useAccount , useReadContract} from "wagmi";
import { useState, useEffect} from "react";
import CreateAccount from "./CreateAccount";
import LifeWillAccount from "./LifeWillAccount";
import { Button } from "./ui/button";
import { publicClient } from "@/utils/client";
import { parseAbiItem } from "viem";
import NotConnected from "./NotConnected";

const Lifewill = () => {
  const { address , isConnected} = useAccount();
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const [isManager, setIsManager] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const isRegistred = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "isRegistred",
    args: [address],
    watch: true,
    account : address,
  });

  const createAccount = async () => {
      const tx = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "register",
        account: address,
      });
    };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })
  

  const checkIfManager = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "isManager",
        account : address,
  });

  const fetchAccounts = async () => {
    try {
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: 7412581n, // Bloc de départ
        toBlock: "latest",   // Bloc jusqu'à "latest"
        topics: [
          ethers.id("AccountCreated(address,address)") // Hash du topic de l'événement
        ],
      });
  
      console.log("Logs bruts:", logs);
  
      const iface = new ethers.Interface(contractAbi);
      const decodedLogs = logs.map((log) => {
        const decoded = iface.parseLog(log);
        return {
          creator: decoded.args[0],
          contractAddress: decoded.args[1],
        };
      });
  
      console.log("Logs décodés:", decodedLogs);
  
      const fetchedAccounts = await Promise.all(
        decodedLogs.map(async (log) => {
          // Instanciez un objet Contract pour chaque compte
          const userAccountContract = new ethers.Contract(
            log.contractAddress, // Adresse du contrat
            userAccountAbi,      // ABI du contrat
            provider             // Fournisseur pour lire les données
          );
  
          // Appelez la méthode getIsUnlocked
          const isUnlocked = await userAccountContract.getIsUnlocked();
  
          return { address: log.contractAddress, isUnlocked };
        })
      );
  
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };
  


  const unlockAccount = async (accountAddress) => {
    try {
      await writeContract({
        address: accountAddress,
        abi: userAccountAbi,
        functionName: "setUnlocked",
        args: [true],
        account: address,
      });
      fetchAccounts(); // Refresh accounts after unlocking
    } catch (error) {
      console.error("Error unlocking account:", error);
    }
  };

  useEffect(() => {
      if (checkIfManager.data) {
        fetchAccounts();
      }
  }, [checkIfManager.data, address]);

  if (checkIfManager.data == true) {
    return (
      <div style={{ marginTop: '20px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Manage LifeWill Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.map((account) => (
              <div
                key={account.address}
                style={{
                  marginTop: '4px',
                  padding: '16px',
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  wordBreak: 'break-word',
                }}
              >
                <p>
                  <strong>Account Address:</strong> {account.address} <br />
                  <strong>Is Unlocked:</strong> {account.isUnlocked ? "Yes" : "No"}
                </p>
                {!account.isUnlocked && (
                  <Button onClick={() => unlockAccount(account.address)}>
                    Unlock
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    );
  }

  return (
    <>
      {(isRegistred.data == undefined || isRegistred.data === false || isConnected == false) ? (
        <NotConnected createAccount={createAccount} isConnected ={isConnected}/>
      ) : (
        <LifeWillAccount />
      )}
    </>
  );
};

export default Lifewill;
