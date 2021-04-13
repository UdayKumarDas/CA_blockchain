# Transfer tokens to multiple ETH addresses 

We have used ERC20 tokens which is the most basic and most adopted token standard. We have taken 10 addresses from `accounts.txt` file in order to transfer tokens into different addresses.
`transfer_tokens.js` is the main JS file through which transaction is hapenning. Contract solidity code in `contract_v1.sol` is used to deploy contract through Remix solidity compiler. And after deploying the contract, ABI and contract address is being used in both files `read_file.js` and `transfer_tokens.js`.


Steps to install nodejs are below:

1. `curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -`
2. `sudo apt install nodejs`
3. `sudo apt install build-essential`

Steps to transfer tokens:

1. `node transfer_tokens.js`
