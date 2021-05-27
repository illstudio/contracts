pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CharacterGenerator {
  using ECDSA for bytes32;

  address public receiver;
  address public owner;

  constructor(address _owner, address _receiver) {
    receiver = _receiver;
    owner = _owner;
  }

  function test(address message, bytes memory signature) public pure returns (address) {
    bytes32 hash = keccak256(abi.encodePacked(message));
    return hash.toEthSignedMessageHash().recover(signature);
  }

  function generate(
    address[] memory tokenAddresses, 
    uint256[] memory tokenQuantities, 
    address taker,
    bytes memory signature
  ) public {
    bytes32 hash = keccak256(abi.encodePacked(taker));
    address signer = hash.toEthSignedMessageHash().recover(signature);
    
    require(signer == owner);

    // Only the specified taker can run this function
    require(taker == msg.sender);
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