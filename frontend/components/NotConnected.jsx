import Connection from "./Connection";
import CreateAccount from "./CreateAccount";

const NotConnected = ({createAccount, isConnected}) => {
  return (
    <div className="h-full flex flex-col justify-center items-center w-full">
      <img src="/images/Logo.png" alt="Logo" />
      <div className="text-center">
      {/* Titre principal */}
      <h1 className="text-6xl font-bold text-white">
        Lifewill
      </h1>
      {/* Sous-titre */}
      <p className="text-xl text-gray-300 mt-4">
        Keeps your assets alive
      </p>
    </div>
    {isConnected? <CreateAccount createAccount={createAccount}/> : <Connection/>
  }

    </div>
  );
};

export default NotConnected;
