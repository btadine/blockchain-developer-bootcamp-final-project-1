//SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CCR is ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Users will have to spend ETH to mint NFT
  // max mint 2 per sender
  // should set a blockheight, before height should verify if in whitelist, 
  // after it any address can mint freely
  function mint(uint number) payable public returns (uint256){

  }
}