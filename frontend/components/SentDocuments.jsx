import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "./ui/button";

const SentDocuments = ({ events, onRemoveDocument }) => {
  if (events === undefined)
      return <div></div>;

  if (events !== null && events !== undefined) {
      return (
          <>
              <Card style={{ marginTop: '20px' }}>
                  <CardHeader>
                      <CardTitle>Documents transmis</CardTitle>
                      <ul>
                          {events.map((event) => (
                              <li
                                  style={{
                                      marginTop: '4px',
                                      padding: '16px',
                                      border: '2px solid #007bff', // Bordure bleue
                                      borderRadius: '8px',
                                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                      wordBreak: 'break-word',
                                  }}
                                  key={event.id}
                              >
                                  <p>
                                      <strong>Texte:</strong> {event.text}
                                  </p>
                                  <Button onClick={() => onRemoveDocument(event.id)}>Supprimer</Button>
                              </li>
                          ))}
                      </ul>
                  </CardHeader>
                  <CardContent></CardContent>
              </Card>
          </>
      );
  }
};

export default SentDocuments;
