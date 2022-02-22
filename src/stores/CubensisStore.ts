import {SubStore} from '@stores/SubStore';
import {action, autorun, observable, set} from 'mobx';
import {nodeInteraction, waitForTx} from '@decentralchain/waves-transactions';
import {RootStore} from '@stores/RootStore';
import {getCurrentBrowser, getExplorerLink} from '@utils/index';
import {ELoginType} from '@src/interface';

interface ICubensisConnectAccount {
    address: string
    name: string
    network: string
    networkCode: string
    publicKey: string
    type: string
    balance: {
        available: string
        leasedOut: string
        network: string
    }
}

interface ICubensisError {
    code: string
    data: any
    message: string
}

export interface IAsset {
    assetId: string
    name: string
    decimals: number
}

class CubensisStore extends SubStore {

    constructor(rootStore: RootStore) {
        super(rootStore);
        if (this.isBrowserSupportsCubensisConnect) {
            this.setupCubensisConnect();
        }
        else {
            this.rootStore.notificationStore!.notify('you use unsupported browser', {
                type: 'warning',
                link: "https://decentralchain.io/cubensis-connect",
                linkTitle: 'more'
            });
        }
    }

    @observable cubensisConnectAccount?: ICubensisConnectAccount;

    @observable isCubensisConnectInitialized: boolean = false;
    @observable isCubensisConnectInstalled: boolean = false;

    @observable isApplicationAuthorizedInCubensisConnect: boolean = false;

    @action
    login = async () => {
        const resp = window['CubensisConnect'].publicState();
        const publicState = await resp;
        if (publicState.account && publicState.account.address) {
            this.updateNetwork(publicState)
            this.rootStore.accountStore.address = publicState.account.address;
            this.rootStore.accountStore.loginType = ELoginType.CUBENSIS;

        }
        return resp;
    };


    @action
    updateCubensisConnectAccount = async (publicState: any) => {
        this.rootStore.accountStore.scripted = (await nodeInteraction.scriptInfo(publicState.account.address, publicState.network.server)).script != null;
        const scripted = (await nodeInteraction.scriptInfo(publicState.account.address, publicState.network.server)).script;
        console.log('scripted', scripted)
        this.cubensisConnectAccount && set(this.cubensisConnectAccount, {
            ...publicState.account
        });
    };

    @action
    resetCubensisConnectAccount = () => {
        this.cubensisConnectAccount = undefined;
    };

    @action
    async updateCubensisConnect(publicState: any) {
        this.updateNetwork(publicState);

        if (publicState.account)
            this.rootStore.accountStore.address = publicState.account.address;

        if (this.cubensisConnectAccount) {
            publicState.account
                ? this.updateCubensisConnectAccount(publicState)
                : this.resetCubensisConnectAccount();
        } else {
            this.cubensisConnectAccount = publicState.account;
        }
    }

    @action logout() {

    }

    @action
    updateNetwork = (publicState: any) => {
        if (publicState.network && publicState.network !== this.rootStore.accountStore.network) {
            this.rootStore.accountStore.network = publicState.network;
        }
    };

    setupCubensisConnect = () => {
        let attemptsCount = 0;

        autorun(
            (reaction) => {
                if (attemptsCount === 2) {
                    reaction.dispose();
                    console.error('cubensis is not installed');
                    // this.rootStore.notificationStore.notify('cubensis is not installed', {
                    //     type: 'warning',
                    //     link: 'https://decentralchain.io/technology/cubensis',
                    //     linkTitle: 'install waves cubensis'
                    // });
                } else if (window['CubensisConnect']) {
                    reaction.dispose();
                    this.isCubensisConnectInstalled = true;
                } else {
                    attemptsCount += 1;
                }
            },
            {scheduler: run => setInterval(run, 1000)}
        );
    };

    @action
    setupSynchronizationWithCubensisConnect = () => {
        window['CubensisConnect'].initialPromise
            .then((cubensisApi: any) => {
                this.isCubensisConnectInitialized = true;
                return cubensisApi;
            })
            .then((cubensisApi: { publicState: () => void; }) => cubensisApi.publicState())
            .then((publicState: any) => {
                this.isApplicationAuthorizedInCubensisConnect = true;
                this.updateCubensisConnect(publicState).catch(e => {
                    this.rootStore.notificationStore.notify(e, {type: 'error'});
                    console.error(e);
                });
                this.subscribeToCubensisConnectUpdate();
            })
            .catch((error: ICubensisError) => {
                if (error.code === '14') {
                    this.isApplicationAuthorizedInCubensisConnect = true;
                    this.subscribeToCubensisConnectUpdate();
                } else {
                    this.isApplicationAuthorizedInCubensisConnect = false;
                }
            });
    };


    subscribeToCubensisConnectUpdate() {
        window['CubensisConnect'].on('update', async (publicState: any) => {
            this.updateCubensisConnect(publicState).catch(e => {
                this.rootStore.notificationStore.notify(e, {type: 'error'});
                console.error(e);
            });
        });
    }


    sendTx = (tx: any) => window['CubensisConnect'].signAndPublishTransaction(tx).then(async (tx: any) => {
        const transaction = JSON.parse(tx);
        const {network} = this.rootStore.accountStore;
        const {notificationStore} = this.rootStore
        const link = network ? getExplorerLink(network!.code, transaction.id, 'tx') : undefined;
        console.dir(transaction);
        notificationStore.notify(`Transaction sent: ${transaction.id}\n`, {type: 'info'})

        const res = await waitForTx(transaction.id, {apiBase: network!.server}) as any

        const isFailed = res.applicationStatus && res.applicationStatus === 'script_execution_failed'

        notificationStore.notify(
            isFailed
                ? `Script execution failed`
                : `Success`, {type: isFailed ? 'error' : 'success', link, linkTitle: 'View transaction'}
        )
    }).catch((error: any) => {
        console.error(error);
        this.rootStore.notificationStore.notify(!!error.data ? error.data.toString() : error.data, {type: 'error', title: error.message});
    })


    buildTx = (tx: any) => window['CubensisConnect'].signTransaction(tx).then((tx: any) => JSON.parse(tx)).catch((error: any) => {
        console.error(error);
        this.rootStore.notificationStore.notify(!!error.data ? error.data.toString() : error.data, {type: 'error', title: error.message});
    })

    get isBrowserSupportsCubensisConnect(): boolean {
        const browser = getCurrentBrowser();
        return ['chrome', 'firefox', 'opera', 'edge'].includes(browser);
    }


}


export default CubensisStore;
