// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BellaPoints {
    string public name = "BellaPoints";
    string public symbol = "BPT";
    uint8 public decimals = 0;

    uint256 public totalSupply;
    address public owner;
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o administrador");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Endereco invalido");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function mint(address to, uint256 value) external onlyOwner {
        require(to != address(0), "Enderec\u00e7o inv\u00e1lido");
        require(value > 0, "Valor deve ser maior que zero");

        totalSupply += value;
        balanceOf[to] += value;

        emit Mint(to, value);
        emit Transfer(address(0), to, value);
    }

    function burn(address from, uint256 value) external onlyOwner {
        require(from != address(0), "Endere\u00e7o inv\u00e1lido");
        require(balanceOf[from] >= value, "Saldo insuficiente");

        balanceOf[from] -= value;
        totalSupply -= value;

        emit Burn(from, value);
        emit Transfer(from, address(0), value);
    }
}
