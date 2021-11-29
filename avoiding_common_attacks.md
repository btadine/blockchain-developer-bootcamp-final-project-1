# avoiding_common_attacks

## Proper Use of Require, Assert and Revert

I use require for preconditioning, such as `require(msg.value == MINT_PRICE, "Need to send 0.04 ether");`

## Use Modifiers Only for Validation

```solidity
    // modifier admin has admin role can call this function
    modifier onlyAdmin {
      require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Only admin can call function");
      _;
    }
```
