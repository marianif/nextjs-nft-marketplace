// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

/**
 * @notice this contract implements the following functionalities:
 * 1. `listItem`: List NFTs on the marketplace
 * 2. `buyitem`: Buy NFTs
 * 3. `cancelItem`: Cancel a listing
 * 4. `updateListing`: Update Price
 * 5. `withdrawProceeds`: Withdraw payments for my bought NFTs
 */

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__NotOwner();
error NftMarketplace__NoProfits();
error NftMarketplace__TransactionFailed();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);

contract NftMarketplace is ReentrancyGuard {
    // Types
    struct Listing {
        uint256 price;
        address seller;
    }

    // Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed receiver,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemDeleted(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ProfitWithdrew(address indexed seller, uint256 indexed profit);

    // Nft contract address => Nft token id => listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    // Keep track of how much people have earned selling their NFTs
    // mapping of seller address => amount earned
    mapping(address => uint256) private s_profits;

    // Modifiers
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // Checks if the user trying to sell the nft is the actual owner
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address seller
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (owner != seller) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    ////////////////////
    // Main Functions //
    ////////////////////

    /**
     * @notice Method for listing NFTs
     * @param nftAddress: Address of the NFT Contract
     * @param tokenId: Address of the NFT
     * @param price: The selling price
     */

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        /**
         * @notice one approach maybe sent the NFT to the contract, our Marketplace is the owner of the NFT.
         * This scenario is quite gas expensive in terms of gas.
         * The second approach ( definitely less intrusive ) allows owners to still hold their NFTs and
         * give the marketplace the authorization
         * to sell NFTs for them.
         * We will use the second approach.
         */

        // Approve Marketplace to sell NFT
        //note that getApproved DOES NOT return a boolean, but the approved address
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (msg.value < listing.price) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listing.price
            );
        }

        s_profits[listing.seller] += listing.price;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );
        // check to make sure the NFT was transferred
        emit ItemBought(msg.sender, nftAddress, tokenId, listing.price);
    }

    function cancelItem(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemDeleted(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdraw() external {
        uint256 profit = s_profits[msg.sender];
        if (profit <= 0) {
            revert NftMarketplace__NoProfits();
        }
        // s_profits[msg.sender] = 0;
        delete (s_profits[msg.sender]);
        (bool success, ) = payable(address(msg.sender)).call{value: profit}("");
        // require(success, NftMarketplace__TransactionFailed());
        if (!success) {
            revert NftMarketplace__TransactionFailed();
        }

        emit ProfitWithdrew(msg.sender, profit);
    }

    ///////////////////////
    // Getters Functions //
    ///////////////////////

    function getProfits(address sellerAddress) external view returns (uint256) {
        return s_profits[sellerAddress];
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }
}
