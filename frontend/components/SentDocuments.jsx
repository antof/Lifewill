import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { Button } from "./ui/button";


const SentDocuments = ({events, onRemoveDocument}) => {

    if(events == undefined)
        return
    (<div></div>)
    if(events!==null && events!== undefined)
    {
    return (
        <>
        <Card>
        <CardHeader>
            <CardTitle>Documents tranmis</CardTitle>
            <ul>
        {events.map((event) => (
          <li key={event.id}>
            <p>
              <strong>ID:</strong> {String(event.id)} <br />
              <strong>Texte:</strong> {event.text}
            </p>
            <Button onClick={() => onRemoveDocument(event.id)}>Supprimer</Button>
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
  
  export default SentDocuments