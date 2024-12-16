'use client';

import Lifewill from "@/components/Lifewill";
import NotConnected from "@/components/NotConnected";

import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Lifewill />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
