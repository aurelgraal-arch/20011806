export async function ensureBaseNetwork() {
  const { ethereum } = window as any
  if (!ethereum) throw new Error('MetaMask non installato')
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  if (chainId !== '0x2105') {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      })
    } catch {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x2105',
            rpcUrls: ['https://mainnet.base.org'],
            chainName: 'Base Mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://basescan.org'],
          },
        ],
      })
    }
  }
}
