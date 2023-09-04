// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract JYZToken is ERC20, EIP712 {
    address public owner;
    mapping(address => uint256) public ownerNonce;
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 amount,uint256 nonce)"
        );
    modifier onlyOwner() {
        require(msg.sender == owner, "Invalid owner");
        _;
    }

    constructor() EIP712("Joeyzone", "1") ERC20("Joeyzone", "JYZ") {
        owner = msg.sender;
        _mint(msg.sender, 1_000_000_000 ether);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(owner, amount);
    }

    function permit(
        address _owner,
        address spender,
        uint256 amount,
        bytes calldata sig
    ) external {
        bytes32 structHash = keccak256(
            abi.encode(_PERMIT_TYPEHASH, owner, spender, amount, useNonce())
        );
        bytes32 _hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(_hash, sig);
        require(signer == _owner, "Invalid signature");
        _approve(_owner, spender, amount);
    }

    function useNonce() internal returns (uint256 _nonce) {
        _nonce = ownerNonce[msg.sender];
        ownerNonce[msg.sender] += 1;
    }

    function domainSeparatorV4() public view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
