import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [theme, setTheme] = useState("light");
  const [waves, setWaves] = useState(null);
  const [allWaves, setAllWaves] = useState([]);
  const [mining, setMining] = useState(false);

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x8A552FE46400E17D550533b553E839f1B7aE2001";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      /*
       * First make sure we have access to window.ethereum
       */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Install metamask and make sure you are logged in!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getCount();
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Install MetaMask wallet and login!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getCount();
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const getCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaves(count.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave("this is a message");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <React.Suspense fallback={<h1>Loading</h1>}>
      <div className={`mainContainer-${theme}`}>
        <button
          style={{ fontSize: 30 }}
          className="btn-clear"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🔦" : "💡"}
        </button>
        <div className="dataContainer">
          <div className="greeting">
            <div className="header">👋 Hey there!</div>

            <div className={`bio-${theme}`}>
              I am Sailesh and I just hopped on the buildspace ship! Connect
              your Ethereum wallet and wave at me!
            </div>

            <button className={`waveButton-${theme}`} onClick={wave}>
              Wave at Me
            </button>
            {/*
             * If there is no currentAccount render this button
             */}
            {!currentAccount && (
              <button className={`waveButton-${theme}`} onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
            {currentAccount && (
              <p className={`wave-counter-${theme}`}>No. of waves: {waves}</p>
            )}
            {allWaves.map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "OldLace",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </React.Suspense>
  );
};

export default App;
