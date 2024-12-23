'use client';
import { contractAddress, contractAbi } from "@/constants"
import { useWriteContract, useWaitForTransactionReceipt, useAccount ,useReadContract, BaseError} from 'wagmi'
import { useState, useEffect } from "react"
import CreateAccount from "./CreateAccount";
import LifeWillAccount from "./LifeWillAccount";

const Lifewill = () => {
  const { address  } = useAccount();
  const { writeContract } = useWriteContract()
  const result = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: 'isRegistred',
    args : [address],
    watch:true
  })

  useEffect(()=>{
    result.refetch();}
  )


const createAccount = async() => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'register',
            account: address
        }) 
}

return (
    <>
    {result.data == false ?
      <CreateAccount createAccount={createAccount}/> : <LifeWillAccount/>}
    </>
)
}

export default Lifewill