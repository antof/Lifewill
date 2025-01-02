import { Button } from "@/components/ui/button";

const CreateAccount = ({ createAccount }) => {
  return (
    <Button
        onClick={createAccount}
        className="bg-[#34495E] hover:bg-[#2C3E50] text-white py-3 px-8 rounded-full text-xl shadow-md transition-transform transform hover:scale-105">
        Create Account
    </Button>
  );
};

export default CreateAccount;
