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

import { contractAddress, contractAbi , userAccountAbi} from "@/constants";
import { useWriteContract, useWaitForTransactionReceipt, useAccount , useReadContract} from "wagmi";
import { useState, useEffect} from "react";
import CreateAccount from "./CreateAccount";
import LifeWillAccount from "./LifeWillAccount";
import { Button } from "./ui/button";
import NotConnected from "./NotConnected";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_URL);

let isFetchingAccount = false;

const Lifewill = () => {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract } = useWriteContract();
  const [accounts, setAccounts] = useState([]);
  const [isRegistred, setIsRegistred] = useState(false);

  const createAccount = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "register",
        account: address,
      });
    } catch (error) {
      console.error("Erreur lors de la création du compte :", error);
    }
  };
  
  const checkIfManager = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isManager",
    account: address,
  });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchAccounts = async () => {
  if(isFetchingAccount)
    return;
  isFetchingAccount = true;
  try {
    const logs = await provider.getLogs({
      address: contractAddress,
      fromBlock: 7412581n, // Bloc de départ
      toBlock: "latest",   // Bloc jusqu'à "latest"
      topics: [
        ethers.id("AccountCreated(address,address)") // Hash du topic de l'événement
      ],
    });

    const iface = new ethers.Interface(contractAbi);
    const decodedLogs = logs.map((log) => {
      const decoded = iface.parseLog(log);
      return {
        creator: decoded.args[0],
        contractAddress: decoded.args[1],
      };
    });

  const fetchedAccounts = [];
    
    // Using for...of to allow async/await with delay
    for (const log of decodedLogs) {
      // Instanciez un objet Contract pour chaque compte
      const userAccountContract = new ethers.Contract(
        log.contractAddress, // Adresse du contrat
        userAccountAbi,      // ABI du contrat
        provider             // Fournisseur pour lire les données
      );
      // Ajoutez un délai entre chaque requête
      await delay(300);  // Délai de 500ms entre chaque appel

      // Appelez la méthode getIsUnlocked
      const isUnlocked = await userAccountContract.getIsUnlocked();

      // Ajouter les informations dans le tableau
      fetchedAccounts.push({ address: log.contractAddress, isUnlocked, creator: log.creator });
    }

    setAccounts(fetchedAccounts.reverse());
    isFetchingAccount = false;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    isFetchingAccount = false;
  }
  isFetchingAccount = false;
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
    if(!contractAddress)
      return;

   // Créer une instance du contrat
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);
  // Écouter l'événement "AccountCreated"
  const listener = (creator, accountAddress, event) => {
    console.log("CALLED !");
    fetchAccounts(); // Refresh accounts after
  };

  // Ajouter le listener pour l'événement "AccountCreated"
  contract.on("AccountCreated", listener);

  // Nettoyer l'écouteur lorsque le composant est démonté ou que l'adresse change
  return () => {
    contract.off("AccountCreated", listener);
  };
  },[contractAddress])
  
  useEffect(() => {

      if (checkIfManager.data  == true || address!=undefined) {
        fetchAccounts();
      }

  }, [checkIfManager.data, address]);

  useEffect(() => {
    if(address!=undefined)
    {
      const creatorMatch = accounts.some((account) => account.creator === address);
      setIsRegistred(creatorMatch);
    }
}, [accounts,address]);

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
                  <strong>Creator Address:</strong> {account.creator}<br />
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
      {((isRegistred == undefined || isRegistred === false || isConnected == false)) ? (
        <NotConnected createAccount={createAccount} isConnected ={isConnected}/>
      ) : (
        <LifeWillAccount accounts = {accounts}/>
      )}
    </>
  );
};

export default Lifewill;
