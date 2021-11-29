# design pattern design

## Inheritance and Interfaces

Inherit from third-party(openzeppelin) libraries to avoid potential errors

```solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
```

## Access Control Design Patterns

Role control is used to set up the administrator and minter

```solidity
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    ...
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(MINTER_ROLE, _msgSender());
```
