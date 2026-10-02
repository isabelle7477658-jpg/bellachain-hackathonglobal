const hre = require('hardhat');

async function main() {
  const BellaPoints = await hre.ethers.getContractFactory('BellaPoints');
  const bellaPoints = await BellaPoints.deploy();

  await bellaPoints.waitForDeployment();

  console.log('BellaPoints deployed to:', await bellaPoints.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
