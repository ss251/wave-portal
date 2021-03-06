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
  const [message, setMessage] = useState("");
  const [mining, setMining] = useState(null);

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xCb555bb1A9D319bc6143eF3D93dEFFA1ceD06b57";

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
    if (message === "") {
      alert("Please enter a message");
    } else {
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
          const waveTxn = await wavePortalContract.wave(message, {
            gasLimit: 300000,
          });
          setMining("??? ??? ???...");
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          setMining(null);
          console.log("Mined -- ", waveTxn.hash);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          setWaves(count.toNumber());
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
        setMining(null);
        alert(error);
      }
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

  const handleChange = (event) => {
    setMessage(event.target.value);
    setMining(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
      getCount();
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Suspense fallback={<h1>Loading</h1>}>
      <div className={`mainContainer-${theme}`}>
        <button
          style={{ fontSize: 30 }}
          className="btn-clear"
          onClick={toggleTheme}
        >
          {theme === "light" ? "????" : "????"}
        </button>
        <div className="dataContainer">
          <div className="greeting">
            <div className="header">???? Hey there!</div>

            <div className={`bio-${theme}`}>
              I am Sailesh and I just hopped on the buildspace ship! Connect
              your Ethereum wallet and wave at me!
            </div>

            {currentAccount && (
              <div className="message-container">
                <form onSubmit={handleSubmit}>
                  <textarea
                    typeof="text"
                    id="message"
                    className={`input-${theme}`}
                    placeholder={`Enter your message here :)`}
                    autoComplete="off"
                    value={message}
                    onChange={handleChange}
                  />
                </form>
              </div>
            )}

            {/*
             * If there is no currentAccount render this button
             */}
            {!currentAccount && (
              <button className={`waveButton-${theme}`} onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
            <button className={`waveButton-${theme}`} onClick={wave}>
              Wave at Me
            </button>
            {mining && <p>{mining}</p>}
            {currentAccount && (
              <p className={`wave-counter-${theme}`}>No. of waves: {waves}</p>
            )}
            {allWaves
              .slice(0)
              .reverse()
              .map((wave, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "OldLace",
                      padding: "8px",
                      marginBottom: "10px",
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
