export const saveWalletInfoToLocalStorage = (
  walletConnected,
  currentAccount
) => {
  localStorage.setItem('walletConnected', walletConnected);
  localStorage.setItem('currentAccount', currentAccount);
};

export const getWalletInfoFromLocalStorage = () => {
  const savedWalletConnected = localStorage.getItem('walletConnected');
  const savedCurrentAccount = localStorage.getItem('currentAccount');

  const initialWalletConnected = savedWalletConnected
    ? JSON.parse(savedWalletConnected)
    : false;
  const initialCurrentAccount = savedCurrentAccount || undefined;

  return {
    walletConnected: initialWalletConnected,
    currentAccount: initialCurrentAccount,
  };
};

export const saveNetworkToLocalStorage = (chainId, chainName) => {
  const decimalChainId = parseInt(chainId, 16);
  localStorage.setItem('chainId', decimalChainId);
  localStorage.setItem('chainName', chainName);
};

export const getNetworkFromLocalStorage = () => {
  const savedChainId = localStorage.getItem('chainId');
  const savedChainName = localStorage.getItem('chainName');

  return { chainId: savedChainId, chainName: savedChainName };
};
