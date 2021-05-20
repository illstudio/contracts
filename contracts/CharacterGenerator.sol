pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CharacterGenerator {

  address public receiver;

  constructor(address _receiver) {
    receiver = _receiver;
  }

  function generate(address[] memory tokenAddresses, uint256[] memory tokenQuantities) public {
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