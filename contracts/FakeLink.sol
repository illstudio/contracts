pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeLink is ERC20 {

  constructor(uint256 _totalSupply) ERC20("FakeLink", "fLINK") {
    _mint(msg.sender, _totalSupply);
  }
  
}