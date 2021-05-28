pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./Character.sol";

contract CharacterGenerator {
  using ECDSA for bytes32;

  Character public character;

  address public manager;
  address public owner;
  uint16 public limit;
  uint16 public totalCreated;
  bool public active;

  address[] tokenList;

  mapping(bytes32 => bool) public combinationUsed;
  mapping(address => bool) public tokenUsed;

  constructor(address _owner, address _manager, uint16 _limit) {
    manager = _manager;
    owner = _owner;
    limit = _limit;
    totalCreated = 0;
    active = true;
  }

  function generate(
    address[] memory tokenAddresses, 
    uint256[] memory tokenQuantities, 
    address taker,
    uint256 expiration,
    string memory nftTokenURI,
    bytes memory signature
  ) public {
    // Make sure contract is active
    require(active, "Cannot Process Transaction After When Contract is Off");
    
    //Cannot create more than limit
    require(totalCreated < limit, "Limit Reached");

    bytes32 hash = keccak256(abi.encodePacked(tokenAddresses, tokenQuantities, taker, expiration, nftTokenURI));
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
      if (!tokenUsed[tokenAddresses[i]]) {
        tokenList.push(tokenAddresses[i]);
        tokenUsed[tokenAddresses[i]] = true;
      }
      ERC20 token = ERC20(tokenAddresses[i]);
      token.transferFrom(msg.sender, address(this), tokenQuantities[i]);
    }

    character.generate(taker, nftTokenURI);
  }

  function toggleActive(bool _active) public {
    require(msg.sender == manager, "Function Can Only Be Called By Contract Manager");
    active = _active;
  }

  function withdraw() public {
    require(msg.sender == manager, "Function Can Only Be Called By Contract Manager");
    for (uint i = 0; i < tokenList.length; i++) {
      ERC20 token = ERC20(tokenList[i]);
      uint256 balance = token.balanceOf(address(this));
      token.transfer(msg.sender, balance);
    }
  }

  function setCharacter(address _character) public {
    require(msg.sender == manager, "Function Can Only Be Called By Contract Manager");
    character = Character(_character);
  }

}

// TODO:
// 5. Increment totalCreated
// 6. Add some salt