pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CharacterGenerator {
  using ECDSA for bytes32;

  address public receiver;
  address public owner;
  mapping(bytes32 => bool) public combinationUsed;

  constructor(address _owner, address _receiver) {
    receiver = _receiver;
    owner = _owner;
  }

  function generate(
    address[] memory tokenAddresses, 
    uint256[] memory tokenQuantities, 
    address taker,
    uint256 expiration,
    bytes memory signature
  ) public {
    bytes32 hash = keccak256(abi.encodePacked(taker, expiration));
    address signer = hash.toEthSignedMessageHash().recover(signature);
    
    require(signer == owner, "Cannot Process Transaction Signed By Wrong Party");
    
    // Only the specified taker can run this function
    require(taker == msg.sender, "Cannot Process Transaction Intended For Another Address");

    // Cannot be expired
    require(block.timestamp <= expiration, "Cannot Process Transaction After It Has Expired");

    // NOTE: Assumes we always sort tokens the same way when signing!
    bytes32 tokenComboHash = keccak256(abi.encodePacked(tokenAddresses, tokenQuantities));
    require(!combinationUsed[tokenComboHash], "Token Combination Has Already Been Used");
    combinationUsed[tokenComboHash] = true;


    // Check approvals for all tokens before executing transfers
    for(uint i = 0; i < tokenAddresses.length; i++) {
      ERC20 token = ERC20(tokenAddresses[i]);
      require(token.allowance(msg.sender, address(this)) >= tokenQuantities[i], "Insufficent Allowance Provided");
    }

    // Transfer all tokens to self
    for(uint i = 0; i < tokenAddresses.length; i++) {
      ERC20 token = ERC20(tokenAddresses[i]);
      token.transferFrom(msg.sender, address(this), tokenQuantities[i]);
    }
  }

}