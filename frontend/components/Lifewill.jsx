'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
  

  const checkIfManager = async () => {
    try {
      console.log("checking if manager");
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "isManager",
        account : address,
      });
      setIsManager(result);
    } catch (error) {
      console.error("Error checking if address is manager:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const logs = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem("event AccountCreated(address creator, address contractAddress)"),
            fromBlock: 0n,
            toBlock: "latest",
            account : address,
          });

      const fetchedAccounts = await Promise.all(
        logs.map(async (log) => {
          console.log("checking contract " + log.args.contractAddress);
          const contractAddress = log.args.contractAddress;
          const isUnlocked = await publicClient.readContract({
            address: contractAddress,
            abi: userAccountAbi,
            functionName: "getIsUnlocked",
            account : address,
          });
          return { address: contractAddress, isUnlocked };
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
    isRegistred.refetch();
      checkIfManager();
      if (isManager) {
        fetchAccounts();
      }
  }, [address, isManager]);

  if (isManager) {
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
      {(isRegistred.data === false || isConnected == false) ? (
        <NotConnected createAccount={createAccount} isConnected ={isConnected}/>
      ) : (
        <LifeWillAccount />
      )}
    </>
  );
};

export default Lifewill;
