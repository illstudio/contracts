pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CharacterGenerator {
  using ECDSA for bytes32;

  address public receiver;
  address public creator;

  event MessageReceived(bytes32 hash, bytes32 messageHash);
  event Log(string message);

  constructor(address _receiver) {
    receiver = _receiver;
    creator = msg.sender;
  }

  function generate(
    address[] memory tokenAddresses, 
    uint256[] memory tokenQuantities, 
    address taker,
    bytes memory signature
  ) public {
    emit Log('here');
    bytes32 hash = keccak256(abi.encodePacked(taker));
    bytes32 messageHash = hash.toEthSignedMessageHash();

    emit MessageReceived(hash, messageHash);

    address signer = messageHash.recover(signature);

    require(signer == creator);

    // Only the specified taker can run this function
    require(taker == msg.sender);
    // Check approvals for all tokens before executing transfers
    for(uint i = 0; i < tokenAddresses.length; i++) {
      ERC20 token = ERC20(tokenAddresses[i]);
      require(token.allowance(msg.sender, address(this)) >= tokenQuantities[i]);
    }

    // Transfer all tokens to self
    for(uint i = 0; i < tokenAddresses.length; i++) {
      ERC20 token = ERC20(tokenAddresses[i]);
      token.transferFrom(msg.sender, address(this), tokenQuantities[i]);
    }
  }

}