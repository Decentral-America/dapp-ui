export interface INetwork {
    code: string,
    server: string,
    clientOrigin?: string
    matcher?: string
}

export enum ENetworkByte {
    MAINNET = 63,   // ?
   // STAGENET = 83,  // S
    TESTNET = 33,   // !
   // DEVNET = 68,    // D
   // PRIVATE = 82,   // R
   // DEVNET_C = 67,  // C
}

export const networks = {
    'testnet': {
        server: 'https://testnet-node.decentralchain.io',
        code: '!',
        clientOrigin: 'https://testnet.decentral.exchange/signer/'
    },
    // 'stagenet': {
    //    server: 'https://nodes-stagenet.wavesnodes.com',
    //    code: 'S',
    //    clientOrigin: 'https://stagenet.waves.exchange/signer/'
    // },
    'mainnet': {
        server: 'https://mainnet-node.decentralchain.io',
        code: '?',
        clientOrigin: 'https://decentral.exchange/signer/'
    },
   // 'devnet': {server: 'https://devnet1-htz-nbg1-1.wavesnodes.com', code: 'D'},
   // 'private': {server: 'http://localhost:6869', code: 'R'},
   // 'devnetC': {server: 'https://devnet1-htz-nbg1-4.wavesnodes.com', code: 'C'},
};

export const Network = {

    getNetworkByByte: (byte: number): INetwork | undefined => {
        switch (byte) {
            case ENetworkByte.TESTNET:
                return networks.testnet;
           // case ENetworkByte.STAGENET:
            //    return networks.stagenet;
            case ENetworkByte.MAINNET:
                return networks.mainnet;
           // case ENetworkByte.DEVNET:
           //     return networks.devnet;
            //case ENetworkByte.PRIVATE:
           //     return networks.private;
          //  case ENetworkByte.DEVNET_C:
            //    return networks.devnetC;
        }
    }

}
