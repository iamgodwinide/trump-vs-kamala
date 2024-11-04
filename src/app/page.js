"use client"

import React, { useState, useEffect } from 'react'
import styles from './home.module.css'
import Update from './components/Update'
import { Connection, PublicKey } from '@solana/web3.js';
import toast, { Toaster } from 'react-hot-toast';


const Home = () => {
  const [wallet, setWallet] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState(0);
  const [trumpVotes, setTrumpVotes] = useState(0);
  const [kamalaVotes, setKamalaVotes] = useState(0);
  const [recentVotes, setRecentVotes] = useState([]);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);


  const notifySucces = (choice) => toast('You have voted for ' + choice, {
    duration: 4000,
    position: 'top-center',

    // Styling
    style: {
      backgroundColor: "green",
      color: "#fff"
    },
    className: '',

    // Change colors of success/error/loading icon
    iconTheme: {
      primary: '#000',
      secondary: '#fff',
    },
    // Aria
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });


  const notifyError = (msg) => toast(msg, {
    duration: 4000,
    position: 'top-center',

    // Styling
    style: {
      backgroundColor: "red",
      color: "#fff"
    },
    className: '',

    // Change colors of success/error/loading icon
    iconTheme: {
      primary: '#000',
      secondary: '#fff',
    },
    // Aria
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });


  // Initialize Solana connection
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT, { commitment: "confirmed", confirmTransactionInitialTimeout: 60_000 });

  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Check if Phantom is installed
      if (!wallet) {
        throw new Error('Please install Phantom wallet');
      }

      // Connect to wallet
      const response = await wallet.connect();
      console.log('Connected to wallet:', response.publicKey.toString());

      // Get token balance
      const tokenBalance = await checkTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      setTokenBalance(tokenBalance);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      setConnected(false);
      await wallet.disconnect();
      setTokenBalance(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error.message);
    }
  };

  // Function to fetch token balances
  // const fetchTokenBalances = async (publicKey) => {
  //   try {
  //     const tokenAccounts = await getTokenAccounts(connection, publicKey);
  //     const balances = {};


  //     for (const account of tokenAccounts) {
  //       const mintAddress = account.account.data.parsed.info.mint;
  //       const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
  //       balances[mintAddress] = balance;
  //     }
  //     setTokenBalances(balances);
  //     setConnected(true);
  //   } catch (error) {
  //     console.error('Error fetching token balances:', error);
  //     setError(error.message);
  //   }
  // }

  // Function to check specific token balance
  const checkTokenBalance = async (tokenMintAddress) => {
    try {
      if (!wallet?.publicKey) {
        throw new Error('Please connect your wallet first');
      }

      const mintPubkey = new PublicKey(tokenMintAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        { mint: mintPubkey }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance.toLocaleString();
    } catch (error) {
      console.error('Error checking token balance:', error);
      setError(error.message);
      return null;
    }
  };

  // handle vote
  const handleVote = async (choice) => {
    try {
      if (voting) return;
      if (!wallet.publicKey) {
        notifyError("Connect wallet to vote!");
        return
      }
      // if (tokenBalance < 1) {
      //   notifyError("Insufficient tokens");
      //   return;
      // }
      setVoting(true);
      const res = await fetch("/api/data", {
        method: "POST",
        cache: 'no-store',
        body: JSON.stringify({
          choice,
          address: wallet.publicKey
        }),
        headers: {
          "Content-type": "application/json"
        }
      })

      const data = await res.json();

      if (res.ok) {
        notifySucces(choice);
        getUpdates();
      } else {
        notifyError(data.message);
      }
      setVoting(false);
    } catch (err) {
      notifyError("Network error");
    }
  }

  const getUpdates = async () => {
    try {
      const res = await fetch("/api/data", {
        cache: 'no-store',
      });
      const data = await res.json();
      setVotes(() => data.totalVotes);
      setRecentVotes(() => data.recentVotes);
      setTrumpVotes(() => data.trumpVotes);
      setKamalaVotes(() => data.kamalaVotes);
      setLoading(false);
      setTimeout(() => getUpdates(), 1000)
    } catch (err) {
      console.log(err);
    }
  }

  // Check if Phantom wallet is available
  useEffect(() => {
    if ('solana' in window) {
      setWallet(window.solana);
    }
    getUpdates();
  }, []);




  return (
    <div className='h-screen w-screen bg-white'>
      {/* header */}
      <div className='w-full shadow-lg'>
        <div className='container flex flex-row items-center justify-between'>
          <div className='text-xl md:text-2xl font-bold text-black uppercase'>Token Vote</div>
          {!connected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="text-white text-base font-bold px-4  py-2 bg-black rounded"
            >
              {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="text-white text-base font-bold px-4  py-2 bg-black rounded"
            >
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>
      {/* header end */}

      {
        error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-96 text-center mx-auto">
            {error}
          </div>
        )
      }

      <div className='mt-10'>
        <div className="container text-base text-black flex items-center gap-4 bg-gray-50">
          <div className="text-base font-bold text-gray-800">Token Balance:</div>
          <div className='text-base font-bold text-gray-800'>{tokenBalance}</div>
        </div>
      </div>

      {/* main start */}
      <div className='container flex flex-col gap-20 md:gap-10 md:flex-row-reverse'>
        {/* candidates images start */}
        <div className='w-full md:w-3/5 relative'>
          <div className='w-full'>
            {/* progress */}
            <div className='flex justify-between mb-2'>
              <div className='text-2xl font-bold text-black'>{((trumpVotes / votes).toFixed(2) * 100) | 0}%</div>
              <div className='text-2xl font-bold text-black'>{((kamalaVotes / votes).toFixed(2) * 100) | 0}%</div>
            </div>
            <progress className="progress progress-error h-4 w-full kamala-bg mb-4" value={Math.floor(trumpVotes / votes) * 100} max="100"></progress>
            <div className="w-full flex flex-row">
              <div className={`${styles.ctrump} flex-1`}>
                <img src={"/trump.png"} alt='Donald Trump' width={100} height={100} className='w-full h-full' />
              </div>
              <div className={`${styles.ckamala} flex-1`}>
                <img src={"/kamala.png"} alt='Kamala Harris' width={100} height={100} className='w-full h-full' />
              </div>
            </div>
            {/* versus circle */}
            <div className='flex w-full h-full top-0 left-0 absolute justify-center items-center'>
              <div className='text-base md:text-3xl font-bold w-16 h-16 md:w-32 md:h-32 rounded-full bg-white text-black flex text-center items-center justify-center'>VS</div>
            </div>
            {/* versus cirle end */}
          </div>
          {/* votee count start */}
          <div className='flex justify-around my-4'>
            <div className='text-2xl font-bold text-black'>{trumpVotes}</div>
            <div className='text-2xl font-bold text-black'>{kamalaVotes}</div>
          </div>
          {/* vote count end */}
          {/* action buttons start */}
          <div className='flex flex-row justify-around relative z-30'>
            <button
              onClick={() => handleVote("TRUMP")}
              className={`cursor-pointer text-xs trump-bg text-white font-bold px-5 md:px-10 py-2 w-2/5 shadow-md rounded-sm`}
            >{voting ? "Please wait..." : "VOTE TRUMP"}</button>
            <button
              onClick={() => handleVote("KAMALA")}
              className={`cursor-pointer text-xs kamala-bg text-white font-bold px-5 md:px-10 py-2 w-2/5 shadow-md rounded-sm`}
            >{voting ? "Please wait..." : "VOTE KAMALA"}</button>
          </div>
          {/* action buttons end */}
        </div>
        {/* candidates images end */}
        {/* updates start */}
        <div className='w-full md:w-2/5 px-4'>
          <div className='text-black text-md font-bold md:font-medium uppercase'>Live Updates</div>
          <div className='divider'></div>
          {/* updates */}
          <div className={`w-full overflow-y-scroll`}
            style={{
              height: "400px",
            }}
          >
            {
              recentVotes.map((v) => (
                <Update address={v.address} choice={v.choice} key={v.address} />
              ))
            }
          </div>
        </div>
        {/* updates end */}
      </div>
      {/* main end */}
      {/* loading overlay */}
      {
        loading
        && <div className='fixed z-50 w-full h-full top-0 left-0 bg-indigo-950 bg-opacity-55 flex flex-col justify-center items-center'>
          <img src="spin3.png" width={50} className={styles.spin} />
        </div>
      }
      <Toaster />
    </div >
  )
}

export default Home