import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "./ui/button";
import { useState } from "react";
import { publicClient } from "@/utils/client";
import { userAccountAbi } from "@/constants";

const ReceivedDocuments = ({ documents, address }) => {
  const [decryptedText, setDecryptedText] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const readDocument = async (contractAddress, docId) => {
    try {
      const text = await publicClient.readContract({
        address: contractAddress,
        abi: userAccountAbi,
        functionName: "getDocument",
        args: [docId],
        account: address,
      });
      setDecryptedText(text);
      setShowPopup(true);
    } catch (error) {
      console.error("Erreur lors de la lecture du document :", error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setDecryptedText(null);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Documents reçus</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.map((doc) => (
            <div                                   style={{
              marginTop: '4px',
              padding: '16px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              wordBreak: 'break-word',
          }} key={doc.id}>
              <p>****</p>
              {doc.isUnlocked && (
                <Button
                  onClick={() => readDocument(doc.contractAddress, doc.id)}
                >
                  Lire
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <h4 >Texte déchiffré :</h4>
            <p style = {{wordBreak: 'break-word'}}>{decryptedText}</p>
            <Button onClick={closePopup} style={{ marginTop: "1rem" }}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedDocuments;
