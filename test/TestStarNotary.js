const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId);
  assert.equal(
    (await instance.tokenIdToStarInfo.call(tokenId)).name,
    "Awesome Star!"
  );
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId,  { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId,{ from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  let tokenId = 71;
  let instance = await StarNotary.deployed();
  await instance.createStar("Limitless Star!", tokenId);
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  assert.equal(
    (await instance.tokenIdToStarInfo.call(tokenId)).name,
    "Limitless Star!"
  );
  assert.equal((await instance.tokenIdToStarInfo.call(tokenId)).symbol);
});

it("lets 2 users exchange stars", async () => {
  let instance = await StarNotary.deployed();
  // 1. create 2 Stars with different tokenId
  let firstTokenId = 8;
  await instance.createStar("Limitless First Star!", firstTokenId, {
    from: accounts[1],
  });

  let secondTokenId = 122;
  await instance.createStar("Limitless Second Star!", secondTokenId, {
    from: accounts[2],
  });
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.approve(accounts[1], secondTokenId, { from: accounts[2] });
  await instance.exchangeStars(firstTokenId, secondTokenId, {
    from: accounts[1],
  });
  // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf.call(firstTokenId), accounts[2]);
  assert.equal(await instance.ownerOf.call(secondTokenId), accounts[1]);
});

it("lets a user transfer a star", async () => {
  let instance = await StarNotary.deployed();
  let starOwner = accounts[4];
  let starReceiver = accounts[9];
  // 1. create a Star with different tokenId
  let tokenId = 908;
  await instance.createStar("Limitless testing Star!", tokenId, {
    from: starOwner,
  });
  assert.equal(await instance.ownerOf.call(tokenId), starOwner);
  // 2. use the transferStar function implemented in the Smart Contract
  instance.transferStar(starReceiver,tokenId,{from:starOwner});
  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf.call(tokenId), starReceiver);
});

it("lookUptokenIdToStarInfo test", async () => {
    let instance = await StarNotary.deployed();
    let starOwner = accounts[4];
  // 1. create a Star with different tokenId
  let tokenId = 17;
  await instance.createStar("Star!", tokenId, {
    from: starOwner,
  });
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  assert.equal( await instance.lookUptokenIdToStarInfo.call(tokenId), "Star!");
});
