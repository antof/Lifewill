import { Button } from "@/components/ui/button";
const CreateAccount = ({createAccount}) => {
    return (
        <div className="flex items-center">
            <Button onClick={createAccount} className="hover:bg-gray-600 bg-gray-700 text-white">Create Account</Button>
        </div>
    )
  }
  
  export default CreateAccount