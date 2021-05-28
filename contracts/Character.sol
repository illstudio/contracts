pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Character is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  address public owner;
  address public generator;

  constructor(address _owner) ERC721("Ill Intentions Character", "ILLC") {
    owner = _owner;
  }

  function generate(address taker, string memory tokenURI) public returns (uint256) {
    require(msg.sender == generator);
    _tokenIds.increment();

    uint256 newCharacterId = _tokenIds.current();
    _mint(taker, newCharacterId);
    _setTokenURI(newCharacterId, tokenURI);

    return newCharacterId;
  }

  function setGenerator(address _generator) public {
    require(msg.sender == owner);
    generator = _generator;
  }

}