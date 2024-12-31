import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { Button } from "./ui/button";


const ReceivedDocuments = ({documents}) => {

    if(documents == undefined)
        return
    (<div></div>)
    if(documents!==null && documents!== undefined)
    {
    return (
        <>
        <Card>
        <CardHeader>
            <CardTitle>Documents reçus</CardTitle>
            <ul>
        {documents.map((document) => (
          <li key={document.text}>
            <p>
              <strong>ID:</strong> {String(document.id)} <br />
              <strong>Texte:</strong> {document.text}
            </p>
          </li>
        ))}
      </ul>
        </CardHeader>
        <CardContent>

        </CardContent>
        </Card>
        </>
    )
}
  }
  
  export default ReceivedDocuments