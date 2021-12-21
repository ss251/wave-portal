require("@nomiclabs/hardhat-waffle");
const alchemy_url = process.env.ALCHEMY_API_URL;
const rinkeby_key = process.env.RINKEBY_ACCOUNT_KEY;

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: `${alchemy_url}`,
      accounts: [`${rinkeby_key}`],
    },
  },
};
