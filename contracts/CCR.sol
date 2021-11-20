// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CCR is AccessControlEnumerable, ERC721Enumerable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private _baseTokenURI;
    uint256 public whitelistEndDate;
    uint256 public maxSupply;
    address payable private fundAddress;
    mapping (address => bool) public whitelist;

    constructor() ERC721("Crypto Chasers Robot", "CCR"){
      maxSupply = 500;
      fundAddress = payable(msg.sender);
      whitelistEndDate = block.timestamp + 1 days;
      _baseTokenURI = "ipfs://QmdGmRN4rU5nttWe1ozvzJ4txUa1yXWn89QeWuzuoTwkTB/";
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(MINTER_ROLE, _msgSender());
    }

    // modifier admin has admin role can call this function
    modifier onlyAdmin {
      require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Only admin can call function");
      _;
    }

    // get token URL
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
       return string(super.tokenURI(tokenId));
    }

    function _baseURI() internal view virtual override returns (string memory) {
      return _baseTokenURI;
    }

    // admin can direct mint NFT to any address
    function mintByAdmin(address to) onlyAdmin public {
        _mint(to, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    // Users will have to spend ETH to mint NFT
    // max mint 2 per sender
    // should set a blockheight, before height should verify if in whitelist, 
    // after it any address can mint freely
    function mint() public payable {
      require(balanceOf(msg.sender) <= 2, "Max mint 2 per sender");
      require(maxSupply >= totalSupply(), "Max supply reached");

      if(whitelist[msg.sender]){
        require(hasRole(MINTER_ROLE, _msgSender()), "must have minter role to mint");
        _mint(msg.sender, _tokenIdTracker.current());
        _tokenIdTracker.increment();
      }else{
        require(block.timestamp >= whitelistEndDate, "only in whitelist can mint now");
        require(msg.value == 0.04 ether, "Need to send 0.04 ether");

        // send 0.04 ether to the contract fundAddress
        if(fundAddress.send(msg.value)){
          _mint(msg.sender, _tokenIdTracker.current());
          _tokenIdTracker.increment();
        }
      }
    }

    // admin can set whitelistEndDate
    function setwhitelistEndDate(uint256 _whitelistEndDate) onlyAdmin public {
      whitelistEndDate = _whitelistEndDate;
    }

    // admin can set maxSupply
    function setMaxSupply(uint256 _maxSupply) onlyAdmin public {
      maxSupply = _maxSupply;
    }

    // admin can set addresses array as MINTER_ROLE
    function addToWhitelist(address[] memory _whiteListAddresses) onlyAdmin public {
      for (uint i = 0; i < _whiteListAddresses.length; i++) {
        whitelist[_whiteListAddresses[i]] = true;
        super.grantRole(MINTER_ROLE, _whiteListAddresses[i]);
      }
    }

    // check if address is in whitelist
    function isInWhitelist(address _address) public view returns (bool) {
      return whitelist[_address];
    }

    // get fund address
    function getFundAddress() public view returns (address) {
      return fundAddress;
    }

    // get remaining supply
    function getRemainingSupply() public view returns (uint256) {
      return maxSupply - totalSupply();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}