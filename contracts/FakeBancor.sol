pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeBancor is ERC20 {

  constructor(uint256 _totalSupply) ERC20("FakeBancor", "fBNT") {
    _mint(msg.sender, _totalSupply * (10 ** decimals()));
  }
  
}