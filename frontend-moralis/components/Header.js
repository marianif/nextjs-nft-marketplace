import { ConnectButton } from "web3uikit"
import Link from "next/link"

const Header = () => {
  return (
    <nav className="p-5 flex flex-row justify-between items-center border-b-2">
      <h1 className="p-4 font-bold text-3xl">NFT Marketplace</h1>
      <Link href={"/"}>
        <a>NFT Marketplace</a>
      </Link>
      <Link href={"/sell-nft"}>
        <a>Sell NFT</a>
      </Link>
      <ConnectButton moralisAuth={false} />
    </nav>
  )
}

export default Header
