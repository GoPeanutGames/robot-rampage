const contractAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "bundleId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountInEth",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_signature",
        "type": "bytes"
      }
    ],
    "name": "purchaseGemsByEth",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const envs = {
  local: {
    origin: 'http://localhost',
    chainId: 168587773,
    gemsContract: "0x7F119F5f554B5a13f806F708aA74855523773828",
    tokenContract: "0xeef2D7cA3d6fD039dF5Eb899378a37F541bDefA0",
    connectionConfig: {
      rpcUrls: ["https://sepolia.blast.io"],
      chainName: "Blast Sepolia",
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ["https://testnet.blastscan.io"],
    },
  },
  dev: {
    origin: 'https://peanuthub.com',
    chainId: 168587773,
    gemsContract: "0x7F119F5f554B5a13f806F708aA74855523773828",
    tokenContract: "0xeef2D7cA3d6fD039dF5Eb899378a37F541bDefA0",
    connectionConfig: {
      rpcUrls: ["https://sepolia.blast.io"],
      chainName: "Blast Sepolia",
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ["https://testnet.blastscan.io"],
    },
  },
  prod: {
    origin: 'https://peanutgames.com',
    chainId: 81457,
    gemsContract: "0xf1bed3036BC5C1A16cAb7BdAa9234ee4e49CB57F",
    tokenContract: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    connectionConfig: {
      rpcUrls: ["https://blastscan.io"],
      chainName: "Blast Mainnet",
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ["https://blastscan.io"],
    },
  },
};

window.metamaskLogin = async (isDev = true) => {
  const currentEnv = isDev ? envs.dev : envs.prod;

  let chainId = await window.ethereum.request({ method: "eth_chainId" });

  chainId = parseInt(chainId);

  if (chainId !== currentEnv.chainId) {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: ethers.utils.hexValue(currentEnv.chainId),
          ...currentEnv.connectionConfig,
        },
      ],
    });
  }

  if (chainId === currentEnv.chainId) {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    if (accounts.length > 0) {
      return accounts[0];
    } else {
      console.log("No wallet has been connected");
    }
  }

  return false;
};

window.metamaskBundleBuying = async (bundleId = 1, isDev = true) => {
  const currentEnv = isDev ? envs.dev : envs.prod;

  let chainId = await ethereum.request({ method: "eth_chainId" });

  chainId = parseInt(chainId);

  if (chainId !== currentEnv.chainId) {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: ethers.utils.hexValue(currentEnv.chainId),
          ...currentEnv.connectionConfig,
        },
      ],
    });
  }

  if (chainId === currentEnv.chainId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const gemsContract = new ethers.ethers.Contract(
      currentEnv.gemsContract,
      contractAbi,
      provider
    );

    let userAddress = await ethereum.request({ method: "eth_requestAccounts" });
    userAddress = userAddress[0];

    const baseUrl = isDev === true ? `https://api-bb.peanuthub.dev/` : `https://api-bb.peanutgames.com/`;

    //get the bundle purchasing request
    const buyRequest = await fetch(`${baseUrl}bundles/prepare-gems-purchase-with-eth'`, {
      method: 'POST',
      body: JSON.stringify({ address: userAddress.toLowerCase(), bundleId: `${bundleId}` }),
    })

    if (!buyRequest) {
      console.log("You are not eligible to buy this bundle. Please try again later.");
    
      return false
    }

    const userBalance = await provider.getBalance(
      userAddress
    )

    if (userBalance.lt(ethers.BigNumber.from(buyRequest.priceInWei))) {
      console.log(
        `You don't have enough ETH to buy this bundle. Please try again later.`,
      )
      return false
    }

    const tx = await gemsContract
      .connect(provider.getSigner())
      .purchaseGemsByEth(
        bundleId,
        buyRequest.priceInWei,
        buyRequest.signature,
        {
          value: buyRequest.priceInWei,
        }
      )

      await tx.wait()
  }
};

MEASUREMENT_ID = null;
MEASUREMENT_ID = "G-M7GYWDYGQE"; // mini game

switch (window.location.hostname) {
  case "game.peanutgames.com":
    MEASUREMENT_ID = "G-M7GYWDYGQE"; // mini game
    break;
  case "community.peanutgames.com":
    MEASUREMENT_ID = "G-41NL0CQ277"; // community
    break;
}

document.addEventListener("readystatechange", () => {
  if (MEASUREMENT_ID) {
    var analyticsScript = document.getElementById("analytics");

    if (analyticsScript) {
      analyticsScript.onload = function () {
        analyticsScript.src += MEASUREMENT_ID;
      };
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      gtag("js", new Date());

      gtag("config", MEASUREMENT_ID);
    }
  }

  window.openChangeNickNamePopup = (nickname, registerCallBack) => {
    let popUpView = `<div class="popup-container">
        <div class="popup">
          <div class="head">
            <h2>Change Your Nickname</h2>
            <div class="close-popup" id="closeBtn"><a href="#">X</a></div>
          </div>
          <input class="nickname" value="${nickname}" type="text" name="nickname"/>
          <a href="#" class="popup-btn">Save</a>
        </div>`;

    document.querySelector("#popup").innerHTML = popUpView;
    document.querySelector("#popup").style.display = "block";
    setTimeout(() => document.querySelector("#popup input").focus(), 500);

    const evListener = () => {
      registerCallBack(document.querySelector("#popup input").value);
      document.querySelector("#closeBtn").click();
    };

    document.querySelector(".popup-btn").addEventListener("click", evListener);

    document.querySelector("#closeBtn").addEventListener("click", () => {
      document
        .querySelector(".popup-btn")
        .removeEventListener("click", evListener);
      document.querySelector("#popup").innerHTML = "";
      document.querySelector("#popup").style.display = "none";
    });
  };
});

/**
 * When game is mounted in an `iframe` the code below
 * allows to receive session data from the parent window.
 */
window.addEventListener('message', event => {
  const { signal, data } = event.data
  switch (signal) {
    case "auth":
      return saveAuthInfo(data)
  }
})

const saveAuthInfo = data => {
  console.log('[child] Saving auth data', { data })
  localStorage.setItem('web3Info', JSON.stringify(data))
}

window.getAuthInfo = () => {
  const data = localStorage.getItem('web3info')
  if (!data) {
    throw new Error('no auth data saved')
  }
  return JSON.parse(data)
}

window.clearAuthInfo = () => {
  localStorage.delete('web3info')
}
