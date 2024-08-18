## Create Aptos Dapp Boilerplate Template

The Boilerplate template provides a starter dapp with all necessary dapp infrastructure and a simple wallet info implementation.


## The Boilerplate template provides:

- **Folder structure** - A pre-made dapp folder structure with a `frontend` and `move` folders.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.
- **Wallet Info implementation** - Pre-made `WalletInfo` components to demonstrate how one can use to read a connected Wallet info.

### What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands

### What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:init` - a command to initialize an account to publish the Move contract and to configure the development environment
- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.

# remed

## Contract deployed on Sepolia
[https://sepolia.etherscan.io/address/0x5c184daf813ec32b77f393065802fd146bfbb121](https://sepolia.etherscan.io/address/0x5c184daf813ec32b77f393065802fd146bfbb121)

## Contract deployed on Scroll
[https://sepolia.scrollscan.com/address/0xfd4a2eabccd33ed20519162944d988c1202de089](https://sepolia.scrollscan.com/address/0xfd4a2eabccd33ed20519162944d988c1202de089)

## Contract deployed on Aptos
[https://explorer.aptoslabs.com/account/0xb289ca0db88599a6f7f952621b674aeeb2c7080696a887c6bc3d480ea354f510/transactions?network=devnet](https://explorer.aptoslabs.com/account/0xb289ca0db88599a6f7f952621b674aeeb2c7080696a887c6bc3d480ea354f510/transactions?network=devnet)

## Token contract on MasChain
`0xa641F3a1be580Fc5a87f0D0b7bA3AD08c384a89D`
