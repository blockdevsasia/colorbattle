/* eslint-disable */
import {
  MSGS,
  EVENT_CHANNEL,
  event,
  ready,
  getProvider,
  getWallet,
  getWalletAddress,
  getNetName,
  hasEns,
  Contract,
  loadContractJSONFile
} from './ethersConnect';

import ColorBattleContract from '../../contracts/abi.json'
import { bigNumberify } from 'ethers/utils';
import { Wallet } from 'ethers';

export default {
  async connect(ctx) {
    try {
      let oldAddress = ctx.state.address;
      let provider = getProvider();
      if (!provider) throw new Error(MSGS.NOT_READY);

      let wallet = getWallet();
      if (!wallet) throw new Error(MSGS.NO_WALLET);
      const address = await getWalletAddress();
      const network = await getNetName();

      ctx.commit('connected', true);
      ctx.commit('error', null);
      ctx.commit('address', address);
      ctx.commit('user', address);
      ctx.commit('network', network);

      const msg = oldAddress && oldAddress !== address ?
        `Your Ethereum address/user has changed.
         Address: ${address}
         Network: ${network}
         Your ether balance: ${await provider.getBalance(address)}` :
        `You are connected to the Ethereum Network.
         Address: ${address}
         Network: ${network}
         Your ether balance: ${await provider.getBalance(address)}
         If you change your address or network, this app will update automatically.`
      console.log(msg);

      // Other vuex stores can wait for this
      event.$emit(EVENT_CHANNEL, MSGS.ETHERS_VUEX_READY);

      // now check for .eth address too
      if (await hasEns()) {
        console.log('Net supports ENS. Checking...');
        ctx.commit('ens', await provider.lookupAddress(address));
        if (ens) {
          ctx.commit('user', ens);
        }
      }
    } catch (err) {
      ctx.dispatch('disconnect', err);
    }
  },
  async disconnect(ctx, err) {
    const oldAddress = ctx.state.address;
    ctx.commit('connected', false);
    ctx.commit('error', err);
    ctx.commit('address', '');
    ctx.commit('user', '');
    ctx.commit('network', '');
    ctx.commit('ens', null);

    const msg = err ? `There was an error: ${err.message}` : (oldAddress ?
      'You have been disconnected from your Ethereum connection. Please check MetaMask, etc.' :
      'You are not connected to an Ethereum node and wallet. Please check MetaMask, etc.')
    alert(msg);

  },
  async logout(ctx) {
    ctx.commit('address', '');
    ctx.commit('user', '');
    alert('You have been logged out from your Ethereum connection');
  },
  async init(ctx) {
    event.$on(EVENT_CHANNEL, async function (msg) {
      console.log('Ethers event received', msg);
      switch (msg) {
        case MSGS.NOT_READY:
          await ctx.dispatch('disconnect');
          break;
        case MSGS.NO_WALLET:
          await ctx.dispatch('logout');
          break;
        case MSGS.ACCOUNT_CHANGED:
          await ctx.dispatch('connect');
          break;
      }
    });
    if (ready()) await ctx.dispatch('connect');
    event.$emit(EVENT_CHANNEL,MSGS.ETHERS_VUEX_INITIALIZED);
    console.log('Log in to your Ethereum wallet to see what it can do!');
    ctx.commit('initialized', true);
  },
  async freeCredits(ctx) {

    // contract address
    let address = "0x65f9a2dfc14e736e33344bd5f68e88528de58e68";

    // my test rinkeby address
    let privateKey = "754170781E5F414770E39FE3D1A48060A639C37D1B2A3274CA6C1026FC0CC0BE"
    let myWallet = new Wallet(privateKey, getProvider())
    let contract = new Contract(address, ColorBattleContract, myWallet);

    try{
      let result = await contract.getBalance();
      console.log("balance", result.toNumber());
      
      let tx = await contract.deposit();
      console.log(tx.hash)
      await tx.wait();
      
      let newBalance = await contract.getBalance()
      console.log("New balance: ", newBalance.toNumber())
      
    }catch(err){
      console.error(err)
    }
    
  },
}
