import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const ReceivedDocuments = ({events}) => {

    if(events == undefined)
        return
    (<div></div>)
    if(events!==null && events!== undefined)
    {
        console.log("events is not undefiend !")
    return (
        <>
        <Card>
        <CardHeader>
            <CardTitle>Documents tranmis</CardTitle>
            {events.map((event) => (
                <div key={event.id}>{event.text} </div>
            ))}
        </CardHeader>
        <CardContent>

        </CardContent>
        </Card>
        </>
    )
}
  }
  
  export default ReceivedDocuments